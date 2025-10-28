'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

const SKILL_KEYS = ['fluency', 'grammar', 'vocabulary', 'pronunciation', 'relevance'] as const;

type SkillKey = typeof SKILL_KEYS[number];

type SkillAccumulator = { sum: number; count: number };

interface SessionAggregate {
  overall: SkillAccumulator;
  skills: Record<SkillKey, SkillAccumulator>;
}

interface QuestionRow {
  session_id: string;
  overall_score: number | null;
  scores: Record<string, number> | null;
}

const createEmptyAggregate = (): SessionAggregate => ({
  overall: { sum: 0, count: 0 },
  skills: SKILL_KEYS.reduce((acc, key) => {
    acc[key] = { sum: 0, count: 0 };
    return acc;
  }, {} as Record<SkillKey, SkillAccumulator>),
});

const averageFrom = ({ sum, count }: SkillAccumulator): number | null =>
  count > 0 ? sum / count : null;

const getSkillAverage = (aggregate: SessionAggregate | undefined, key: SkillKey): number | null => {
  if (!aggregate) return null;
  return averageFrom(aggregate.skills[key]);
};

const getOverallAverage = (aggregate: SessionAggregate | undefined): number | null => {
  if (!aggregate) return null;
  return averageFrom(aggregate.overall);
};

const buildAggregates = (rows: QuestionRow[]): Map<string, SessionAggregate> => {
  const aggregates = new Map<string, SessionAggregate>();

  rows.forEach((row) => {
    const aggregate = aggregates.get(row.session_id) ?? createEmptyAggregate();

    if (typeof row.overall_score === 'number') {
      aggregate.overall.sum += row.overall_score;
      aggregate.overall.count += 1;
    }

    const scores = row.scores as Record<string, number> | null;
    SKILL_KEYS.forEach((key) => {
      const value = scores?.[key];
      if (typeof value === 'number') {
        aggregate.skills[key].sum += value;
        aggregate.skills[key].count += 1;
      }
    });

    aggregates.set(row.session_id, aggregate);
  });

  return aggregates;
};

export interface DashboardStats {
  totalTests: number;
  avgScore: number;
  bestScore: number;
  lastTestDate: string | null;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  credits: number;
  department: string;
}

export interface TestSession {
  id: string;
  created_at: string;
  overall_score: number | null;
  fluency_score: number | null;
  grammar_score: number | null;
  vocabulary_score: number | null;
  pronunciation_score: number | null;
  relevance_score: number | null;
  status: string;
}

export interface DashboardData {
  profile: UserProfile | null;
  stats: DashboardStats;
  recentTests: TestSession[];
  chartData: TestSession[];
  examSessions: ExamSummary[];
}

export interface ExamSummary {
  id: string;
  created_at: string;
  status: 'pending' | 'in_progress' | 'completed' | 'exited';
  overall_score: number | null;
}

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({
    profile: null,
    stats: {
      totalTests: 0,
      avgScore: 0,
      bestScore: 0,
      lastTestDate: null,
    },
    recentTests: [],
    chartData: [],
    examSessions: [],
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error('User not authenticated');

        const [
          profileRes,
          completedSessionsRes,
          recentCompletedSessionsRes,
          latestSessionsRes,
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, full_name, email, credits, department')
            .eq('id', user.id)
            .single(),
          supabase
            .from('exam_sessions')
            .select('id, created_at, completed_at, overall_score, status')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .order('created_at', { ascending: false }),
          supabase
            .from('exam_sessions')
            .select('id, created_at, completed_at, overall_score, status')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('exam_sessions')
            .select('id, created_at, status, overall_score')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        if (profileRes.error) throw profileRes.error;
        if (completedSessionsRes.error) throw completedSessionsRes.error;
        if (recentCompletedSessionsRes.error) throw recentCompletedSessionsRes.error;
        if (latestSessionsRes.error) throw latestSessionsRes.error;

        const completedExams = (completedSessionsRes.data || []) as Array<{
          id: string;
          created_at: string;
          completed_at: string | null;
          overall_score: number | null;
          status: string;
        }>;

        const recentCompletedSessions = (recentCompletedSessionsRes.data || []) as Array<{
          id: string;
          created_at: string;
          completed_at: string | null;
          overall_score: number | null;
          status: string;
        }>;

        let aggregates = new Map<string, SessionAggregate>();
        if (recentCompletedSessions.length > 0) {
          const { data: questionRows, error: questionsError } = await supabase
            .from('exam_questions')
            .select('session_id, overall_score, scores')
            .in(
              'session_id',
              recentCompletedSessions.map((session) => session.id)
            );

          if (questionsError) throw questionsError;

          aggregates = buildAggregates((questionRows || []) as QuestionRow[]);
        }

        const toTestSession = (session: {
          id: string;
          created_at: string;
          completed_at: string | null;
          overall_score: number | null;
          status: string;
        }): TestSession => {
          const aggregate = aggregates.get(session.id);
          const overall =
            typeof session.overall_score === 'number'
              ? session.overall_score
              : getOverallAverage(aggregate);

          return {
            id: session.id,
            created_at: session.completed_at || session.created_at,
            overall_score: overall,
            fluency_score: getSkillAverage(aggregate, 'fluency'),
            grammar_score: getSkillAverage(aggregate, 'grammar'),
            vocabulary_score: getSkillAverage(aggregate, 'vocabulary'),
            pronunciation_score: getSkillAverage(aggregate, 'pronunciation'),
            relevance_score: getSkillAverage(aggregate, 'relevance'),
            status: session.status,
          };
        };

        const recentTestSessions = recentCompletedSessions.slice(0, 5).map(toTestSession);
        const chartSessions = recentCompletedSessions.map(toTestSession);

        const stats: DashboardStats = {
          totalTests: completedExams.length,
          avgScore:
            completedExams.length > 0
              ? Math.round(
                  completedExams.reduce(
                    (sum, session) => sum + (session.overall_score || 0),
                    0
                  ) / completedExams.length
                )
              : 0,
          bestScore:
            completedExams.length > 0
              ? Math.round(
                  Math.max(
                    ...completedExams.map((session) => session.overall_score || 0)
                  )
                )
              : 0,
          lastTestDate:
            completedExams.length > 0
              ? completedExams[0].completed_at || completedExams[0].created_at
              : null,
        };

        setData({
          profile: profileRes.data as UserProfile,
          stats,
          recentTests: recentTestSessions,
          chartData: chartSessions,
          examSessions: (latestSessionsRes.data || []) as ExamSummary[],
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [supabase]);

  return { data, loading, error };
}
