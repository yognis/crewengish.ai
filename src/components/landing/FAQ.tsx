'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: 'Kaç kredi ile başlarım?',
    answer: 'Kayıt olduğunuzda 3 ücretsiz kredi kazanırsınız. Her test 1 kredi harcar.',
  },
  {
    question: 'Testler ne kadar sürer?',
    answer: 'Her test 20 soru içerir ve ortalama 30-40 dakika sürer.',
  },
  {
    question: 'AI puanlama nasıl çalışır?',
    answer: "OpenAI'nin GPT-4 teknolojisi konuşmanızı 4 kriterde değerlendirir: Akıcılık, Dilbilgisi, Kelime Hazinesi ve Telaffuz.",
  },
  {
    question: 'Havacılık İngilizcesi nedir?',
    answer: "Havacılık sektöründe kullanılan özel terimler ve iletişim kalıplarıdır. Testlerimiz THY'nin gerçek sınavlarına benzer.",
  },
  {
    question: 'Krediler biter mi?',
    answer: 'Evet, her test 1 kredi harcar. Bittiğinde kredi satın alarak devam edebilirsiniz.',
  },
  {
    question: 'Sonuçlarımı görebilir miyim?',
    answer: "Evet, tüm test sonuçlarınız dashboard'unuzda saklanır ve istediğiniz zaman görüntüleyebilirsiniz.",
  },
  {
    question: 'Mobil cihazlarda çalışır mı?',
    answer: 'Evet, platform tüm cihazlarda (telefon, tablet, bilgisayar) sorunsuz çalışır.',
  },
  {
    question: 'Para iadesi var mı?',
    answer: 'İlk 7 gün içinde memnun kalmazsanız kredilerinizi iade ediyoruz.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-thy-gray lg:text-4xl">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-gray-600">
            Aklınıza takılan soruların yanıtlarını burada bulabilirsiniz.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-xl bg-white shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                onKeyDown={(e) => e.key === 'Enter' && toggleFAQ(index)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50"
                aria-expanded={openIndex === index}
              >
                <span className="pr-8 font-semibold text-thy-gray">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="h-5 w-5 text-thy-red" />
                  ) : (
                    <Plus className="h-5 w-5 text-thy-red" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="border-t border-gray-100 px-6 pb-6 pt-4">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-gray-600">
            Başka sorunuz mu var?
          </p>
          <a
            href="mailto:destek@thyenglishtest.com"
            className="inline-block rounded-lg bg-thy-red px-6 py-3 font-medium text-white transition-colors hover:bg-thy-darkRed"
          >
            Bize Ulaşın
          </a>
        </div>
      </div>
    </section>
  );
}
