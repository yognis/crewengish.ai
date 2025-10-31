'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Check if user has valid session (from OTP verification)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (process.env.NODE_ENV === 'development') {
          console.log('Reset password - Session check:', !!session);
        }

        if (session) {
          setHasSession(true);
        } else {
          // No session, redirect to forgot password
          toast.error('Lütfen önce doğrulama kodunu girin');
          setTimeout(() => {
            router.push('/auth/forgot-password');
          }, 2000);
        }
      } catch (err) {
        console.error('Session check error:', err);
        toast.error('Bir hata oluştu');
        setTimeout(() => {
          router.push('/auth/forgot-password');
        }, 2000);
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, [supabase, router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Updating password...');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      if (process.env.NODE_ENV === 'development') {
        console.log('Password updated successfully');
      }
      toast.success('Şifreniz başarıyla güncellendi!');

      // Sign out and redirect to login
      await supabase.auth.signOut();

      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch (error: any) {
      console.error('Password update error:', error);

      if (error.message?.includes('session')) {
        setError('Oturum süresi dolmuş. Lütfen tekrar deneyin.');
        setTimeout(() => {
          router.push('/auth/forgot-password');
        }, 2000);
      } else {
        setError(error.message || 'Şifre güncellenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking session
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-thy-red via-thy-darkRed to-gray-900 p-4">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // No session, will redirect
  if (!hasSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-thy-red via-thy-darkRed to-gray-900 p-4">
        <div className="w-full max-w-md text-center text-white">
          <AlertCircle className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Oturum Bulunamadı</h1>
          <p className="text-gray-200 mb-6">Lütfen önce doğrulama kodunu girin.</p>
          <p className="text-sm text-white/75">Yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  // Has session, show reset form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-thy-red via-thy-darkRed to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Yeni Şifre Belirleyin</h1>
          <p className="mt-2 text-gray-200">Hesabınız için güçlü bir şifre oluşturun</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Yeni Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-transparent focus:ring-2 focus:ring-thy-red transition-all"
                  placeholder="En az 6 karakter"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Güçlü bir şifre kullanın
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Yeni Şifre (Tekrar)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-transparent focus:ring-2 focus:ring-thy-red transition-all"
                  placeholder="Şifrenizi tekrar girin"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center rounded-lg bg-thy-red py-3 font-semibold text-white transition-all duration-300 hover:bg-thy-darkRed disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Şifreyi Güncelle
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center text-sm">
            <Link href="/auth/login" className="text-gray-600 hover:text-thy-red transition-colors">
              ← Giriş sayfasına dön
            </Link>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-6 rounded-lg bg-white/10 backdrop-blur-sm p-4 text-sm text-white/90">
          <p className="font-medium mb-2">🔒 Güvenlik İpuçları:</p>
          <ul className="space-y-1 text-white/75 list-disc list-inside">
            <li>En az 8 karakter kullanın</li>
            <li>Büyük ve küçük harf karışımı ekleyin</li>
            <li>Sayı ve özel karakter kullanın</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
