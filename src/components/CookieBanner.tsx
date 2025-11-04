'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    
    if (!consent) {
      // Show banner after 1 second delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
    
    // Initialize analytics if accepted
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted'
      });
    }
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
    
    // Disable analytics if rejected
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied'
      });
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Content */}
              <div className="flex-1 pr-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🍪</span>
                  <div>
                    <h3 className="font-semibold text-thy-gray mb-1">
                      Bu site çerezler kullanıyor
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Web sitemizde deneyiminizi iyileştirmek için çerezler kullanıyoruz. 
                      Devam ederek çerez kullanımını kabul etmiş olursunuz. Detaylı bilgi için{' '}
                      <Link 
                        href="/gizlilik-politikasi" 
                        className="text-thy-red hover:underline font-medium"
                        onClick={() => setShowBanner(false)}
                      >
                        Gizlilik Politikamızı
                      </Link>{' '}
                      inceleyebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={rejectCookies}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-thy-gray bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Reddet
                </button>
                <button
                  onClick={acceptCookies}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-white bg-thy-red hover:bg-thy-darkRed rounded-lg transition-colors shadow-md"
                >
                  Kabul Et
                </button>
              </div>

              {/* Close button (mobile) */}
              <button
                onClick={rejectCookies}
                className="absolute top-2 right-2 sm:hidden p-1 text-gray-400 hover:text-gray-600"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Additional info (desktop only) */}
            <div className="hidden sm:block mt-3 ml-12 text-xs text-gray-500">
              Çerezleri kabul ederek{' '}
              <Link href="/gizlilik-politikasi" className="text-thy-red hover:underline">
                Gizlilik Politikamızı
              </Link>
              {' '}ve{' '}
              <Link href="/kvkk" className="text-thy-red hover:underline">
                KVKK Aydınlatma Metni
              </Link>
              &apos;ni kabul etmiş olursunuz.
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

