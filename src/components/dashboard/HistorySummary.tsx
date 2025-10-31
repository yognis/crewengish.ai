import { Calendar, Target, Trophy, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { HistoryStats } from '@/hooks/useExamHistory';

interface HistorySummaryProps {
  stats: HistoryStats;
}

export function HistorySummary({ stats }: HistorySummaryProps) {
  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '0 dk';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} saat ${minutes} dk`;
    }
    return `${minutes} dk`;
  };

  const formatLastDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Henüz yok';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: tr });
    } catch {
      return 'Bilinmiyor';
    }
  };

  const statCards = [
    {
      icon: Target,
      label: 'Toplam Sınav',
      value: stats.totalExams.toString(),
      subValue: `${stats.completedExams} tamamlandı`,
      color: 'bg-blue-500',
    },
    {
      icon: Trophy,
      label: 'Ortalama Puan',
      value: stats.averageScore > 0 ? `${stats.averageScore}/100` : '-',
      subValue: stats.bestScore > 0 ? `En yüksek: ${stats.bestScore}` : '',
      color: 'bg-thy-red',
    },
    {
      icon: Clock,
      label: 'Toplam Süre',
      value: formatDuration(stats.totalDuration),
      subValue: stats.completedExams > 0 ? `${stats.completedExams} sınav` : '',
      color: 'bg-green-500',
    },
    {
      icon: Calendar,
      label: 'Son Sınav',
      value: formatLastDate(stats.lastExamDate),
      subValue: stats.lastExamDate ? new Date(stats.lastExamDate).toLocaleDateString('tr-TR') : '',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.color}/10`}>
              <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            {stat.subValue && (
              <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

