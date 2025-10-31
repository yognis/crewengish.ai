'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send OTP email for password recovery
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false, // Don't create new users, only existing
        },
      });

      if (error) {
        // Check if user doesn't exist
        if (error.message?.includes('User not found') || error.message?.includes('not found')) {
          toast.error('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı');
          setLoading(false);
          return;
        }
        throw error;
      }

      toast.success('Doğrulama kodu e-postanıza gönderildi!');

      // Navigate to verification page with email
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}&type=recovery`);
    } catch (error: any) {
      console.error('OTP send error:', error);
      toast.error(error.message || 'Kod gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-thy-red via-thy-darkRed to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center text-white">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Giriş sayfasına dön</span>
          </Link>

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Şifrenizi mi Unuttunuz?</h1>
          <p className="mt-2 text-gray-200">
            E-posta adresinize 6 haneli doğrulama kodu göndereceğiz
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-transparent focus:ring-2 focus:ring-thy-red transition-all"
                  placeholder="ornek@thy.com"
                  disabled={loading}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Kayıtlı e-posta adresinizi girin
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center rounded-lg bg-thy-red py-3 font-semibold text-white transition-all duration-300 hover:bg-thy-darkRed disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Doğrulama Kodu Gönder
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-2">Hesabınızı hatırladınız mı?</p>
            <Link href="/auth/login" className="font-medium text-thy-red hover:text-thy-darkRed transition-colors">
              Giriş Yapın
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 rounded-lg bg-white/10 backdrop-blur-sm p-4 text-sm text-white/90">
          <p className="font-medium mb-2">💡 Nasıl çalışır?</p>
          <ol className="space-y-1 text-white/75">
            <li>1. E-posta adresinizi girin</li>
            <li>2. 6 haneli doğrulama kodu alın</li>
            <li>3. Kodu girerek şifrenizi sıfırlayın</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

