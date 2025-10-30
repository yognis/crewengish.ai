'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UseTotalUsersReturn {
  totalUsers: number | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch the total number of registered users from Supabase auth.users
 * Updates in real-time when new users register
 */
export function useTotalUsers(): UseTotalUsersReturn {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchTotalUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Query to count total users from profiles table
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('Supabase count error:', countError);
          throw countError;
        }

        console.log('Total users count:', count);
        setTotalUsers(count ?? 0);
      } catch (err) {
        console.error('Error fetching total users:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        // Set to 0 on error, but you might want to show the last known count
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalUsers();

    // Set up real-time subscription for new user registrations
    const channel = supabase
      .channel('total-users-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          // When a new user is added, refetch the count
          fetchTotalUsers();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { totalUsers, loading, error };
}

/**
 * Format number with thousand separators
 * Example: 1234 -> "1,234" or "1.234" depending on locale
 */
export function formatUserCount(count: number | null): string {
  if (count === null) return '0';

  // Use Turkish locale formatting (1.234 format)
  return count.toLocaleString('tr-TR');
}

/**
 * Hook to fetch today's active users (who took exams today)
 */
export function useTodayActiveUsers() {
  const [activeToday, setActiveToday] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchTodayActiveUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get today's start time (midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        // Count unique users who started exams today
        const { count, error: countError } = await supabase
          .from('exam_sessions')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', todayISO);

        if (countError) {
          console.error('Supabase today active users error:', countError);
          throw countError;
        }

        console.log('Active users today:', count);
        setActiveToday(count ?? 0);
      } catch (err) {
        console.error('Error fetching today active users:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setActiveToday(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayActiveUsers();

    // Set up real-time subscription for new exams today
    const channel = supabase
      .channel('today-active-users')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'exam_sessions',
        },
        () => {
          fetchTodayActiveUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { activeToday, loading, error };
}
