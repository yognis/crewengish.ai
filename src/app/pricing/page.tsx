'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';

// Pricing tiers configuration (modular for easy expansion)
const PRICING_TIERS = [
  {
    id: 'standard',
    name: 'Standart',
    credits: 3,
    price: 200,
    currency: 'TRY',
    popular: false,
    singlePrice: true,
    features: [
      '3 tam test',
      'Detaylı AI geri bildirim',
      'İlerleme takibi',
    ],
    buttonText: 'Satın Al',
    highlighted: true,
  },
];

export default function PricingPage() {
  const router = useRouter();

  const handlePurchase = (tierId: string) => {
    // TODO: Integrate with Stripe
    if (process.env.NODE_ENV === 'development') {
      console.log('Purchase initiated for tier:', tierId);
    }
    alert('Stripe entegrasyonu yakında eklenecek!');
  };

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kredi Satın Al</h1>
          <p className="text-lg text-gray-600">
            Her oturum 5 sorudan oluşur ve 1 kredi kullanır. İhtiyacınıza uygun paketi seçin.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            5 oturum = 1 tam döngü (25 soru)
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-xl grid gap-6 md:grid-cols-1">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`bg-white rounded-xl p-8 relative ${
                  tier.highlighted
                    ? 'border-2 border-thy-red shadow-xl'
                    : 'border-2 border-gray-200 hover:border-thy-red transition-all'
                }`}
              >
                {tier.singlePrice && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-thy-red text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Tek Fiyat
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                {tier.popular && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-thy-red text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Popüler
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{tier.credits}</span>
                  <span className="text-gray-600 ml-2">kredi</span>
                  <p className="text-sm text-gray-500 mt-1">{tier.credits} kredi içerir</p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-600 ml-2">{tier.currency}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePurchase(tier.id)}
                  className={`w-full font-semibold py-3 rounded-lg transition-all ${
                    tier.highlighted
                      ? 'bg-thy-red hover:bg-thy-darkRed text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {tier.buttonText}
                </button>
              </div>
            ))}
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
