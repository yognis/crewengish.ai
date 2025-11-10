'use client';

import { useEffect, useState } from 'react';

import { getSafeUser } from '@/lib/getSafeUser';
import { createClient } from '@/lib/supabase/client';

export interface ExamSession {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'exited';
  current_question_number: number;
  total_questions: number;
  overall_score: number | null;
  fluency_score?: number | null;
  grammar_score?: number | null;
  vocabulary_score?: number | null;
  pronunciation_score?: number | null;
  relevance_score?: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ExamResponse {
  id: string;
  session_id: string;
  question_number: number;
  question_text: string;
  audio_url: string | null;
  transcript: string | null;
  fluency_score: number | null;
  grammar_score: number | null;
  vocabulary_score: number | null;
  pronunciation_score: number | null;
  relevance_score: number | null;
  feedback: string | null;
  created_at: string;
}

export interface HistoryStats {
  totalExams: number;
  completedExams: number;
  averageScore: number;
  bestScore: number;
  totalDuration: number; // in seconds
  lastExamDate: string | null;
}

export interface HistoryFilters {
  status?: 'all' | 'completed' | 'in_progress' | 'exited';
  dateRange?: '7days' | '30days' | '3months' | 'all';
  sortBy?: 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc';
}

interface UseExamHistoryReturn {
  sessions: ExamSession[];
  stats: HistoryStats;
  loading: boolean;
  error: string | null;
  filters: HistoryFilters;
  setFilters: (filters: HistoryFilters) => void;
  refetch: () => void;
}

export function useExamHistory(): UseExamHistoryReturn {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [stats, setStats] = useState<HistoryStats>({
    totalExams: 0,
    completedExams: 0,
    averageScore: 0,
    bestScore: 0,
    totalDuration: 0,
    lastExamDate: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HistoryFilters>({
    status: 'all',
    dateRange: 'all',
    sortBy: 'date_desc',
  });

  const supabase = createClient();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { user } = await getSafeUser(supabase);
      if (!user) {
        setSessions([]);
        setStats({
          totalExams: 0,
          completedExams: 0,
          averageScore: 0,
          bestScore: 0,
          totalDuration: 0,
          lastExamDate: null,
        });
        setLoading(false);
        return;
      }

      // Build query based on filters
      let query = supabase
        .from('exam_sessions')
        .select('*')
        .eq('user_id', user.id);

      // Status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (filters.dateRange) {
          case '7days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '3months':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      // Sorting
      switch (filters.sortBy) {
        case 'date_desc':
          query = query.order('created_at', { ascending: false });
          break;
        case 'date_asc':
          query = query.order('created_at', { ascending: true });
          break;
        case 'score_desc':
          query = query.order('overall_score', { ascending: false, nullsFirst: false });
          break;
        case 'score_asc':
          query = query.order('overall_score', { ascending: true, nullsFirst: true });
          break;
      }

      const { data: sessionsData, error: sessionsError } = await query;

      if (sessionsError) throw sessionsError;

      const allSessions = (sessionsData || []) as ExamSession[];
      setSessions(allSessions);

      // Calculate stats from all sessions (not filtered)
      const allSessionsQuery = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('user_id', user.id);

      const allSessionsData = (allSessionsQuery.data || []) as ExamSession[];
      
      const completedSessions = allSessionsData.filter(s => s.status === 'completed');
      const scoresWithValues = completedSessions
        .map(s => s.overall_score)
        .filter((score): score is number => score !== null);

      const calculatedStats: HistoryStats = {
        totalExams: allSessionsData.length,
        completedExams: completedSessions.length,
        averageScore: scoresWithValues.length > 0
          ? Math.round(scoresWithValues.reduce((sum, score) => sum + score, 0) / scoresWithValues.length)
          : 0,
        bestScore: scoresWithValues.length > 0
          ? Math.round(Math.max(...scoresWithValues))
          : 0,
        totalDuration: 0, // We don't have duration in exam_sessions, would need to calculate from responses
        lastExamDate: completedSessions.length > 0
          ? completedSessions[0].completed_at || completedSessions[0].created_at
          : null,
      };

      setStats(calculatedStats);
    } catch (err) {
      console.error('Error fetching exam history:', err);
      setError(err instanceof Error ? err.message : 'Veri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filters]); // Refetch when filters change

  return {
    sessions,
    stats,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchHistory,
  };
}

// Hook to get detailed exam results
export function useExamDetail(sessionId: string | null) {
  const [session, setSession] = useState<ExamSession | null>(null);
  const [responses, setResponses] = useState<ExamResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      setResponses([]);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const [sessionRes, responsesRes] = await Promise.all([
          supabase
            .from('exam_sessions')
            .select('*')
            .eq('id', sessionId)
            .single(),
          supabase
            .from('exam_responses')
            .select('*')
            .eq('session_id', sessionId)
            .order('question_number', { ascending: true }),
        ]);

        if (sessionRes.error) throw sessionRes.error;
        if (responsesRes.error) throw responsesRes.error;

        setSession(sessionRes.data as ExamSession);
        setResponses((responsesRes.data || []) as ExamResponse[]);
      } catch (err) {
        console.error('Error fetching exam detail:', err);
        setError(err instanceof Error ? err.message : 'Detaylar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [sessionId, supabase]);

  return { session, responses, loading, error };
}

