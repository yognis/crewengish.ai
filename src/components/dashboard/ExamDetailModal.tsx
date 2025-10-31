'use client';

import { X, Trophy, TrendingUp, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { useExamDetail } from '@/hooks/useExamHistory';
import type { ExamSession } from '@/hooks/useExamHistory';

interface ExamDetailModalProps {
  sessionId: string | null;
  onClose: () => void;
}

export function ExamDetailModal({ sessionId, onClose }: ExamDetailModalProps) {
  const { session, responses, loading, error } = useExamDetail(sessionId);

  if (!sessionId) return null;

  const getScoreColor = (score: number | null): string => {
    if (score === null) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (score: number | null): string => {
    if (score === null) return 'bg-gray-300';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-thy-red to-thy-darkRed p-6 text-white flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Sınav Detayları</h2>
              {session && (
                <p className="text-sm text-white/80">
                  {formatDate(session.created_at)}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Kapat"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-thy-red" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {error}
              </div>
            )}

            {!loading && !error && session && (
              <div className="space-y-6">
                {/* Overall Score */}
                {session.status === 'completed' && session.overall_score !== null && (
                  <div className="bg-gradient-to-br from-thy-red/5 to-thy-red/10 border border-thy-red/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-thy-red/10 rounded-lg">
                          <Trophy className="h-6 w-6 text-thy-red" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Genel Performans</h3>
                          <p className="text-sm text-gray-600">Tüm sorular üzerinden</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-4xl font-bold ${getScoreColor(session.overall_score)}`}>
                          {Math.round(session.overall_score)}
                        </div>
                        <div className="text-sm text-gray-500">/ 100</div>
                      </div>
                    </div>

                    {/* Skill Breakdown */}
                    <div className="space-y-3">
                      {[
                        { label: 'Akıcılık', score: session.fluency_score, key: 'fluency' },
                        { label: 'Dilbilgisi', score: session.grammar_score, key: 'grammar' },
                        { label: 'Kelime Dağarcığı', score: session.vocabulary_score, key: 'vocabulary' },
                        { label: 'Telaffuz', score: session.pronunciation_score, key: 'pronunciation' },
                      ].map((skill) => (
                        <div key={skill.key} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">{skill.label}</span>
                            <span className={`font-semibold ${getScoreColor(skill.score)}`}>
                              {skill.score !== null ? `${Math.round(skill.score)}/100` : '-'}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProgressBarColor(skill.score)} transition-all`}
                              style={{ width: skill.score ? `${skill.score}%` : '0%' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exam Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Başlangıç</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {formatDate(session.created_at)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Soru Sayısı</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {session.current_question_number} / {session.total_questions}
                    </p>
                  </div>
                </div>

                {/* Questions & Responses */}
                {responses.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-thy-red" />
                      Sorular ve Cevaplar ({responses.length})
                    </h3>
                    
                    <div className="space-y-4">
                      {responses.map((response, idx) => (
                        <div
                          key={response.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-thy-red text-white text-xs font-semibold">
                                  {response.question_number}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  Soru {response.question_number}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-3">
                                {response.question_text}
                              </p>
                            </div>
                            
                            {response.fluency_score !== null && (
                              <div className={`text-xl font-bold ${getScoreColor(
                                (response.fluency_score + 
                                 (response.grammar_score || 0) + 
                                 (response.vocabulary_score || 0) + 
                                 (response.pronunciation_score || 0)) / 4
                              )} ml-4`}>
                                {Math.round(
                                  (response.fluency_score + 
                                   (response.grammar_score || 0) + 
                                   (response.vocabulary_score || 0) + 
                                   (response.pronunciation_score || 0)) / 4
                                )}
                              </div>
                            )}
                          </div>

                          {/* Transcript */}
                          {response.transcript && (
                            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                              <p className="text-xs font-medium text-gray-600 mb-1">Cevabınız:</p>
                              <p className="text-sm text-gray-800 italic">&quot;{response.transcript}&quot;</p>
                            </div>
                          )}

                          {/* AI Feedback */}
                          {response.feedback && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-xs font-medium text-blue-900 mb-1">AI Geri Bildirimi:</p>
                              <p className="text-sm text-blue-800">{response.feedback}</p>
                            </div>
                          )}

                          {/* Score breakdown */}
                          {response.fluency_score !== null && (
                            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-200">
                              {[
                                { label: 'Akıcılık', score: response.fluency_score },
                                { label: 'Dilbilgisi', score: response.grammar_score },
                                { label: 'Kelime', score: response.vocabulary_score },
                                { label: 'Telaffuz', score: response.pronunciation_score },
                              ].map((skill, i) => (
                                <div key={i} className="text-center">
                                  <div className="text-xs text-gray-500">{skill.label}</div>
                                  <div className={`text-sm font-semibold ${getScoreColor(skill.score)}`}>
                                    {skill.score !== null ? Math.round(skill.score) : '-'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No responses */}
                {!loading && responses.length === 0 && session.status !== 'pending' && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Bu sınav için henüz cevap kaydedilmemiş</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-thy-red hover:bg-thy-darkRed text-white font-semibold rounded-lg transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

