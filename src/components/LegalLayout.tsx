'use client';

import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface LegalLayoutProps {
  children: ReactNode;
  title: string;
  lastUpdated: string;
  toc?: ReactNode;
  pdfButton?: ReactNode;
}

export default function LegalLayout({ children, title, lastUpdated, toc, pdfButton }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-thy-red">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-thy-gray">
              Crew<span className="text-thy-red">English.ai</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden md:inline-block font-medium text-thy-gray transition-colors hover:text-thy-red"
            >
              Giriş Yap
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-thy-red px-6 py-2 font-medium text-white transition-colors hover:bg-thy-darkRed"
            >
              Kayıt Ol
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="border-b bg-thy-lightGray print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link 
            href="/" 
            className="text-sm text-thy-gray hover:text-thy-red flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-thy-gray mb-2">{title}</h1>
              <p className="text-sm text-gray-500">
                Son güncelleme: {lastUpdated}
              </p>
            </div>
            {pdfButton && (
              <div className="hidden sm:block">
                {pdfButton}
              </div>
            )}
          </div>
        </motion.div>

        {/* Two-column layout: Content + TOC */}
        <div className="flex gap-8">
          {/* Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            <div className="legal-content prose prose-lg max-w-none">
              {children}
            </div>
          </motion.article>

          {/* TOC Sidebar */}
          {toc && (
            <aside className="w-64 flex-shrink-0">
              {toc}
            </aside>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 bg-gray-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-6">
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
              <Link href="/kullanim-kosullari" className="text-thy-gray hover:text-thy-red transition-colors">
                Kullanım Koşulları
              </Link>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <Link href="/gizlilik-politikasi" className="text-thy-gray hover:text-thy-red transition-colors">
                Gizlilik Politikası
              </Link>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <Link href="/kvkk" className="text-thy-gray hover:text-thy-red transition-colors">
                KVKK
              </Link>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <Link href="/on-bilgilendirme" className="text-thy-gray hover:text-thy-red transition-colors">
                Ön Bilgilendirme
              </Link>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <Link href="/mesafeli-satis" className="text-thy-gray hover:text-thy-red transition-colors">
                Mesafeli Satış
              </Link>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>İletişim:</span>
              <a 
                href="mailto:crewenglish@crewcoach.ai" 
                className="text-thy-red hover:underline font-medium"
              >
                crewenglish@crewcoach.ai
              </a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-gray-500">
              © 2025 CrewEnglish.ai - Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
