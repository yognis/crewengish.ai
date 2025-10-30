'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plane, Mic, Trophy, CheckCircle, Sparkles, RefreshCw } from 'lucide-react';

import Header from '@/components/Header';
import SocialProof from '@/components/landing/SocialProof';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/Footer';

export default function HomePage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="top" className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-thy-red via-thy-darkRed to-red-900 pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute h-full w-full bg-[url('/pattern.svg')] bg-repeat" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2"
            >
              <Sparkles className="h-5 w-5 text-white" />
              <span className="font-semibold text-white">AI Destekli İngilizce Hazırlık</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 text-5xl font-bold text-white md:text-6xl lg:text-7xl"
            >
              İngilizcenizi AI ile
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                Geliştirin
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mb-10 max-w-2xl text-xl text-white/90 leading-relaxed"
            >
              Yapay zeka destekli konuşma simülatörü ile gerçek sınav ortamını yaşayın.
              Anında geri bildirim alın, havacılık İngilizcesinde uzmanlaşın.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-thy-red shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
              >
                <Plane className="h-5 w-5" />
                Ücretsiz Başla
              </Link>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20"
              >
                Nasıl Çalışır?
              </button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/80"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>3 Ücretsiz Sınav</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>Anında AI Puanlama</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>Havacılık Terminolojisi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>24/7 Erişim</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-thy-gray lg:text-4xl">
              Neden CrewEnglish.ai?
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Havacılık profesyonelleri için AI-destekli İngilizce öğrenme platformu.
              Anında geri bildirim alın, konuşma becerilerinizi geliştirin.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              viewport={{ once: true }}
              className="card text-center transition-all hover:shadow-xl"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-thy-red/10">
                <Mic className="h-8 w-8 text-thy-red" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-thy-gray">Gerçekçi Sınav Deneyimi</h3>
              <p className="text-gray-600">
                Havacılık sektörüne özel sorular ve değerlendirme kriterleri ile gerçek sınav
                ortamını simüle edin. DLA sınavlarına hazırlık için ideal.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="card text-center transition-all hover:shadow-xl"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-thy-red/10">
                <Trophy className="h-8 w-8 text-thy-red" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-thy-gray">AI Destekli Değerlendirme</h3>
              <p className="text-gray-600">
                Akıcılık, dilbilgisi, kelime hazinesi ve telaffuz kriterlerinde detaylı geri bildirim
                alın.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="card text-center transition-all hover:shadow-xl"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-thy-red/10">
                <RefreshCw className="h-8 w-8 text-thy-red" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-thy-gray">En Güncel D.L.A Soruları</h3>
              <p className="text-gray-600">
                Havacılık sektörünün en güncel İngilizce yeterlilik sınav sorularıyla pratik yapın. İçeriğimiz, gerçek DLA sorularıyla zenginleştirilir ve haftalık güncellenir.
              </p>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Social Proof Section */}
      <SocialProof />

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-thy-gray lg:text-4xl">Nasıl Çalışır?</h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              4 basit adımda İngilizce konuşma becerinizi geliştirin
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4 lg:gap-12">
            {[
              {
                title: 'Kayıt Olun',
                desc: '3 ücretsiz kredi ile başlayın',
              },
              {
                title: 'Sınav Seçin',
                desc: 'Tam sınav veya hızlı pratik',
              },
              {
                title: 'Kayıt Yapın',
                desc: 'Mikrofonla yanıtınızı kaydedin',
              },
              {
                title: 'Gelişin',
                desc: 'Anında detaylı geri bildirim alın',
              },
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-thy-red text-3xl font-bold text-white shadow-lg">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-thy-gray">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* About Section */}
      <section id="about" className="bg-gradient-to-br from-thy-red to-thy-darkRed py-20 text-white lg:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
              CrewEnglish.ai ile Bugün Başlayın
            </h2>
            <p className="mb-8 text-xl text-white/90 leading-relaxed">
              Havacılık profesyonellerinin güvendiği AI-destekli platform ile kariyerinizi ilerletin.
              Şimdi kayıt olun, 3 ücretsiz sınav kazanın!
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-thy-red shadow-2xl transition-all hover:scale-105 hover:shadow-xl"
            >
              <Plane className="h-5 w-5" />
              Şimdi Ücretsiz Deneyin
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
