'use client';

import { EXAM_CONSTANTS } from '@/constants/exam';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Clock,
  Shield,
  Zap,
  Award,
  Target,
  Mic,
  AlertTriangle,
} from 'lucide-react';

import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

// Use process.env.NEXT_PUBLIC_* directly - Next.js inlines these at build time
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface ExamSession {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'exited';
  current_question_number: number;
  total_questions: number;
}

export default function ExamStartPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { profile, loadProfile, loading } = useAppStore();

  const [starting, setStarting] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [checkingSessions, setCheckingSessions] = useState(true);
  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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

  useEffect(() => {
    let isMounted = true;
    async function fetchActiveSession() {
      if (!profile) return;
      setCheckingSessions(true);
      const { data } = await supabase
        .from('exam_sessions')
        .select('id,status,current_question_number,total_questions')
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (isMounted) {
        setActiveSession((data as ExamSession) || null);
        setCheckingSessions(false);
      }
    }
    fetchActiveSession();
    return () => {
      isMounted = false;
    };
  }, [profile, supabase]);

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

const startExam = async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('━━━ STARTING NEW EXAM ━━━');
    }
    if (!hasCredits) {
      toast.error('Sınav başlatmak için yeterli krediniz yok.');
      console.warn('[StartExam] Not enough credits');
      return;
    }

    const granted = await ensureMicrophoneAccess();
    if (!granted) {
      console.warn('[StartExam] Microphone permission denied');
      return;
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      toast.error('Supabase yapılandırması eksik.');
      console.error('[StartExam] Missing Supabase config');
      return;
    }

    setStarting(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        toast.error('Oturum bilgisi alınamadı.');
        setStarting(false);
        console.error('[StartExam] No user session found');
        return;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[StartExam] Calling exam-chat edge function...');
      }
      const response = await fetch(`${SUPABASE_URL}/functions/v1/exam-chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'START_EXAM',
          idempotencyKey,
          userId: session.user.id,
        }),
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch {
        // Non-JSON response (e.g. HTML error page)
      }

      if (!response.ok || result?.error) {
        const message =
          result?.error || `Sınav başlatılamadı (HTTP ${response.status}).`;
        console.error('[StartExam] Edge function error:', message);
        throw new Error(message);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[StartExam] Response:', result);
        console.log('[StartExam] Session ID:', result?.sessionId);
      }
      
      toast.success('Sınav başladı! Başarılar.');
      
      if (result?.sessionId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[StartExam] Redirecting to exam page...');
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[StartExam] Missing sessionId in response');
        }
      }
      router.push(`/exam/${result.sessionId}`);
    } catch (error: any) {
      console.error('Exam start error:', error);
      toast.error(error?.message || 'Sınav başlatılamadı.');
    } finally {
      setStarting(false);
    }
  };

  const infoItems = [
    { icon: Check, text: `${EXAM_CONSTANTS.MAX_QUESTIONS} konuşma sorusu` },
    { icon: Zap, text: 'Anında AI değerlendirmesi' },
    { icon: Award, text: 'Detaylı geri bildirim' },
    { icon: Target, text: 'THY standartlarına uygun' },
  ];

  const requirements = [
    'Mikrofon erişimi gerekli',
    'Sessiz ortam önerilir',
    'Yaklaşık 10 dakika sürer',
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel */}
      <div className="relative hidden w-2/5 flex-col justify-center bg-gradient-to-br from-thy-red via-thy-darkRed to-red-900 p-12 text-white lg:flex">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Ana Sayfa</span>
        </Link>

        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <p className="text-sm uppercase tracking-widest text-white/70 mb-4">CrewEnglish.ai</p>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            İngilizce Konuşma Sınavı
          </h1>
          <p className="text-lg text-white/80 mb-10">
            AI destekli dinamik sınav sistemi ile gerçek THY mülakat deneyimi.
          </p>

          <div className="space-y-4 mb-12">
            {infoItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="rounded-full bg-white/15 p-2">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg text-white/90">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-white/80" />
              <div>
                <p className="text-sm text-white/80">Ortalama tamamlanma süresi</p>
                <p className="text-2xl font-semibold text-white">~10 dakika</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Güvenli ortam
              </div>
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Mikrofon testi
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full flex-col justify-center bg-gray-50 p-6 sm:p-10 lg:w-3/5">
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-6 lg:hidden">
            <Link href="/dashboard" className="flex items-center gap-2 text-thy-red font-medium">
              <ArrowLeft className="h-4 w-4" />
              Dashboard&apos;a dön
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Konuşma Sınavı</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">Sınava Başla</h2>
                <p className="mt-2 text-gray-600">20 sorudan oluşan konuşma sınavı</p>
              </div>
              <div className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-thy-red shadow-inner">
                1 Kredi
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Mevcut krediniz</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '—' : profile?.credits ?? 0}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {requirements.map((req) => (
                <div key={req} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-gray-700">
                  <Check className="h-4 w-4 text-green-500" />
                  {req}
                </div>
              ))}
            </div>

            {activeSession && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                Devam eden bir sınavınız var. Kaldığınız yerden devam etmek için{' '}
                <button
                  onClick={() => router.push(`/exam/${activeSession.id}`)}
                  className="font-semibold underline"
                >
                  buraya tıklayın.
                </button>
              </div>
            )}

            {!micGranted && (
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                Sınava başlamadan önce mikrofon izni vermelisiniz. &quot;Sınava Başla&quot; butonuna
                tıkladığınızda izin isteyeceğiz.
              </div>
            )}

            <button
              onClick={startExam}
              disabled={!hasCredits || starting || checkingSessions}
              className="flex w-full items-center justify-center rounded-xl bg-thy-red py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-thy-darkRed disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              {starting ? 'Sınav başlatılıyor...' : hasCredits ? 'Sınava Başla' : 'Yetersiz Kredi'}
            </button>

            <p className="mt-4 text-center text-sm text-gray-500">
              Geri dönmek için{' '}
              <Link href="/dashboard" className="font-medium text-thy-red hover:underline">
                Dashboard&apos;a dön
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
