'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-thy-red hover:text-thy-darkRed font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kredi Paketleri</h1>
          <p className="text-lg text-gray-600">
            İhtiyacınıza uygun paketi seçin ve İngilizce seviyenizi ölçmeye başlayın
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter Package */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-thy-red transition-all">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Başlangıç</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">5</span>
              <span className="text-gray-600 ml-2">kredi</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">5 tam test</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">Detaylı AI geri bildirim</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">İlerleme takibi</span>
              </li>
            </ul>
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg transition-all">
              Yakında
            </button>
          </div>

          {/* Popular Package */}
          <div className="bg-white border-2 border-thy-red rounded-xl p-8 relative shadow-xl transform scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-thy-red text-white px-4 py-1 rounded-full text-sm font-semibold">
                Popüler
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Standart</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">15</span>
              <span className="text-gray-600 ml-2">kredi</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">15 tam test</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">Detaylı AI geri bildirim</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">İlerleme takibi</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">%20 tasarruf</span>
              </li>
            </ul>
            <button className="w-full bg-thy-red hover:bg-thy-darkRed text-white font-semibold py-3 rounded-lg transition-all">
              Yakında
            </button>
          </div>

          {/* Pro Package */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-thy-red transition-all">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Profesyonel</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">30</span>
              <span className="text-gray-600 ml-2">kredi</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">30 tam test</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">Detaylı AI geri bildirim</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">İlerleme takibi</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">%30 tasarruf</span>
              </li>
            </ul>
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg transition-all">
              Yakında
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Ödeme sistemi yakında eklenecek. Şimdilik ücretsiz kredilerle test edebilirsiniz!
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
