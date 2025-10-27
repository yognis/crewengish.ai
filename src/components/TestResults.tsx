'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  PartyPopper,
  RefreshCw,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ScoreMap {
  fluency: number;
  grammar: number;
  vocabulary: number;
  pronunciation: number;
}

interface QuestionResult {
  question: string;
  transcript: string;
  feedback: string;
  score: number;
  scores?: ScoreMap;
}

export interface TestResultsProps {
  overallScore: number;
  scores: ScoreMap;
  questionResults: QuestionResult[];
  onRetakeTest: () => void;
  onBuyCredits: () => void;
}

const scoreMessages = [
  {
    min: 80,
    message: 'Mükemmel! Havacılık İngilizceniz çok iyi.',
  },
  {
    min: 60,
    message: 'İyi iş! Birkaç alanda gelişim gösterebilirsiniz.',
  },
  {
    min: 40,
    message: 'Devam edin! Pratikle daha iyi olacaksınız.',
  },
  {
    min: 0,
    message: 'Daha fazla çalışma gerekiyor. Pratik yapın!',
  },
];

const categoryLabels: Record<keyof ScoreMap, string> = {
  fluency: 'Akıcılık',
  grammar: 'Dilbilgisi',
  vocabulary: 'Kelime Hazinesi',
  pronunciation: 'Telaffuz',
};

const brandColors = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

const getScoreMessage = (score: number) => {
  const found = scoreMessages.find((item) => score >= item.min);
  return found?.message ?? '';
};

const getScoreColor = (score: number) => {
  if (score >= 80) return brandColors.success;
  if (score >= 60) return brandColors.warning;
  return brandColors.error;
};

const getBadgeTone = (score: number) => {
  if (score >= 80) return 'bg-[#ECFDF5] text-[#047857]';
  if (score >= 60) return 'bg-[#FEF3C7] text-[#B45309]';
  if (score >= 40) return 'bg-[#FEF3C7] text-[#B45309]';
  return 'bg-[#FEE2E2] text-[#B91C1C]';
};

export default function TestResults({
  overallScore,
  scores,
  questionResults,
  onRetakeTest,
  onBuyCredits,
}: TestResultsProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [animateBars, setAnimateBars] = useState(false);
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  useEffect(() => {
    let animationFrame: number;
    let startTime: number | null = null;
    const duration = 1000;

    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayScore(Math.round(progress * overallScore));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [overallScore]);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimateBars(true), 150);
    return () => clearTimeout(timeout);
  }, [scores]);

  const message = useMemo(() => getScoreMessage(overallScore), [overallScore]);

  const categories = useMemo(
    () =>
      (Object.keys(scores) as Array<keyof ScoreMap>).map((key) => ({
        key,
        label: categoryLabels[key],
        value: scores[key],
        color: getScoreColor(scores[key]),
      })),
    [scores]
  );

  const toggleAccordion = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E0EAFF] px-5 py-2 text-sm font-semibold text-[#3B82F6] uppercase tracking-wide">
            <PartyPopper className="h-4 w-4" />
            Test Sonuçlarınız
          </div>

          <div className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-full border-8 border-[#3B82F6]/20 bg-white shadow-xl">
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]" />
            <div className="relative flex flex-col items-center justify-center text-white">
              <span className="text-5xl font-black leading-tight">
                {displayScore}
              </span>
              <span className="text-sm font-medium uppercase tracking-wide text-white/80">
                /100
              </span>
            </div>
          </div>

          <p className="mx-auto max-w-xl text-lg font-semibold text-[#111827]">
            {message}
          </p>
        </div>

        <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-md sm:p-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#111827]">
              Puan Dağılımı
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getBadgeTone(
                overallScore
              )}`}
            >
              Ortalama Puan: {overallScore}
            </span>
          </div>

          <div className="grid gap-4">
            {categories.map(({ key, label, value, color }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium text-[#374151]">
                  <span>{label}</span>
                  <span className="text-[#111827]">{value}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: animateBars ? `${value}%` : '0%',
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
          <h3 className="mb-4 text-lg font-semibold text-[#111827]">
            Soru Detayları
          </h3>
          <div className="space-y-4">
            {questionResults.map((item, index) => {
              const isOpen = openIndexes.includes(index);
              return (
                <div
                  key={`${item.question}-${index}`}
                  className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm transition hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#3B82F6]">
                        Soru {index + 1}
                      </p>
                      <p className="text-base font-medium text-[#111827]">
                        {item.question}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${getBadgeTone(
                          item.score
                        )}`}
                      >
                        {item.score}/100
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-[#6B7280]" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-[#6B7280]" />
                      )}
                    </div>
                  </button>

                  <div
                    className={`grid overflow-hidden px-5 transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-screen pb-5' : 'max-h-0'
                    }`}
                  >
                    {isOpen && (
                      <div className="space-y-4 text-sm text-[#4B5563]">
                        <div className="rounded-lg bg-[#F9FAFB] p-4">
                          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                            Transkript
                          </h4>
                          <p className="leading-relaxed">{item.transcript}</p>
                        </div>
                        <div className="rounded-lg bg-[#ECFDF5] p-4">
                          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#047857]">
                            Geri Bildirim
                          </h4>
                          <p className="leading-relaxed text-[#065F46]">
                            {item.feedback}
                          </p>
                        </div>
                        {item.scores && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {(Object.keys(item.scores) as Array<
                              keyof ScoreMap
                            >).map((key) => (
                              <div
                                key={key}
                                className="flex items-center justify-between rounded-lg bg-[#F3F4F6] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#4B5563]"
                              >
                                <span>{categoryLabels[key]}</span>
                                <span>{item.scores?.[key]}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-md sm:grid-cols-2 sm:p-8">
          <button
            type="button"
            onClick={onRetakeTest}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-6 py-4 text-sm font-semibold text-white shadow transition hover:bg-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
          >
            <RefreshCw className="h-5 w-5" />
            Tekrar Test Çöz
          </button>
          <button
            type="button"
            onClick={onBuyCredits}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#3B82F6] bg-white px-6 py-4 text-sm font-semibold text-[#3B82F6] transition hover:bg-[#E0EAFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
          >
            <CreditCard className="h-5 w-5" />
            Kredi Satın Al
          </button>
        </div>
      </div>
    </div>
  );
}
