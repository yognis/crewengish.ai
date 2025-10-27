'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Award, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

import { createClient } from '@/lib/auth-client';

const SCORE_KEYS = [
  { key: 'fluency', label: 'Akıcılık & Akış' },
  { key: 'grammar', label: 'Dilbilgisi' },
  { key: 'vocabulary', label: 'Kelime Dağarcığı' },
  { key: 'pronunciation', label: 'Telaffuz' },
  { key: 'relevance', label: 'Yanıt Uygunluğu' },
] as const;

interface SessionSummary {
  id: string;
  overall_score: number | null;
  completed_at: string | null;
  total_questions: number;
  status: string;
}

interface QuestionDetail {
  question_number: number;
  question_text: string;
  question_context: string | null;
  transcription: string | null;
  overall_score: number | null;
  scores: Record<string, number> | null;
  feedback: string | null;
  strengths: string[] | null;
  improvements: string[] | null;
}

export default function ExamResultsPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [params.sessionId]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('exam_sessions')
        .select('id, overall_score, completed_at, total_questions, status')
        .eq('id', params.sessionId)
        .single();
      if (sessionError || !sessionData) throw sessionError || new Error('Sınav bulunamadı');
      setSession(sessionData as SessionSummary);

      const { data: questionData, error: questionError } = await supabase
        .from('exam_questions')
        .select('question_number, question_text, question_context, transcription, overall_score, scores, feedback, strengths, improvements')
        .eq('session_id', params.sessionId)
        .order('question_number', { ascending: true });
      if (questionError || !questionData) throw questionError || new Error('Soru detayları alınamadı');

      setQuestions(questionData as QuestionDetail[]);
    } catch (error: any) {
      console.error('Results fetch error:', error);
      toast.error(error?.message || 'Sonuçlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const aggregatedScores = SCORE_KEYS.map(({ key, label }) => {
    const values = questions
      .map((q) => q.scores?.[key])
      .filter((value): value is number => typeof value === 'number');
    const avg =
      values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
    return { label, value: avg };
  });

  const overallStrengths = Array.from(
    new Set(questions.flatMap((q) => q.strengths || []))
  ).slice(0, 5);
  const overallImprovements = Array.from(
    new Set(questions.flatMap((q) => q.improvements || []))
  ).slice(0, 5);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-thy-red" />
          <p className="text-gray-600">Sonuçlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  const overallScore = session.overall_score ?? '—';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 text-sm text-thy-red"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard'a dön
        </button>

        <section className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Sınav Tamamlandı</p>
              <h1 className="mt-3 text-4xl font-bold text-gray-900">Tebrikler! 🎉</h1>
              <p className="mt-2 text-gray-600">
                {session.total_questions} soruluk konuşma sınavını tamamladınız.
              </p>
            </div>
            <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-gradient-to-br from-thy-red to-thy-darkRed text-white shadow-lg">
              <span className="text-sm uppercase text-white/80">Toplam</span>
              <p className="text-4xl font-bold">{overallScore}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-thy-red" />
            <h2 className="text-2xl font-bold text-gray-900">Detaylı Puanlar</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {aggregatedScores.map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-gray-100 p-4">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{value ?? '—'}/100</p>
                <div className="mt-3 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-thy-red transition-all"
                    style={{ width: value ? `${value}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900">Genel Geri Bildirim</h3>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Güçlü Yönler</p>
              <ul className="mt-2 list-inside list-disc text-sm text-gray-600">
                {overallStrengths.length === 0 ? (
                  <li>Veri bulunamadı</li>
                ) : (
                  overallStrengths.map((item) => <li key={item}>{item}</li>)
                )}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Geliştirme Alanları</p>
              <ul className="mt-2 list-inside list-disc text-sm text-gray-600">
                {overallImprovements.length === 0 ? (
                  <li>Veri bulunamadı</li>
                ) : (
                  overallImprovements.map((item) => <li key={item}>{item}</li>)
                )}
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {questions.map((item) => (
            <details
              key={item.question_number}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">
                    Soru {item.question_number}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{item.question_text}</p>
                </div>
                <span className="rounded-full bg-thy-red/10 px-4 py-1 text-sm font-semibold text-thy-red">
                  {item.overall_score ?? '—'}/100
                </span>
              </summary>
              <div className="mt-4 space-y-4 text-sm text-gray-600">
                {item.question_context && (
                  <p className="rounded-xl bg-gray-50 p-3">
                    <strong>Senaryo:</strong> {item.question_context}
                  </p>
                )}
                {item.transcription && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">Transkript</p>
                    <p className="rounded-xl bg-gray-50 p-3">{item.transcription}</p>
                  </div>
                )}
                {item.feedback && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">Geri Bildirim</p>
                    <p className="rounded-xl bg-gray-50 p-3">{item.feedback}</p>
                  </div>
                )}
                {item.scores && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {SCORE_KEYS.map(({ key, label }) => (
                      <div key={key} className="rounded-xl border border-gray-100 p-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {item.scores?.[key] ?? '—'}/100
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </details>
          ))}
        </section>

        <section className="flex flex-col gap-4 sm:flex-row">
          <button
            className="flex-1 rounded-2xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            onClick={() => router.push('/dashboard')}
          >
            Dashboard&apos;a Dön
          </button>
          <button
            className="flex-1 rounded-2xl bg-thy-red px-6 py-3 font-semibold text-white shadow-lg hover:bg-thy-darkRed"
            onClick={() => router.push('/exam/start')}
          >
            Yeni Sınav Başlat
          </button>
        </section>
      </div>
    </div>
  );
}
