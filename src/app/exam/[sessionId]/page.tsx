'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mic,
  X,
} from 'lucide-react';

import { createClient } from '@/lib/auth-client';
import { useAppStore } from '@/lib/store';
import { ExamAudioRecorder } from '@/components/ExamAudioRecorder';
import { getAudioFileExtension } from '@/lib/audio';

// Use process.env.NEXT_PUBLIC_* directly - Next.js inlines these at build time
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface SessionData {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'exited';
  total_questions: number;
  current_question_number: number;
  overall_score: number | null;
  user_id: string;
}

interface QuestionData {
  id: string;
  question_number: number;
  question_text: string;
  question_context: string | null;
}

interface SubmissionResult {
  transcript: string;
  scoring: {
    overall: number;
    scores: Record<string, number>;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
}

export default function ExamSessionPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { loadProfile } = useAppStore();

  const [session, setSession] = useState<SessionData | null>(null);
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    fetchSessionState();
  }, [params.sessionId]);

  useEffect(() => {
    if (!session || session.status !== 'in_progress') return;

    const handleUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [session]);

  const fetchSessionState = async () => {
    setLoadingSession(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('exam_sessions')
        .select('id,status,total_questions,current_question_number,overall_score,user_id')
        .eq('id', params.sessionId)
        .single();
      if (sessionError || !sessionData) throw sessionError || new Error('Sınav bulunamadı');

      setSession(sessionData as SessionData);

      const targetQuestionNumber = sessionData.current_question_number || 1;
      const { data: questionData, error: questionError } = await supabase
        .from('exam_questions')
        .select('id,question_number,question_text,question_context')
        .eq('session_id', params.sessionId)
        .eq('question_number', targetQuestionNumber)
        .single();
      if (questionError || !questionData) throw questionError || new Error('Soru bulunamadı');

      setQuestion(questionData as QuestionData);
      setRecordedBlob(null);
      setLastResult(null);
    } catch (error: any) {
      console.error('Session fetch error:', error);
      toast.error(error?.message || 'Sınav yüklenemedi.');
    } finally {
      setLoadingSession(false);
    }
  };

  const invokeExamFunction = async (body: Record<string, unknown>) => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase yapılandırması eksik.');
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    };

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/exam-chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    let result: any = null;
    try {
      result = await response.json();
    } catch {
      // Not JSON
    }

    if (!response.ok || result?.error) {
      const error: any = new Error(
        result?.error || `Edge function hatası (HTTP ${response.status}).`
      );
      error.status = response.status;
      error.details = result?.details;
      error.resetIn = result?.resetIn;
      throw error;
    }

    return result;
  };

  const handleSubmitAnswer = async () => {
    if (!session || !question || !recordedBlob) {
      toast.error('Önce yanıtınızı kaydedin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const blobType = recordedBlob.type || 'audio/webm';
      const extension = getAudioFileExtension(blobType);
      const filePath = `${session.user_id}/${session.id}/q${question.question_number}_${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from('test-recordings')
        .upload(filePath, recordedBlob, { contentType: blobType });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('test-recordings').getPublicUrl(filePath);
      const audioUrl = urlData?.publicUrl;

      const result = await invokeExamFunction({
        action: 'SUBMIT_ANSWER',
        sessionId: session.id,
        questionNumber: question.question_number,
        audioUrl,
      });

      setLastResult({
        transcript: result.transcript,
        scoring: result.scoring,
      });

      toast.success(`Puanınız: ${result.scoring.overall}/100`);

      if (result.completed) {
        router.push(`/exam/${session.id}/results`);
      } else if (result.nextQuestion) {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                current_question_number: result.nextQuestion.questionNumber,
              }
            : prev
        );
        setQuestion({
          id: result.nextQuestion.id,
          question_number: result.nextQuestion.questionNumber,
          question_text: result.nextQuestion.questionText,
          question_context: result.nextQuestion.questionContext,
        });
        setRecordedBlob(null);
        setLastResult(null);
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      if (error?.status === 429) {
        const extraDetail =
          typeof error?.details === 'string'
            ? error.details
            : 'Lütfen bekleyin.';
        toast.error(`Çok fazla istek. ${extraDetail}`);
      } else {
        toast.error(error?.message || 'Yanıt gönderilemedi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExitExam = async () => {
    if (!session) return;
    try {
      await invokeExamFunction({
        action: 'EXIT_EXAM',
        sessionId: session.id,
      });
      toast.success('Sınavdan çıktınız.');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Exit error:', error);
      toast.error(error?.message || 'Sınavdan çıkılamadı.');
    }
  };

  if (loadingSession || !session || !question) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-thy-red" />
          <p className="text-gray-600">Sınav yükleniyor...</p>
        </div>
      </div>
    );
  }

  const totalQuestions = Math.max(session.total_questions || 1, 1);
  const currentQuestionNumber = question.question_number;
  const progressLabel = `${currentQuestionNumber}/${totalQuestions}`;
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentQuestionNumber / totalQuestions) * 100)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-thy-red"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              Soru {progressLabel}
            </span>
          </div>
          <button
            onClick={() => setShowExitModal(true)}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Sınavdan Çık
          </button>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">
                Soru {progressLabel}
              </span>
              <span>%{Math.round(progressPercent)} tamamlandı</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-thy-red transition-[width]"
                style={{ width: `${progressPercent}%` }}
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-thy-red px-4 py-1 text-sm font-semibold text-white">
              Soru {question.question_number}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mic className="h-4 w-4" />
              Konuşma
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900">{question.question_text}</h2>
          {question.question_context && (
            <div className="mt-4 rounded-xl border-l-4 border-thy-red bg-red-50 p-4 text-sm text-gray-700">
              <strong>Senaryo:</strong> {question.question_context}
            </div>
          )}

          <div className="mt-8">
            <ExamAudioRecorder
              onRecordingComplete={(blob) => setRecordedBlob(blob)}
              maxDuration={120}
              disabled={isSubmitting}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={handleSubmitAnswer}
              disabled={!recordedBlob || isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-thy-red px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-thy-darkRed disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Değerlendiriliyor...
                </>
              ) : (
                'Cevabı Gönder'
              )}
            </button>
            <p className="text-xs text-gray-500">
              Kaydı gönderdiğinizde AI değerlendirmesi otomatik olarak yapılır.
            </p>
          </div>
        </div>

        {lastResult && (
          <div className="rounded-3xl border border-green-100 bg-green-50 p-6">
            <div className="mb-4 flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Sonuçlar</span>
            </div>
            <p className="text-3xl font-bold text-green-700">{lastResult.scoring.overall}/100</p>
            <p className="mt-2 text-sm text-gray-700">{lastResult.scoring.feedback}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Güçlü Yönler</p>
                <ul className="mt-2 list-inside list-disc text-sm text-gray-700">
                  {lastResult.scoring.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Gelişim Alanları</p>
                <ul className="mt-2 list-inside list-disc text-sm text-gray-700">
                  {lastResult.scoring.improvements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Sınavdan çıkmak üzeresiniz</h3>
            </div>
            <p className="text-sm text-gray-600">
              0 soru cevaplandıysa kredi iade edilir. 1+ soru cevaplandıysa kredi iadesi yapılmaz.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => setShowExitModal(false)}
              >
                Devam Et
              </button>
              <button
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                onClick={handleExitExam}
              >
                Sınavdan Çık
              </button>
            </div>
          </div>
          <button
            className="absolute right-6 top-6 rounded-full bg-white/80 p-2 text-gray-600 hover:bg-white"
            onClick={() => setShowExitModal(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
