'use client';

import { Rocket, Mic, Clock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function EmptyState() {
  const router = useRouter();

  return (
    <div className="bg-gray-50 rounded-xl p-12 text-center max-w-3xl mx-auto">
      {/* Animated Rocket Icon */}
      <div className="mb-6 flex justify-center">
        <div className="bg-gradient-to-br from-thy-red to-purple-600 p-6 rounded-full animate-pulse">
          <Rocket className="h-12 w-12 text-white" />
        </div>
      </div>

      {/* Headline */}
      <h2 className="text-3xl font-bold text-gray-900 mb-3">
        İlk Sınavınızı Başlatın! 🚀
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        10 dakika içinde İngilizce seviyenizi öğrenin
      </p>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
          <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mic className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">🎙️ 20 Soru</h3>
          <p className="text-sm text-gray-600">Kapsamlı sınav simülasyonu</p>
        </div>

        <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
          <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">⏱️ 30-40 Dakika</h3>
          <p className="text-sm text-gray-600">Detaylı değerlendirme</p>
        </div>

        <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
          <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">✨ 1 Kredi</h3>
          <p className="text-sm text-gray-600">İlk sınav ücretsiz!</p>
        </div>
      </div>

      {/* Primary CTA */}
      <button
        onClick={() => router.push('/exam/start')}
        className="bg-thy-red hover:bg-thy-darkRed text-white font-bold text-lg py-4 px-12 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 mb-4"
      >
        Hemen Başla
      </button>

      {/* Trust Badge */}
      <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
        <span className="text-green-600">✓</span>
        3 ücretsiz kredi ile başla
      </p>
    </div>
  );
}
