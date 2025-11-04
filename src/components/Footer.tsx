'use client';

import Link from 'next/link';
import { Twitter, Linkedin, Instagram, Mail, Plane } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Ürün */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Ürün</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 transition-colors hover:text-thy-red">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-gray-400 transition-colors hover:text-thy-red"
                >
                  Özellikler
                </a>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 transition-colors hover:text-thy-red">
                  Fiyatlandırma
                </Link>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-gray-400 transition-colors hover:text-thy-red"
                >
                  Nasıl Çalışır?
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Destek */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Destek</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:destek@crewenglish.ai"
                  className="text-gray-400 transition-colors hover:text-thy-red"
                >
                  Yardım Merkezi
                </a>
              </li>
              <li>
                <a
                  href="mailto:crewenglish@crewcoach.ai"
                  className="text-gray-400 transition-colors hover:text-thy-red"
                >
                  İletişim
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-gray-400 transition-colors hover:text-thy-red"
                >
                  SSS
                </a>
              </li>
              <li>
                <a
                  href="https://status.crewenglish.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-colors hover:text-thy-red"
                >
                  Durum Sayfası
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Yasal */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Yasal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/kullanim-kosullari" className="text-gray-400 transition-colors hover:text-thy-red">
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi" className="text-gray-400 transition-colors hover:text-thy-red">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/kvkk" className="text-gray-400 transition-colors hover:text-thy-red">
                  KVKK
                </Link>
              </li>
              <li>
                <Link href="/on-bilgilendirme" className="text-gray-400 transition-colors hover:text-thy-red">
                  Ön Bilgilendirme
                </Link>
              </li>
              <li>
                <Link href="/mesafeli-satis" className="text-gray-400 transition-colors hover:text-thy-red">
                  Mesafeli Satış
                </Link>
              </li>
              <li className="pt-2 mt-2 border-t border-gray-800">
                <Link href="/dashboard/settings#privacy" className="text-gray-400 transition-colors hover:text-thy-red">
                  Rıza Yönetimi
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings#data" className="text-gray-400 transition-colors hover:text-thy-red">
                  Verilerimi İndir
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings#delete" className="text-gray-400 transition-colors hover:text-thy-red">
                  Hesabı Sil
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Sosyal Medya */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Sosyal Medya</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://twitter.com/crewenglishai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 transition-colors hover:text-thy-red"
                >
                  <Twitter className="h-4 w-4" />
                  <span>Twitter/X</span>
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/company/crewenglishai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 transition-colors hover:text-thy-red"
                >
                  <Linkedin className="h-4 w-4" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/crewenglishai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 transition-colors hover:text-thy-red"
                >
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:crewenglish@crewcoach.ai"
                  className="flex items-center gap-2 text-gray-400 transition-colors hover:text-thy-red"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-800" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Copyright */}
          <p className="text-sm text-gray-400">
            © {currentYear} CrewEnglish.ai. Tüm hakları saklıdır.
          </p>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-thy-red">
              <Plane className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold">
              Crew<span className="text-thy-red">English.ai</span>
            </span>
          </div>

          {/* Language Selector (Placeholder) */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-semibold text-white">TR</span>
            <span>|</span>
            <span className="opacity-50">EN</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            CrewEnglish.ai, havacılık profesyonellerine yönelik bağımsız bir AI-destekli İngilizce öğrenme platformudur.
          </p>
        </div>
      </div>
    </footer>
  );
}
