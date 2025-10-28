'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, CreditCard, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();
  const { profile, loadProfile } = useAppStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) loadProfile();
    });
  }, [supabase, loadProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    } else {
      router.push(`/#${id}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleHomeClick = () => {
    if (user) {
      setIsMobileMenuOpen(false);
      router.push('/dashboard');
      return;
    }
    scrollToSection('top');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
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
              THY <span className="text-thy-red">English Test</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <button
              onClick={handleHomeClick}
              className="text-thy-gray transition-colors hover:text-thy-red"
            >
              Ana Sayfa
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-thy-gray transition-colors hover:text-thy-red"
            >
              Özellikler
            </button>
            <Link
              href="/pricing"
              className="text-thy-gray transition-colors hover:text-thy-red"
            >
              Fiyatlandırma
            </Link>
            <button
              onClick={() => scrollToSection('about')}
              className="text-thy-gray transition-colors hover:text-thy-red"
            >
              Hakkımızda
            </button>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                {profile && (
                  <div className="flex items-center gap-2 rounded-lg bg-thy-lightGray px-3 py-2">
                    <CreditCard className="h-4 w-4 text-thy-red" />
                    <span className="font-semibold text-thy-gray">{profile.credits}</span>
                    <span className="text-sm text-gray-600">kredi</span>
                  </div>
                )}
                <Link
                  href="/exam/start"
                  className="rounded-lg bg-thy-red px-6 py-2 font-medium text-white transition-colors hover:bg-thy-darkRed"
                >
                  Sınava Başla
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-thy-gray transition-colors hover:text-thy-red"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="font-medium text-thy-gray transition-colors hover:text-thy-red"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-lg bg-thy-red px-6 py-2 font-medium text-white transition-colors hover:bg-thy-darkRed"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-thy-gray"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-xl md:hidden">
            <nav className="flex flex-col gap-4 p-6">
              <button
                onClick={handleHomeClick}
                className="text-left text-thy-gray transition-colors hover:text-thy-red"
              >
                Ana Sayfa
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-left text-thy-gray transition-colors hover:text-thy-red"
              >
                Özellikler
              </button>
              <Link
                href="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-thy-gray transition-colors hover:text-thy-red"
              >
                Fiyatlandırma
              </Link>
              <button
                onClick={() => scrollToSection('about')}
                className="text-left text-thy-gray transition-colors hover:text-thy-red"
              >
                Hakkımızda
              </button>

              <div className="mt-4 border-t border-gray-200 pt-4">
                {user ? (
                  <>
                    {profile && (
                      <div className="mb-4 flex items-center gap-2 rounded-lg bg-thy-lightGray px-3 py-2">
                        <CreditCard className="h-4 w-4 text-thy-red" />
                        <span className="font-semibold text-thy-gray">
                          {profile.credits}
                        </span>
                        <span className="text-sm text-gray-600">kredi</span>
                      </div>
                    )}
                    <Link
                      href="/exam/start"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="mb-2 block rounded-lg bg-thy-red px-6 py-2 text-center font-medium text-white"
                    >
                      Sınava Başla
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-thy-gray transition-colors hover:text-thy-red"
                    >
                      Çıkış
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="mb-2 block font-medium text-thy-gray transition-colors hover:text-thy-red"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-lg bg-thy-red px-6 py-2 text-center font-medium text-white"
                    >
                      Kayıt Ol
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
