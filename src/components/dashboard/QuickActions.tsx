'use client';

import { PlayCircle, History, User } from 'lucide-react';
import { QuickActionCard } from './QuickActionCard';

interface QuickActionsProps {
  totalTests: number;
}

export function QuickActions({ totalTests }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <QuickActionCard
        icon={<PlayCircle className="h-6 w-6" />}
        title="Yeni Sınav Başlat"
        description="5 soruyla İngilizce seviyeni ölç"
        buttonText="Sınava Başla"
        href="/exam/start"
        badge="1 kredi"
        primary
      />

      <QuickActionCard
        icon={<History className="h-6 w-6" />}
        title="Sınav Geçmişim"
        description="Geçmiş sınavlarını ve puanlarını gör"
        buttonText="Geçmişi Gör"
        href="/dashboard/history"
        badge={`${totalTests} sınav`}
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
