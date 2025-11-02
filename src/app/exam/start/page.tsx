'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Clock,
  Lock,
  Unlock,
  Zap,
  Award,
  Target,
  Mic,
  AlertTriangle,
} from 'lucide-react';

import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { SESSION_CONFIGS, type SessionConfig, type SessionCategory } from '@/types/session-categories';

// Use process.env.NEXT_PUBLIC_* directly - Next.js inlines these at build time
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface SessionProgress {
  session_category: SessionCategory | null;
  session_number: number | null;
  overall_score: number | null;
  status: string;
  completed_at: string | null;
}

interface UnlockedSessions {
  unlocked: Set<number>;
  completed: Map<number, { score: number; date: string }>;
}

export default function ExamStartPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { profile, loadProfile, loading } = useAppStore();

  const [starting, setStarting] = useState<number | null>(null);
  const [micGranted, setMicGranted] = useState(false);
  const [checkingSessions, setCheckingSessions] = useState(true);
  const [sessionProgress, setSessionProgress] = useState<UnlockedSessions>({
    unlocked: new Set([1]), // Session 1 always unlocked
    completed: new Map(),
  });

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    fetchSessionProgress();
  }, [profile]);

  useEffect(() => {
    let cancelled = false;
    async function checkMicPermission() {
      if (typeof navigator === 'undefined' || !navigator.permissions) return;
      try {
        const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (!cancelled) {
          setMicGranted(status.state === 'granted');
          status.onchange = () => setMicGranted(status.state === 'granted');
        }
      } catch {
        // silently ignore
      }
    }
    checkMicPermission();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchSessionProgress = async () => {
    if (!profile) return;
    setCheckingSessions(true);
    try {
      const { data: sessions } = await supabase
        .from('exam_sessions')
        .select('session_category, session_number, overall_score, status, completed_at')
        .eq('user_id', profile.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      const unlocked = new Set<number>([1]); // Session 1 always unlocked
      const completed = new Map<number, { score: number; date: string }>();

      if (sessions) {
        sessions.forEach((session: SessionProgress) => {
          const sessionNum = session.session_number;
          const score = session.overall_score || 0;

          // Skip if session number is null
          if (!sessionNum) return;

          // Mark as completed
          if (session.completed_at && score > 0) {
            completed.set(sessionNum, {
              score: Math.round(score),
              date: session.completed_at,
            });
          }

          // Calculate unlock requirements
          if (sessionNum === 1 && score >= 60) unlocked.add(2);
          if (sessionNum === 2 && score >= 65) unlocked.add(3);
          if (sessionNum === 3 && score >= 70) unlocked.add(4);
          if (sessionNum === 4 && score >= 70) unlocked.add(5);
        });
      }

      setSessionProgress({ unlocked, completed });
    } catch (error) {
      console.error('Error fetching session progress:', error);
    } finally {
      setCheckingSessions(false);
    }
  };

  const hasCredits = (profile?.credits ?? 0) > 0;

  const ensureMicrophoneAccess = async () => {
    if (typeof navigator === 'undefined') return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicGranted(true);
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      toast.error('Mikrofon erişimi gerekli. Lütfen izin verin.');
      setMicGranted(false);
      return false;
    }
  };

  const startSession = async (config: SessionConfig) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('━━━ STARTING SESSION', config.sessionNumber, '━━━━');
    }

    if (!hasCredits) {
      toast.error('Sınav başlatmak için yeterli krediniz yok.');
      router.push('/pricing');
      return;
    }

    if (!sessionProgress.unlocked.has(config.sessionNumber)) {
      const requirement = config.unlockRequirement;
      if (requirement.requiresSession && requirement.minScore) {
        toast.error(
          `Bu oturumu açmak için Session ${requirement.requiresSession}'i ${requirement.minScore}+ puanla tamamlamalısınız.`
        );
      }
      return;
    }

    const granted = await ensureMicrophoneAccess();
    if (!granted) {
      return;
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      toast.error('Supabase yapılandırması eksik.');
      return;
    }

    setStarting(config.sessionNumber);
    try {
      const idempotencyKey = crypto.randomUUID();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        toast.error('Oturum bilgisi alınamadı.');
        setStarting(null);
        return;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      if (process.env.NODE_ENV === 'development') {
        console.log('[StartSession] Calling edge function with:', {
          action: 'START_EXAM',
          sessionCategory: config.category,
          sessionNumber: config.sessionNumber,
          totalQuestions: 5,
        });
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/exam-chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'START_EXAM',
          idempotencyKey,
          userId: session.user.id,
          totalQuestions: 5,
          sessionCategory: config.category,
          sessionNumber: config.sessionNumber,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (process.env.NODE_ENV === 'development') {
        console.log('[StartSession] Response status:', response.status);
        console.log('[StartSession] Response ok:', response.ok);
      }

      let result: any = null;
      try {
        const responseText = await response.text();
        if (process.env.NODE_ENV === 'development') {
          console.log('[StartSession] Response text (first 500 chars):', responseText.substring(0, 500));
        }
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[StartSession] Failed to parse response:', parseError);
        console.error('[StartSession] Raw response:', response);
        throw new Error('Geçersiz yanıt alındı. Lütfen tekrar deneyin.');
      }

      if (!response.ok || result?.error) {
        const message = result?.error || result?.details || `Sınav başlatılamadı (HTTP ${response.status}).`;
        console.error('[StartSession] Edge function error:', {
          status: response.status,
          error: result?.error,
          details: result?.details,
          hint: result?.hint,
        });
        throw new Error(message);
      }

      toast.success(`Session ${config.sessionNumber} başladı! Başarılar.`);

      if (result?.sessionId) {
        router.push(`/exam/${result.sessionId}`);
      }
    } catch (error: any) {
      console.error('Session start error:', error);
      if (error.name === 'AbortError') {
        toast.error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
      } else {
        toast.error(error?.message || 'Sınav başlatılamadı.');
      }
    } finally {
      setStarting(null);
    }
  };

  const getUnlockReason = (config: SessionConfig): string | null => {
    if (sessionProgress.unlocked.has(config.sessionNumber)) return null;
    const req = config.unlockRequirement;
    if (req.requiresSession && req.minScore) {
      return `Session ${req.requiresSession}'i ${req.minScore}+ puanla tamamlayın`;
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel */}
      <div className="relative hidden w-2/5 flex-col justify-center bg-gradient-to-br from-thy-red via-thy-darkRed to-red-900 p-12 text-white lg:flex">
        <Link
          href="/dashboard"
          className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>

        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <p className="text-sm uppercase tracking-widest text-white/70 mb-4">CrewEnglish.ai</p>
          <h1 className="text-4xl font-bold mb-4 leading-tight">5 Oturumlu Sınav Sistemi</h1>
          <p className="text-lg text-white/80 mb-10">
            Her biri 5 sorudan oluşan kategorize edilmiş oturumlar. İlerleme bazlı açılım sistemi.
          </p>

          <div className="space-y-4 mb-12">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/15 p-2">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg text-white/90">5 oturum × 5 soru = 25 soru</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/15 p-2">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg text-white/90">Oturum başına 1 kredi</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/15 p-2">
                <Award className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg text-white/90">İlerleme bazlı açılım</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/15 p-2">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg text-white/90">Oturum başına 5-10 dakika</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <Mic className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm text-white/80">Mevcut krediniz</p>
                <p className="text-3xl font-semibold text-white">
                  {loading ? '—' : profile?.credits ?? 0}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full flex-col bg-gray-50 p-6 sm:p-10 lg:w-3/5 lg:overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6 lg:hidden">
            <Link href="/dashboard" className="flex items-center gap-2 text-thy-red font-medium">
              <ArrowLeft className="h-4 w-4" />
              Dashboard&apos;a dön
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sınav Oturumları</h2>
            <p className="text-gray-600">Her oturum 5 sorudan oluşur ve 1 kredi kullanır.</p>
          </div>

          {!hasCredits && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <span>
                Krediniz yok. Sınav başlatmak için{' '}
                <Link href="/pricing" className="font-semibold underline">
                  kredi satın alın
                </Link>
                .
              </span>
            </div>
          )}

          {!micGranted && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              Sınava başlamadan önce mikrofon izni vermelisiniz. Oturum başlatıldığında izin isteyeceğiz.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {SESSION_CONFIGS.map((config) => {
              const isUnlocked = sessionProgress.unlocked.has(config.sessionNumber);
              const isCompleted = sessionProgress.completed.has(config.sessionNumber);
              const completedData = sessionProgress.completed.get(config.sessionNumber);
              const isStarting = starting === config.sessionNumber;
              const unlockReason = getUnlockReason(config);

              return (
                <motion.div
                  key={config.sessionNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: config.sessionNumber * 0.1 }}
                  className={`rounded-2xl border-2 p-6 transition-all ${
                    isUnlocked
                      ? 'border-gray-200 bg-white shadow-lg hover:shadow-xl'
                      : 'border-gray-200 bg-gray-100 opacity-75'
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{config.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            Session {config.sessionNumber}: {config.title}
                          </h3>
                          {isCompleted ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : !isUnlocked ? (
                            <Lock className="h-5 w-5 text-gray-400" />
                          ) : null}
                        </div>
                        <p className="text-sm text-gray-500">{config.difficulty} • {config.duration}</p>
                      </div>
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-gray-600">{config.description}</p>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {config.questionCount} soru
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      1 kredi
                    </span>
                  </div>

                  {isCompleted && completedData && (
                    <div className="mb-4 rounded-lg bg-green-50 p-3">
                      <p className="text-sm font-semibold text-green-800">
                        Son Puan: {completedData.score}/100
                      </p>
                    </div>
                  )}

                  {!isUnlocked && unlockReason && (
                    <div className="mb-4 rounded-lg bg-yellow-50 p-3">
                      <p className="text-sm text-yellow-800">
                        🔒 Kilitli: {unlockReason}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => startSession(config)}
                    disabled={!isUnlocked || !hasCredits || isStarting || checkingSessions}
                    className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
                      isUnlocked && hasCredits
                        ? 'bg-thy-red hover:bg-thy-darkRed text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isStarting
                      ? 'Başlatılıyor...'
                      : isCompleted
                        ? 'Tekrar Dene'
                        : isUnlocked
                          ? 'Oturumu Başlat'
                          : 'Kilitli'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
