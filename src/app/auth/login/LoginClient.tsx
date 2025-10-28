'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { createClient } from '@/lib/supabase/client';
import {
  Mail,
  ArrowLeft,
  Check,
  Zap,
  Target,
  Shield,
  Lock,
  CheckCircle,
  Award,
} from 'lucide-react';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      toast.success('Email doğrulandı! Artık giriş yapabilirsiniz.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast.error('Lütfen önce email adresinizi doğrulayın!');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Email veya şifre hatalı!');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-thy-red via-thy-darkRed to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-thy-red mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ana Sayfaya Dön
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tekrar Hoş Geldiniz! 👋
            </h1>
            <p className="text-gray-600">
              İngilizce speaking pratiğinize kaldığınız yerden devam edin
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thy-red focus:border-transparent transition-all"
                  placeholder="ornek@thy.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thy-red focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-thy-red hover:bg-thy-darkRed text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Giriş Yap
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <Link
                href="/auth/signup"
                className="text-thy-red hover:text-thy-darkRed font-semibold transition-colors"
              >
                Hemen Kayıt Olun
              </Link>
            </p>
          </div>
        </div>

        {/* Right side - Benefits */}
        <div className="hidden lg:block text-white space-y-8">
          <div>
            <h2 className="text-4xl font-bold mb-4">
              İngilizce Speaking Pratiğinde Yeni Dönem
            </h2>
            <p className="text-xl text-gray-200">
              THY çalışanları için özel olarak tasarlanmış yapay zeka destekli
              speaking test simülatörü
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: Zap,
                title: 'Anında Geri Bildirim',
                description: 'AI ile konuşmanızı analiz edin',
              },
              {
                icon: Target,
                title: 'THY Standartlarına Uygun',
                description: 'Gerçek sınav formatında pratik yapın',
              },
              {
                icon: Shield,
                title: 'Güvenli & Gizli',
                description: 'Verileriniz tamamen korunur',
              },
              {
                icon: Award,
                title: 'İlerleme Takibi',
                description: 'Gelişiminizi grafiklerle görün',
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-start bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all"
              >
                <benefit.icon className="h-6 w-6 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-gray-200">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}