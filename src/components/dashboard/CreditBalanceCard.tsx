'use client';

import { Coins, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface CreditBalanceCardProps {
  credits: number;
  loading?: boolean;
}

export function CreditBalanceCard({ credits, loading = false }: CreditBalanceCardProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-thy-red/20 rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <div className="h-4 w-48 bg-white/60 rounded animate-pulse mb-4" />
            <div className="h-16 w-32 bg-white/60 rounded animate-pulse mb-2" />
            <div className="h-4 w-40 bg-white/60 rounded animate-pulse" />
          </div>
          <div className="bg-white/60 p-4 rounded-full animate-pulse">
            <div className="h-12 w-12" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-12 bg-white/60 rounded-lg animate-pulse" />
          <div className="flex-1 h-12 bg-white/60 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const creditBadge = credits >= 5
    ? { text: 'Yeterli Kredi ✓', color: 'bg-green-100 text-green-700 border-green-300' }
    : credits >= 1
    ? { text: 'Az Kredi Kaldı ⚠️', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' }
    : { text: 'Kredi Bitti! 💳', color: 'bg-red-100 text-red-700 border-red-300' };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-thy-red/20 rounded-xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">Mevcut Kredi Bakiyeniz</p>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-5xl font-bold text-gray-900">{credits}</p>
            <p className="text-lg text-gray-600">kredi</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-xs font-medium px-3 py-1 rounded-full border', creditBadge.color)}>
              {creditBadge.text}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            {credits > 0 ? `${credits} sınav yapabilirsiniz` : 'Sınav yapmak için kredi satın alın'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Her sınav 1 kredi harcar</p>
        </div>
        <div className="bg-white/80 p-4 rounded-full">
          <Coins className="h-12 w-12 text-thy-red" />
        </div>
      </div>

      <div className="flex gap-3">
        {credits > 0 && (
          <button
            onClick={() => router.push('/exam/start')}
            className="flex-1 bg-thy-red hover:bg-thy-darkRed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl"
          >
            Sınav Başlat
          </button>
        )}
        <button
          onClick={() => router.push('/pricing')}
          className={cn(
            'font-semibold py-3 px-6 rounded-lg transition-all duration-300 border-2',
            credits > 0
              ? 'flex-1 border-thy-red text-thy-red hover:bg-thy-red hover:text-white'
              : 'flex-1 bg-thy-red hover:bg-thy-darkRed text-white border-thy-red shadow-md hover:shadow-xl'
          )}
        >
          <ShoppingCart className="inline-block h-4 w-4 mr-2" />
          Kredi Satın Al
        </button>
      </div>
    </div>
  );
}
