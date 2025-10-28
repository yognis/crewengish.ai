'use client';

import { useRouter } from 'next/navigation';
import { Mic, ArrowRight } from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { EnhancedStats } from '@/components/dashboard/EnhancedStats';
import { CreditBalanceCard } from '@/components/dashboard/CreditBalanceCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ScoreChart } from '@/components/dashboard/ScoreChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentTests } from '@/components/dashboard/RecentTests';
import { useDashboardData } from '@/hooks/useDashboardData';
import { formatShortDate } from '@/lib/date-utils';

export default function DashboardPage() {
  const { data, loading, error } = useDashboardData();
  const router = useRouter();

  const firstName = data.profile?.full_name?.split(' ')[0] || 'Kullanıcı';

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 pt-28 pb-16">
          <div className="mx-auto max-w-2xl rounded-xl border-2 border-red-200 bg-white p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-600">Hata Oluştu</h2>
            <p className="mb-6 text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-thy-red px-6 py-2 font-semibold text-white transition hover:bg-thy-darkRed"
            >
              Sayfayı Yenile
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

      <main className="container mx-auto max-w-7xl px-4 pt-28 pb-12 space-y-8">
        {/* Welcome */}
        <section className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Hoş Geldin, {firstName}!</h1>
          <p className="text-gray-600">İngilizce seviyeni geliştirmek için harika bir gün.</p>
        </section>

        {/* Exam CTA */}
        <section>
          <div className="flex flex-col gap-6 rounded-3xl bg-gradient-to-r from-thy-red to-thy-darkRed p-8 text-white shadow-2xl lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Yeni</p>
              <h2 className="mt-2 text-3xl font-bold">İngilizce Konuşma Sınavı</h2>
              <p className="mt-3 text-white/85">
                AI destekli dinamik konuşma sınavı ile gerçek THY mülakat deneyimini simüle et.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                <span>1 Kredi</span>
                <span className="text-white/60">•</span>
                <span>{data.profile?.credits ?? 0} kredin var</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <Mic className="h-8 w-8" />
              </div>
              <button
                onClick={() => router.push('/exam/start')}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-thy-red shadow-lg transition hover:-translate-y-0.5"
              >
                Sınava Başla
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section>
          <EnhancedStats stats={data.stats} loading={loading} />
        </section>

        {/* Credits */}
        <section>
          <CreditBalanceCard credits={data.profile?.credits || 0} loading={loading} />
        </section>

        {/* Chart or Empty */}
        <section>
          {!loading && data.stats.totalTests === 0 ? (
            <EmptyState />
          ) : (
            <ScoreChart data={data.chartData} loading={loading} />
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Hızlı İşlemler</h2>
          <QuickActions totalTests={data.stats.totalTests} />
        </section>

        {/* Recent Tests */}
        {data.stats.totalTests > 0 && (
          <section>
            <RecentTests tests={data.recentTests} totalTests={data.stats.totalTests} loading={loading} />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
