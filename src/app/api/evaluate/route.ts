import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import OpenAI from 'openai';

import type { Database } from '@/lib/database.types';
import { env } from '@/lib/env';
import { checkRateLimit } from '@/lib/rate-limit';
import { EXAM_CONSTANTS } from '@/constants/exam';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

interface EvaluationRequest {
  question: string;
  transcript: string;
  duration: number;
}

interface EvaluationResult {
  overallScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  pronunciationScore: number;
  feedback: string;
}

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

    const rateCheck = checkRateLimit(`evaluate:${identifier}`);
    const rateLimitHeaders = {
      'X-RateLimit-Limit': EXAM_CONSTANTS.RATE_LIMIT_REQUESTS.toString(),
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

    const body: EvaluationRequest = await request.json();
    const { question, transcript, duration } = body;

    if (!question || !transcript) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const evaluationPrompt = `You are an expert English language evaluator for Turkish Airlines employees. Evaluate the following speaking test response according to THY internal English proficiency standards.

QUESTION: ${question}

RESPONSE TRANSCRIPT: ${transcript}

RESPONSE DURATION: ${duration} seconds

Evaluate on these criteria (0-100 scale):

1. FLUENCY & COHERENCE (25%): Natural flow, minimal hesitation, logical structure
2. GRAMMAR ACCURACY (25%): Correct tenses, sentence structure, articles
3. VOCABULARY RANGE (25%): Aviation/corporate terminology, appropriate word choice
4. PRONUNCIATION (25%): Clarity, Turkish accent impact on intelligibility

Provide your evaluation in JSON format:
{
  "fluencyScore": 0-100,
  "grammarScore": 0-100,
  "vocabularyScore": 0-100,
  "pronunciationScore": 0-100,
  "feedback": "Detailed feedback in Turkish (2-3 sentences covering strengths and specific areas for improvement)"
}

Consider:
- For Turkish speakers: Common issues include article usage, present perfect tense, and th/v sounds
- Aviation context: Technical vocabulary usage, professional communication standards
- Response relevance: Did they answer the question appropriately?
- Response length: Adequate development of ideas

Be constructive but realistic in scoring. THY requires B2-C1 level English for most positions.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert English language evaluator specializing in aviation and corporate English for Turkish speakers.',
        },
        {
          role: 'user',
          content: evaluationPrompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const evaluation = JSON.parse(
      completion.choices[0].message.content || '{}'
    );

    const overallScore = Math.round(
      (evaluation.fluencyScore * 0.25 +
        evaluation.grammarScore * 0.25 +
        evaluation.vocabularyScore * 0.25 +
        evaluation.pronunciationScore * 0.25)
    );

    const result: EvaluationResult = {
      overallScore,
      fluencyScore: evaluation.fluencyScore,
      grammarScore: evaluation.grammarScore,
      vocabularyScore: evaluation.vocabularyScore,
      pronunciationScore: evaluation.pronunciationScore,
      feedback: evaluation.feedback,
    };

    return NextResponse.json(result, { headers: rateLimitHeaders });
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: 'Evaluation failed' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
