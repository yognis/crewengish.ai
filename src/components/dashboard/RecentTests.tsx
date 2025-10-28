'use client';

import { useState } from 'react';
import { Eye, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ScoreBadge } from './ScoreBadge';
import { formatShortDate } from '@/lib/date-utils';
import type { TestSession } from '@/hooks/useDashboardData';

interface RecentTestsProps {
  tests: TestSession[];
  totalTests: number;
  loading?: boolean;
}

export function RecentTests({ tests, totalTests, loading = false }: RecentTestsProps) {
  const router = useRouter();
  const [selectedTest, setSelectedTest] = useState<TestSession | null>(null);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Tarih', 'Kategori', 'Genel', 'Akıcılık', 'Dilbilgisi', 'Kelime', 'Telaffuz', 'Detay'].map((header, i) => (
                  <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-gray-200">
                  {Array(8).fill(0).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty state
  if (tests.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600 mb-4">Henüz sınav yapmadınız</p>
        <button
          onClick={() => router.push('/exam/start')}
          className="bg-thy-red hover:bg-thy-darkRed text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
        >
          İlk sınavını başlat
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Son Sınavlarım</h3>
        <p className="text-sm text-gray-600">Son 5 sınavın sonuçları</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Genel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akıcılık
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dilbilgisi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kelime
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telaffuz
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detay
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tests.map((test, index) => (
              <tr
                key={test.id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatShortDate(test.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Konuşma
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ScoreBadge score={test.overall_score ?? 0} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Math.round(test.fluency_score ?? 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Math.round(test.grammar_score ?? 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Math.round(test.vocabulary_score ?? 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Math.round(test.pronunciation_score ?? 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => router.push(`/exam/${test.id}/results`)}
                    className="text-thy-red hover:text-thy-darkRed font-medium flex items-center gap-1 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Görüntüle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {tests.map((test) => (
          <div key={test.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatShortDate(test.created_at)}
                </p>
                <p className="text-xs text-gray-500">Konuşma Sınavı</p>
              </div>
              <ScoreBadge score={test.overall_score ?? 0} size="md" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p className="text-xs text-gray-500">Akıcılık</p>
                <p className="text-sm font-medium text-gray-900">{Math.round(test.fluency_score ?? 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Dilbilgisi</p>
                <p className="text-sm font-medium text-gray-900">{Math.round(test.grammar_score ?? 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Kelime</p>
                <p className="text-sm font-medium text-gray-900">{Math.round(test.vocabulary_score ?? 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Telaffuz</p>
                <p className="text-sm font-medium text-gray-900">{Math.round(test.pronunciation_score ?? 0)}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/exam/${test.id}/results`)}
              className="w-full text-thy-red hover:text-thy-darkRed font-medium flex items-center justify-center gap-1 py-2 border border-thy-red/30 rounded-lg hover:bg-thy-red/5 transition-all"
            >
              <Eye className="h-4 w-4" />
              Detayları Görüntüle
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-600">Toplam {totalTests} sınav</p>
        <button
          onClick={() => router.push('/dashboard/history')}
          className="text-sm font-medium text-thy-red hover:text-thy-darkRed flex items-center gap-1 transition-colors"
        >
          Tümünü Gör
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}