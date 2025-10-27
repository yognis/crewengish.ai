'use client';

import { TestTube, TrendingUp, Award, Clock } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { formatRelativeDate } from '@/lib/date-utils';
import type { DashboardStats } from '@/hooks/useDashboardData';

interface EnhancedStatsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export function EnhancedStats({ stats, loading = false }: EnhancedStatsProps) {
  const lastTestText = stats.lastTestDate
    ? formatRelativeDate(stats.lastTestDate)
    : 'Henüz sınav yapmadınız';

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        icon={<TestTube className="h-6 w-6" />}
        label="Toplam Sınav"
        value={stats.totalTests}
        subtitle={`${stats.totalTests} sınav tamamlandı`}
        color="blue"
        loading={loading}
      />

      <StatsCard
        icon={<TrendingUp className="h-6 w-6" />}
        label="Ortalama Puan"
        value={stats.avgScore}
        subtitle={stats.totalTests > 0 ? '100 üzerinden' : 'Henüz sınav yok'}
        color="green"
        loading={loading}
      />

      <StatsCard
        icon={<Award className="h-6 w-6" />}
        label="En İyi Puan"
        value={stats.bestScore}
        subtitle={stats.totalTests > 0 ? 'Rekor puanın' : 'Henüz sınav yok'}
        color="yellow"
        loading={loading}
      />

      <StatsCard
        icon={<Clock className="h-6 w-6" />}
        label="Son Sınav"
        value={stats.totalTests > 0 ? lastTestText : '-'}
        subtitle={stats.totalTests > 0 ? 'Sınav tarihi' : 'İlk sınavını başlat'}
        color="purple"
        loading={loading}
      />
    </div>
  );
}
