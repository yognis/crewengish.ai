import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import OpenAI from 'openai';

import type { Database } from '@/lib/database.types';
import { env } from '@/lib/env';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const forwardedFor = request.headers
      .get('x-forwarded-for')
      ?.split(',')[0]
      ?.trim();
    const ipAddress =
      forwardedFor ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-client-ip') ||
      request.ip;
    const identifier = user?.id || ipAddress || 'anonymous';

    const rateCheck = checkRateLimit(`transcribe:${identifier}`, 10, 60_000);
    const rateLimitHeaders = {
      'X-RateLimit-Limit': '10',
      'X-RateLimit-Remaining': rateCheck.remaining.toString(),
      'X-RateLimit-Reset': rateCheck.resetTime.toString(),
    };

    if (!rateCheck.success) {
      const resetIn = Math.max(
        0,
        Math.ceil((rateCheck.resetTime - Date.now()) / 1000)
      );

      return NextResponse.json(
        {
          error: 'Çok fazla istek. Lütfen bekleyin.',
          details: `${resetIn} saniye sonra tekrar deneyin.`,
          resetIn,
        },
        {
          status: 429,
          headers: rateLimitHeaders,
        }
      );
    }

    // 🔥 FIX: Parse FormData first, then get 'file' (not 'audio')
    const formData = await request.formData();
    const audioFile = formData.get('file') as File | null;

    if (!audioFile) {
      console.error('[TRANSCRIBE] No audio file. FormData keys:', Array.from(formData.keys()));
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    logger.debug('Transcribing audio:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'json',
    });

    logger.debug('Transcription result:', transcription.text);

    return NextResponse.json({
      transcript: transcription.text,
      success: true,
    }, { headers: rateLimitHeaders });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: error?.message || 'Transcription failed' },
      { status: 500 }
    );
  }
}