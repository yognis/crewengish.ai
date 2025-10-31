import { Filter, SortAsc } from 'lucide-react';
import type { HistoryFilters } from '@/hooks/useExamHistory';

interface HistoryFiltersProps {
  filters: HistoryFilters;
  onFiltersChange: (filters: HistoryFilters) => void;
}

export function HistoryFilters({ filters, onFiltersChange }: HistoryFiltersProps) {
  const handleStatusChange = (status: HistoryFilters['status']) => {
    onFiltersChange({ ...filters, status });
  };

  const handleDateRangeChange = (dateRange: HistoryFilters['dateRange']) => {
    onFiltersChange({ ...filters, dateRange });
  };

  const handleSortChange = (sortBy: HistoryFilters['sortBy']) => {
    onFiltersChange({ ...filters, sortBy });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Filtreler</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durum
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleStatusChange(e.target.value as HistoryFilters['status'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thy-red focus:border-transparent transition-all"
          >
            <option value="all">Tümü</option>
            <option value="completed">Tamamlandı</option>
            <option value="in_progress">Devam Ediyor</option>
            <option value="exited">Çıkıldı</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tarih Aralığı
          </label>
          <select
            value={filters.dateRange || 'all'}
            onChange={(e) => handleDateRangeChange(e.target.value as HistoryFilters['dateRange'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thy-red focus:border-transparent transition-all"
          >
            <option value="all">Tüm Zamanlar</option>
            <option value="7days">Son 7 Gün</option>
            <option value="30days">Son 30 Gün</option>
            <option value="3months">Son 3 Ay</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sıralama
          </label>
          <select
            value={filters.sortBy || 'date_desc'}
            onChange={(e) => handleSortChange(e.target.value as HistoryFilters['sortBy'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thy-red focus:border-transparent transition-all"
          >
            <option value="date_desc">En Yeni Önce</option>
            <option value="date_asc">En Eski Önce</option>
            <option value="score_desc">En Yüksek Puan</option>
            <option value="score_asc">En Düşük Puan</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {(filters.status !== 'all' || filters.dateRange !== 'all' || filters.sortBy !== 'date_desc') && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onFiltersChange({ status: 'all', dateRange: 'all', sortBy: 'date_desc' })}
            className="text-sm text-thy-red hover:text-thy-darkRed font-medium transition-colors"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}
    </div>
  );
}

