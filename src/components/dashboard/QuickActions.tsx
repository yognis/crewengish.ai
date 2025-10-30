'use client';

import { PlayCircle, History, Users, User } from 'lucide-react';
import { QuickActionCard } from './QuickActionCard';
import { useTotalUsers, useTodayActiveUsers, formatUserCount } from '@/hooks/useTotalUsers';

interface QuickActionsProps {
  totalTests: number;
}

export function QuickActions({ totalTests }: QuickActionsProps) {
  const { totalUsers, loading: loadingTotal } = useTotalUsers();
  const { activeToday, loading: loadingActive } = useTodayActiveUsers();

  const loading = loadingTotal || loadingActive;

  // Format the badge text
  const userBadge = loading
    ? '...'
    : `${formatUserCount(totalUsers)} üye`;

  // Format description with two lines - Seçenek 2 format
  const communityDescription = loading
    ? 'Yükleniyor...'
    : `${formatUserCount(totalUsers)} üye topluluğumuzda\n🔥 ${formatUserCount(activeToday)} kişi bugün sınav yaptı`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <QuickActionCard
        icon={<PlayCircle className="h-6 w-6" />}
        title="Yeni Sınav Başlat"
        description="20 soruyla İngilizce seviyeni ölç"
        buttonText="Sınava Başla"
        href="/exam/start"
        badge="1 kredi"
        primary
      />

      <QuickActionCard
        icon={<Users className="h-6 w-6" />}
        title="Topluluk"
        description={communityDescription}
        buttonText="Katıl"
        href="/topluluk"
      />

      <QuickActionCard
        icon={<User className="h-6 w-6" />}
        title="Profil Ayarları"
        description="Bilgilerini güncelle"
        buttonText="Profile Git"
        href="/dashboard/profile"
      />
    </div>
  );
}
