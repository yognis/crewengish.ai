import { FileQuestion, Plus } from 'lucide-react';
import Link from 'next/link';

interface HistoryEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function HistoryEmptyState({ hasFilters, onClearFilters }: HistoryEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <FileQuestion className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Filtrelere Uygun Sonuç Bulunamadı
        </h3>
        <p className="text-gray-600 mb-6">
          Seçili filtrelere uygun sınav bulunamadı. Filtreleri değiştirmeyi deneyin.
        </p>
        <button
          onClick={onClearFilters}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
        >
          Filtreleri Temizle
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-thy-red/10 mb-4">
        <FileQuestion className="h-8 w-8 text-thy-red" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Henüz Sınav Geçmişiniz Yok
      </h3>
      <p className="text-gray-600 mb-6">
        İlk sınavınızı tamamladıktan sonra sonuçlarınızı burada görebilirsiniz
      </p>
      <Link
        href="/exam/start"
        className="inline-flex items-center gap-2 px-6 py-3 bg-thy-red hover:bg-thy-darkRed text-white font-semibold rounded-lg transition-colors"
      >
        <Plus className="h-5 w-5" />
        İlk Sınavımı Başlat
      </Link>
    </div>
  );
}

