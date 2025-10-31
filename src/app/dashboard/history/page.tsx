'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HistorySummary } from '@/components/dashboard/HistorySummary';
import { HistoryFilters } from '@/components/dashboard/HistoryFilters';
import { ExamHistoryCard } from '@/components/dashboard/ExamHistoryCard';
import { ExamDetailModal } from '@/components/dashboard/ExamDetailModal';
import { HistoryEmptyState } from '@/components/dashboard/HistoryEmptyState';
import { useExamHistory } from '@/hooks/useExamHistory';

export default function HistoryPage() {
  const router = useRouter();
  const { sessions, stats, loading, error, filters, setFilters, refetch } = useExamHistory();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const hasFilters = filters.status !== 'all' || filters.dateRange !== 'all';

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="bg-white border-2 border-red-200 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Hata Oluştu</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-thy-red hover:bg-thy-darkRed text-white font-semibold rounded-lg transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-thy-red hover:text-thy-darkRed font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sınav Geçmişim</h1>
          <p className="text-gray-600">
            Tüm speaking sınavlarınızın detaylı sonuçlarını görüntüleyin
          </p>
        </div>

        {loading ? (
          // Loading State
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-thy-red mx-auto mb-4" />
              <p className="text-gray-600">Sınav geçmişiniz yükleniyor...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Statistics */}
            <HistorySummary stats={stats} />

            {/* Filters */}
            {stats.totalExams > 0 && (
              <HistoryFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            )}

            {/* Exam List */}
            {sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <ExamHistoryCard
                    key={session.id}
                    session={session}
                    onClick={() => setSelectedSessionId(session.id)}
                  />
                ))}
              </div>
            ) : (
              <HistoryEmptyState
                hasFilters={hasFilters}
                onClearFilters={() => setFilters({ status: 'all', dateRange: 'all', sortBy: 'date_desc' })}
              />
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Detail Modal */}
      <ExamDetailModal
        sessionId={selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
      />
    </div>
  );
}
