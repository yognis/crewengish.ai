'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { createClient } from '@/lib/auth-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('E-posta adresiniz onaylandı! Şimdi giriş yapabilirsiniz.');
    }
    if (searchParams.get('error') === 'verification_failed') {
      toast.error('E-posta doğrulama başarısız. Lütfen tekrar deneyin.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Giriş başarılı!');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-thy-lightGray p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-block rounded-full bg-thy-red p-3">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-thy-gray">THY İngilizce Testi</h1>
          <p className="mt-2 text-gray-600">Hesabınıza giriş yapın</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-thy-gray">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-thy-red focus:outline-none focus:ring-2 focus:ring-thy-red/20"
                placeholder="ornek@thy.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-thy-gray">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-thy-red focus:outline-none focus:ring-2 focus:ring-thy-red/20"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-thy-red hover:text-thy-darkRed">
                Şifremi unuttum
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-thy-red py-3 font-medium text-white transition-colors hover:bg-thy-darkRed disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">veya</span>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link href="/auth/signup" className="font-medium text-thy-red hover:text-thy-darkRed">
              Kayıt olun
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/" className="hover:text-thy-gray">
            ← Ana sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  );
}

