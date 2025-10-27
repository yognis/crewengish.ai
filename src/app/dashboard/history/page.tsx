'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function HistoryPage() {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sınav Geçmişim</h1>

        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-600 mb-4">
            Sınav geçmişi sayfası yakında eklenecek
          </p>
          <p className="text-sm text-gray-500">
            Şimdilik son 5 sınavınızı ana sayfada görebilirsiniz
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
