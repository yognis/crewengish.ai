'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatChartDate } from '@/lib/date-utils';
import type { TestSession } from '@/hooks/useDashboardData';

interface ScoreChartProps {
  data: TestSession[];
  loading?: boolean;
}

export function ScoreChart({ data, loading = false }: ScoreChartProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
        <div className="mb-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-[400px] bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  // Show empty state if less than 2 tests
  if (data.length < 2) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-2">İlerleme Grafiğin 📈</h3>
        <p className="text-sm text-gray-600 mb-6">Son 10 testin puanları</p>
        <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Grafiği görmek için en az 2 test yapmalısın</p>
            <p className="text-sm text-gray-500">Şu an {data.length} testin var</p>
          </div>
        </div>
      </div>
    );
  }

  // Transform data for recharts
  const chartData = data.map((test) => ({
    date: formatChartDate(test.created_at),
    'Genel Puan': Math.round(test.overall_score || 0),
    Akıcılık: Math.round(test.fluency_score || 0),
    Dilbilgisi: Math.round(test.grammar_score || 0),
    'Kelime Hazinesi': Math.round(test.vocabulary_score || 0),
    Telaffuz: Math.round(test.pronunciation_score || 0),
  })).reverse(); // Reverse to show chronological order

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">İlerleme Grafiğin 📈</h3>
        <p className="text-sm text-gray-600">Son {data.length} testin puanları</p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          <Line
            type="monotone"
            dataKey="Genel Puan"
            stroke="#E30A17"
            strokeWidth={3}
            dot={{ fill: '#E30A17', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Akıcılık"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Dilbilgisi"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: '#10B981', r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Kelime Hazinesi"
            stroke="#9333EA"
            strokeWidth={2}
            dot={{ fill: '#9333EA', r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Telaffuz"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ fill: '#F59E0B', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
