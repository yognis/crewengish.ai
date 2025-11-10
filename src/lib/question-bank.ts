// =============================================================================
// CREWENGLISH.AI - QUESTION BANK (Prod-safe Hybrid)
// - Read: anon/auth *server* client
// - Write usage stats: service-role (admin) via SECURITY DEFINER RPC
// - RPCs expected: random_questions(p_section text, p_count int),
//                  update_question_usage(p_question_ids uuid[])
// =============================================================================

import { createClient as createServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { SessionCategory } from '@/shared/exam-config';

export interface ExamQuestion {
  id: string;
  section: SessionCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  question_text_turkish?: string | null;
  expected_keywords?: string[] | null;
  evaluation_focus?: Record<string, number> | null;
  times_used?: number | null;
  avg_score?: number | null;
  last_used_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Hybrid selector:
 * 1) Try DB (RPC: random_questions)
 * 2) If not enough, return null => caller falls back to dynamic generation
 */
export async function selectExamQuestions(
  sessionCategory: SessionCategory,
  count = 5
): Promise<ExamQuestion[] | null> {
  try {
    const supabase = createServerClient(); // server-only client (no await)

    const { data, error } = await supabase.rpc('random_questions', {
      p_section: sessionCategory,
      p_count: count,
    });

    if (error) {
      console.error(`[QUESTION_BANK] RPC random_questions error for ${sessionCategory}:`, error);
      return null;
    }

    if (!data || data.length < count) {
      console.warn(
        `[QUESTION_BANK] Insufficient questions for ${sessionCategory} (need ${count}, have ${data?.length ?? 0})`
      );
      return null;
    }

    // Fire-and-forget usage update with admin (service_role)
    const ids: string[] = (data as { id?: string }[])
      .map((q) => q.id)
      .filter((v): v is string => Boolean(v));

    if (ids.length) {
      // do not await; best-effort
      void supabaseAdmin
        .rpc('update_question_usage', { p_question_ids: ids })
        .then(
          () => console.log(`[QUESTION_BANK] Updated usage for ${ids.length} questions`),
          (e) => console.error('[QUESTION_BANK] Usage update failed:', e)
        );
    }

    console.log(`[QUESTION_BANK] ✅ Selected ${data.length} questions for ${sessionCategory}`);
    return data as ExamQuestion[];
  } catch (e) {
    console.error('[QUESTION_BANK] Unexpected error in selectExamQuestions:', e);
    return null;
  }
}

/** Lightweight availability check (used for gating/UI if needed) */
export async function hasEnoughQuestions(
  sessionCategory: SessionCategory,
  requiredCount = 5
): Promise<boolean> {
  try {
    const supabase = createServerClient();

    const { count, error } = await supabase
      .from('exam_questions_bank')
      .select('id', { count: 'exact', head: true })
      .eq('section', sessionCategory);

    if (error) {
      console.error(`[QUESTION_BANK] Count error for ${sessionCategory}:`, error);
      return false;
    }

    const ok = (count ?? 0) >= requiredCount;
    console.log(
      `[QUESTION_BANK] ${sessionCategory}: ${count ?? 0}/${requiredCount} → ${ok ? 'OK' : 'LOW'}`
    );
    return ok;
  } catch (e) {
    console.error('[QUESTION_BANK] Unexpected error in hasEnoughQuestions:', e);
    return false;
  }
}

export type QuestionBankStats = {
  [K in SessionCategory]?: {
    total: number;
    byDifficulty: { easy: number; medium: number; hard: number };
  };
};

/** Optional: aggregate stats for admin dashboards */
export async function getQuestionBankStats(): Promise<QuestionBankStats | null> {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('exam_questions_bank')
      .select('section, difficulty');

    if (error) {
      console.error('[QUESTION_BANK] Stats error:', error);
      return null;
    }

    const stats: QuestionBankStats = {};

    (data ?? []).forEach(
      (row: { section: SessionCategory; difficulty: 'easy' | 'medium' | 'hard' }) => {
        stats[row.section] ??= {
          total: 0,
          byDifficulty: { easy: 0, medium: 0, hard: 0 },
        };
        stats[row.section]!.total++;
        stats[row.section]!.byDifficulty[row.difficulty]++;
      }
    );

    return stats;
  } catch (e) {
    console.error('[QUESTION_BANK] Unexpected error in getQuestionBankStats:', e);
    return null;
  }
}

// NOTE: This module is server-only. Never import it in React client components.

