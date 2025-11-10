import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

import { env } from '@/lib/env';
import { getSafeUser } from '@/lib/getSafeUser';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  CATEGORY_SYSTEM_PROMPTS,
  getCategoryDisplayName,
  type SessionCategory,
} from '@/shared/exam-config';
import { SCORING_PROMPT } from '@/shared/scoring-config';

interface ProcessExamPayload {
  sessionId: string;
  questionId: string;
  questionNumber: number;
  questionText: string;
  questionContext?: string | null;
  audioUrl: string;
  transcript: string;
  duration?: number;
}

interface ScoringResult {
  overall_score: number;
  scores: Record<string, number>;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

const SCORING_PRIMARY_MODEL = 'gpt-4o-mini';
const SCORING_FALLBACK_MODEL = 'gpt-4o';
const SCORING_TIMEOUT_MS = 4000;
const SCORING_VERSION = 'v1-timebox-mini';

const NEUTRAL_SCORING: ScoringResult = {
  overall_score: 50,
  scores: {
    fluency: 50,
    grammar: 50,
    vocabulary: 50,
    pronunciation: 50,
    relevance: 50,
  },
  feedback:
    'Tam değerlendirme yapılamadı. Lütfen daha net ve detaylı bir yanıt vererek tekrar deneyin.',
  strengths: ['Yanıt vermeye çalıştınız', 'Cevabınızı geliştirebilirsiniz'],
  improvements: ['Daha net konuşun', 'Daha fazla detay verin'],
};

const wordCount = (input: string): number =>
  input
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const feedbackArraySchema = z
  .array(
    z
      .string()
      .min(1)
      .max(120)
      .refine((value) => wordCount(value) <= 12, {
        message: 'Feedback items must be at most 12 words.',
      })
  )
  .length(2);

const ScoreSchema = z.object({
  scores: z.object({
    fluency: z.number().int().min(0).max(100),
    grammar: z.number().int().min(0).max(100),
    vocabulary: z.number().int().min(0).max(100),
    pronunciation: z.number().int().min(0).max(100),
    relevance: z.number().int().min(0).max(100),
  }),
  feedback: z.object({
    strengths: feedbackArraySchema,
    improvements: feedbackArraySchema,
  }),
});

const NextQuestionSchema = z.object({
  question_text: z.string().min(10).max(700),
  question_context: z.string().max(700).nullable().optional(),
  focus: z.string().max(120).optional(),
});

type NextQuestion = z.infer<typeof NextQuestionSchema>;

function parseNextQuestion(raw: string | object): NextQuestion | null {
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const parsed = NextQuestionSchema.safeParse(data);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function defaultNextQuestion(
  sessionNumber: number,
  nextNumber: number,
  totalQuestions: number
): NextQuestion {
  return {
    question_text:
      'Please describe a recent situation at the airport where you helped a passenger. What happened, what did you say, and what was the result?',
    question_context: 'Professional aviation scenario for Turkish Airlines cabin-crew candidates.',
    focus: 'relevance',
  };
}

function withTimeout<T>(
  factory: (signal: AbortSignal) => Promise<T>,
  ms = SCORING_TIMEOUT_MS
): { exec: Promise<T>; controller: AbortController } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('timeout'), ms);
  const exec = factory(controller.signal).finally(() => clearTimeout(timeoutId));
  return { exec, controller };
}

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

function clampText(s: string, max = 900) {
  if (!s) return s;
  return s.length <= max ? s : s.slice(0, max).trimEnd();
}

function buildScoringPrompt({
  questionText,
  transcript,
  duration,
}: {
  questionText: string;
  transcript: string;
  duration?: number;
}): string {
  return `QUESTION:
"""
${questionText.trim()}
"""

TRANSCRIPT (${duration ? `${Math.round(duration)} seconds` : 'duration unknown'}):
"""
${transcript.trim()}
"""`;
}

function buildNextQuestionPrompt({
  sessionCategory,
  sessionNumber,
  totalQuestions,
  questionNumber,
  questionText,
  transcript,
}: {
  sessionCategory: SessionCategory;
  sessionNumber: number;
  totalQuestions: number;
  questionNumber: number;
  questionText: string;
  transcript: string;
}): string {
  const nextNumber = Math.min(questionNumber + 1, totalQuestions);
  return `We are conducting the Turkish Airlines speaking exam.
Session ${sessionNumber}: ${getCategoryDisplayName(sessionCategory)}.

The last question (${questionNumber}) was:
"""
${questionText.trim()}
"""

Candidate's response transcript:
"""
${transcript.trim()}
"""

Now create the NEXT question (${nextNumber}/${totalQuestions}) in JSON format:
{
  "question_text": "...",
  "question_context": "...", // optional, null if no scenario
  "focus": "What skill/competency this question evaluates"
}

Keep the question professional, relevant to cabin crew work, and aligned with the session category.
Do NOT reference previous questions explicitly.`;
}

function sanitizeQuestionText(input?: string | null): string {
  const value = input?.trim();
  if (!value) {
    return 'Describe a challenging situation you faced at work and how you resolved it.';
  }
  return value.replace(/\s+/g, ' ').slice(0, 700);
}

function sanitizeQuestionContext(input?: string | null): string | null {
  const value = input?.trim();
  if (!value) return null;
  return value.replace(/\s+/g, ' ').slice(0, 700);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { user } = await getSafeUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as ProcessExamPayload;

    const transcriptRaw = typeof body.transcript === 'string' ? body.transcript : '';
    const transcript = clampText(transcriptRaw, 900);

    if (!transcript || transcript.trim().length < 10) {
      return NextResponse.json(
        {
          error: 'TRANSCRIPT_TOO_SHORT',
          message: 'Please speak at least one full sentence (≥10 characters).',
        },
        { status: 400 }
      );
    }

    const {
      sessionId,
      questionId,
      questionNumber,
      questionText,
      questionContext, // not used yet, reserved
      audioUrl,
      duration,
    } = body;

    if (!sessionId || !questionId || !audioUrl || !transcript || !Number.isFinite(questionNumber)) {
      return NextResponse.json({ error: 'Eksik sınav yanıt verisi.' }, { status: 400 });
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('exam_sessions')
      .select('id, user_id, session_number, session_category, total_questions, status')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sınav oturumu bulunamadı.' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Bu oturuma erişim izniniz yok.' }, { status: 403 });
    }

    if (session.status === 'completed' || session.status === 'exited') {
      return NextResponse.json({ error: 'Bu oturum tamamlanmış durumda.' }, { status: 400 });
    }

    const sessionCategory = (session.session_category ?? 'introduction') as SessionCategory;
    const sessionNumber = session.session_number ?? 1;
    const totalQuestions = session.total_questions ?? 5;
    const isLastQuestion = questionNumber >= totalQuestions;

    const operationStart = Date.now();

    const scoringPrompt = buildScoringPrompt({
      questionText,
      transcript,
      duration,
    });

    const nextQuestionPrompt = !isLastQuestion
      ? buildNextQuestionPrompt({
          sessionCategory,
          sessionNumber,
          totalQuestions,
          questionNumber,
          questionText,
          transcript,
        })
      : null;

    let lastScoringError: unknown | null = null;

    const invokeScoring = (model: string, signal?: AbortSignal) =>
      openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: SCORING_PROMPT },
          { role: 'user', content: scoringPrompt },
        ],
        temperature: 0,
        max_tokens: 350,
        response_format: { type: 'json_object' },
        // @ts-ignore AbortSignal supported at runtime
        signal,
      });

    const runScoring = async (
      model: string,
      { timeoutMs }: { timeoutMs?: number } = {}
    ): Promise<{
      completion: Awaited<ReturnType<typeof invokeScoring>> | null;
      timedOut: boolean;
      error: unknown | null;
    }> => {
      if (timeoutMs) {
        const { exec, controller } = withTimeout((signal) => invokeScoring(model, signal), timeoutMs);
        try {
          const completion = await exec;
          const reason = (controller.signal as AbortSignal & { reason?: unknown }).reason;
          return { completion, timedOut: reason === 'timeout', error: null };
        } catch (error) {
          const reason = (controller.signal as AbortSignal & { reason?: unknown }).reason;
          return { completion: null, timedOut: reason === 'timeout', error };
        }
      }

      try {
        const completion = await invokeScoring(model);
        return { completion, timedOut: false, error: null };
      } catch (error) {
        return { completion: null, timedOut: false, error };
      }
    };

    const runScoringWorkflow = async () => {
      let scoring = NEUTRAL_SCORING;
      let scoringModelUsed = SCORING_PRIMARY_MODEL;
      let scoringFallbackUsed = false;
      let scoringTimedOut = false;
      let scoringTokensPrompt: number | null = null;
      let scoringTokensCompletion: number | null = null;
      let scoringFailReason: 'timeout' | 'json_parse' | 'other' | null = null;
      let scoringJsonParseFailed = false;
      let scoringCompletion: Awaited<ReturnType<typeof openai.chat.completions.create>> | null = null;
      let scoringRetriesCount = 0;

      const parseScoring = (content: string): ScoringResult | null => {
        try {
          const parsed = JSON.parse(content);
          const safe = ScoreSchema.safeParse(parsed);
          if (!safe.success) {
            scoringJsonParseFailed = true;
            return null;
          }

          const strengths = safe.data.feedback.strengths;
          const improvements = safe.data.feedback.improvements;

          return {
            overall_score: Math.round(
              (safe.data.scores.fluency +
                safe.data.scores.grammar +
                safe.data.scores.vocabulary +
                safe.data.scores.pronunciation +
                safe.data.scores.relevance) / 5
            ),
            scores: {
              fluency: safe.data.scores.fluency,
              grammar: safe.data.scores.grammar,
              vocabulary: safe.data.scores.vocabulary,
              pronunciation: safe.data.scores.pronunciation,
              relevance: safe.data.scores.relevance,
            },
            feedback: `Güçlü yönler: ${strengths.join(' | ')}. Geliştirme alanları: ${improvements.join(' | ')}.`,
            strengths,
            improvements,
          };
        } catch (error) {
          scoringJsonParseFailed = true;
          console.error('[exam/process] Failed to parse scoring JSON:', error);
          return null;
        }
      };

      const recordUsageFromCompletion = (
        completion: Awaited<ReturnType<typeof openai.chat.completions.create>> | null
      ) => {
        if (!completion || !('usage' in completion) || !completion.usage) {
          return;
        }
        const { prompt_tokens, completion_tokens } = completion.usage;
        if (typeof prompt_tokens === 'number') {
          scoringTokensPrompt = prompt_tokens;
        }
        if (typeof completion_tokens === 'number') {
          scoringTokensCompletion = completion_tokens;
        }
      };

      const scoringStart = performance.now();

      const primaryAttempt = await runScoring(SCORING_PRIMARY_MODEL, { timeoutMs: SCORING_TIMEOUT_MS });
      if (primaryAttempt.completion) {
        scoringCompletion = primaryAttempt.completion;
        recordUsageFromCompletion(primaryAttempt.completion);
      } else {
        if (primaryAttempt.error) {
          lastScoringError = primaryAttempt.error;
          console.error('[exam/process] Primary scoring attempt failed:', primaryAttempt.error);
        }
        if (primaryAttempt.timedOut) scoringTimedOut = true;

        scoringFallbackUsed = true;
        scoringModelUsed = SCORING_FALLBACK_MODEL;
        scoringRetriesCount = Math.max(scoringRetriesCount, 1);

        const fallbackAttempt = await runScoring(SCORING_FALLBACK_MODEL);
        if (fallbackAttempt.completion) {
          scoringCompletion = fallbackAttempt.completion;
          recordUsageFromCompletion(fallbackAttempt.completion);
        } else {
          scoringRetriesCount = Math.max(scoringRetriesCount, 2);
          if (fallbackAttempt.error) {
            lastScoringError = fallbackAttempt.error;
            console.error('[exam/process] Scoring failed after fallback attempt:', fallbackAttempt.error);
          }
          if (fallbackAttempt.timedOut) scoringTimedOut = true;
        }
      }

      if (scoringCompletion) {
        const completionData = scoringCompletion as OpenAI.Chat.Completions.ChatCompletion;
        const raw = completionData.choices[0].message.content ?? '{}';
        const parsed = parseScoring(raw);
        if (parsed) {
          scoring = parsed;
        } else {
          if (!scoringFallbackUsed) {
            scoringFallbackUsed = true;
            scoringModelUsed = SCORING_FALLBACK_MODEL;
            scoringRetriesCount = Math.max(scoringRetriesCount, 1);
            const fallbackAttempt = await runScoring(SCORING_FALLBACK_MODEL);
            if (fallbackAttempt.completion) {
              recordUsageFromCompletion(fallbackAttempt.completion);
              const fallbackData = fallbackAttempt.completion as OpenAI.Chat.Completions.ChatCompletion;
              const fallbackRaw = fallbackData.choices[0].message.content ?? '{}';
              const fallbackParsed = parseScoring(fallbackRaw);
              if (fallbackParsed) {
                scoring = fallbackParsed;
              } else {
                console.warn('[exam/process] Fallback scoring JSON invalid, using neutral scores.');
                scoringRetriesCount = Math.max(scoringRetriesCount, 2);
              }
            } else if (fallbackAttempt.error) {
              scoringRetriesCount = Math.max(scoringRetriesCount, 2);
              lastScoringError = fallbackAttempt.error;
              console.error('[exam/process] Fallback scoring request failed:', fallbackAttempt.error);
            }
            if (fallbackAttempt.timedOut) scoringTimedOut = true;
          } else {
            console.warn('[exam/process] Scoring JSON invalid after fallback, using neutral scores.');
            scoringRetriesCount = Math.max(scoringRetriesCount, 2);
          }
        }
      }

      if (scoring === NEUTRAL_SCORING) {
        if (scoringTimedOut) scoringFailReason = 'timeout';
        else if (scoringJsonParseFailed) scoringFailReason = 'json_parse';
        else if (lastScoringError) scoringFailReason = 'other';
        else scoringFailReason = 'other';
      } else {
        scoringFailReason = null;
      }

      const timing_ms = Math.round(performance.now() - scoringStart);

      return {
        scoring,
        scoringModelUsed,
        scoringFallbackUsed,
        scoringTimedOut,
        scoringTokensPrompt,
        scoringTokensCompletion,
        scoringFailReason,
        timing_ms,
        scoringRetriesCount,
      };
    };

    const runNextQuestionWorkflow = async () => {
      if (!nextQuestionPrompt) {
        return { question: null as NextQuestion | null, timing_ms: 0 };
      }

      const start = performance.now();
      const nextNumber = Math.min(questionNumber + 1, totalQuestions);

      const sanitizeNextQuestion = (question: NextQuestion): NextQuestion => ({
        ...question,
        question_text: sanitizeQuestionText(question.question_text),
        question_context: sanitizeQuestionContext(question.question_context ?? null) ?? null,
      });

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: CATEGORY_SYSTEM_PROMPTS[sessionCategory] },
            { role: 'user', content: nextQuestionPrompt },
          ],
          temperature: 0.7,
          max_tokens: 220,
          response_format: { type: 'json_object' },
        });

        const rawContent = completion.choices[0].message.content ?? '{}';
        let question = parseNextQuestion(rawContent);
        if (!question) {
          console.warn('[exam/process] Next question JSON invalid, falling back to default.');
          question = defaultNextQuestion(sessionNumber, nextNumber, totalQuestions);
        }

        return {
          question: sanitizeNextQuestion(question),
          timing_ms: Math.round(performance.now() - start),
        };
      } catch (error) {
        console.error('[exam/process] Next question generation failed:', error);
        const fallback = sanitizeNextQuestion(defaultNextQuestion(sessionNumber, nextNumber, totalQuestions));
        return { question: fallback, timing_ms: Math.round(performance.now() - start) };
      }
    };

    // Run both in parallel
    const tStart = performance.now();
    const [scoringOutcome, nextQuestionOutcome] = await Promise.all([
      runScoringWorkflow(),
      runNextQuestionWorkflow(),
    ]);
    const tEnd = performance.now();

    console.log(
      '[perf] lat_ms_score=%d lat_ms_nextq=%d total=%d',
      scoringOutcome.timing_ms ?? -1,
      nextQuestionOutcome.timing_ms ?? -1,
      Math.round(tEnd - tStart)
    );

    // Unpack
    const scoring = scoringOutcome.scoring;
    const scoringModelUsed = scoringOutcome.scoringModelUsed;
    const scoringFallbackUsed = scoringOutcome.scoringFallbackUsed;
    const scoringTimedOut = scoringOutcome.scoringTimedOut;
    const scoringTokensPrompt = scoringOutcome.scoringTokensPrompt;
    const scoringTokensCompletion = scoringOutcome.scoringTokensCompletion;
    const scoringRetriesCount = scoringOutcome.scoringRetriesCount;
    let scoringFailReason = scoringOutcome.scoringFailReason; // may be null
    const scoringLatency = scoringOutcome.timing_ms ?? 0;

    const nextQuestion = nextQuestionOutcome.question;
    const nextQuestionLatency = nextQuestionPrompt ? nextQuestionOutcome.timing_ms : null;

    // Persist current question
    const { error: updateQuestionError } = await supabaseAdmin
      .from('exam_questions')
      .update({
        audio_url: audioUrl,
        transcription: transcript,
        scores: scoring.scores ?? null,
        overall_score: scoring.overall_score ?? null,
        feedback: scoring.feedback ?? null,
        strengths: scoring.strengths ?? [],
        improvements: scoring.improvements ?? [],
        submitted_at: new Date().toISOString(),
        scored_at: new Date().toISOString(),
      })
      .eq('id', questionId);

    if (updateQuestionError) {
      console.error('[exam/process] Failed to update question:', updateQuestionError.message);
      return NextResponse.json({ error: 'Yanıt kaydedilemedi.' }, { status: 500 });
    }

    // Upsert next question
    let nextQuestionRecord:
      | { id: string; question_number: number; question_text: string; question_context: string | null }
      | null = null;

    if (!isLastQuestion && nextQuestion) {
      const sanitizedText = sanitizeQuestionText(nextQuestion.question_text);
      const sanitizedContext = sanitizeQuestionContext(nextQuestion.question_context ?? null);

      const { data: upserted, error: upsertError } = await supabaseAdmin
        .from('exam_questions')
        .upsert(
          {
            session_id: sessionId,
            question_number: questionNumber + 1,
            question_text: sanitizedText,
            question_context: sanitizedContext,
            source: 'dynamic',
            bank_question_id: null,
          },
          { onConflict: 'session_id,question_number' }
        )
        .select('id, question_number, question_text, question_context')
        .maybeSingle();

      if (upsertError) {
        console.error('[exam/process] Failed to upsert next question:', upsertError.message);
      } else if (upserted) {
        nextQuestionRecord = upserted;
      } else {
        console.warn('[exam/process] Next question upsert returned no row');
      }
    }

    // Metrics
    const totalLatency = Date.now() - operationStart;
    const latMsTranscribe: number | null = null;

    const metricsPayload = {
      scoring_model: scoringModelUsed,
      scoring_version: SCORING_VERSION,
      lat_ms_transcribe: latMsTranscribe,
      lat_ms_score: scoringLatency,
      lat_ms_nextq: nextQuestionPrompt ? nextQuestionLatency : null,
      lat_ms_total: totalLatency,
      scoring_fallback_used: scoringFallbackUsed,
      scoring_timeout: scoringTimedOut,
      scoring_fail_reason: scoringFailReason,
      scoring_tokens_prompt: scoringTokensPrompt,
      scoring_tokens_completion: scoringTokensCompletion,
      scoring_retries_count: scoringRetriesCount,
    };

    if (isLastQuestion) {
      const { data: questionScores, error: fetchScoresError } = await supabaseAdmin
        .from('exam_questions')
        .select('overall_score')
        .eq('session_id', sessionId);

      let averageScore = scoring.overall_score ?? null;
      if (!fetchScoresError && questionScores) {
        const values = questionScores
          .map((row) => (typeof row.overall_score === 'number' ? row.overall_score : Number(row.overall_score)))
          .filter((value): value is number => Number.isFinite(value));
        if (values.length > 0) {
          const total = values.reduce((acc, curr) => acc + curr, 0);
          averageScore = Math.round(total / values.length);
        }
      }

      const { error: updateSessionError } = await supabaseAdmin
        .from('exam_sessions')
        .update({
          status: 'completed',
          overall_score: averageScore,
          current_question_number: questionNumber,
          completed_at: new Date().toISOString(),
          ...metricsPayload,
        })
        .eq('id', sessionId);

      if (updateSessionError) {
        console.error('[exam/process] Failed to finalize session:', updateSessionError.message);
      }
    } else {
      const { error: sessionProgressError } = await supabaseAdmin
        .from('exam_sessions')
        .update({
          current_question_number: questionNumber + 1,
          ...metricsPayload,
        })
        .eq('id', sessionId);

      if (sessionProgressError) {
        console.error('[exam/process] Failed to bump session progress:', sessionProgressError.message);
      }
    }

    return NextResponse.json({
      transcript,
      audioUrl,
      scoring: {
        overall: scoring.overall_score,
        scores: scoring.scores,
        feedback: scoring.feedback ?? null,
        strengths: scoring.strengths ?? [],
        improvements: scoring.improvements ?? [],
      },
      completed: isLastQuestion,
      nextQuestion: nextQuestionRecord
        ? {
            id: nextQuestionRecord.id,
            questionNumber: nextQuestionRecord.question_number,
            questionText: nextQuestionRecord.question_text,
            questionContext: nextQuestionRecord.question_context,
          }
        : null,
    });
  } catch (error) {
    console.error('[exam/process] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Yanıt işlenirken bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60;
