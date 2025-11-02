'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { createClient } from '@/lib/supabase/client';
import { getAuthCallbackUrl } from '@/lib/utils/get-base-url';
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

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [resending, setResending] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Email adresi bulunamadı');
      return;
    }

    setResending(true);

    try {
      const supabase = createClient();
      const emailRedirectTo = getAuthCallbackUrl();
      
      if (process.env.NODE_ENV === 'development') {
      }
      
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo,
        },
      });

      if (process.env.NODE_ENV === 'development') {
      }
      
      if (error) {
        console.error('Email verification error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          full: error
        });
        
        // More specific error messages
        if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
          toast.error('Çok fazla istek gönderildi. Lütfen birkaç dakika sonra tekrar deneyin.');
        } else if (error.message?.includes('not found') || error.message?.includes('user')) {
          toast.error('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı. Lütfen önce kayıt olun.');
        } else if (error.message?.includes('email')) {
          toast.error(`Email hatası: ${error.message}`);
        } else {
          toast.error(`Email gönderilemedi: ${error.message || 'Bilinmeyen hata'}`);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
        }
        toast.success('Doğrulama emaili tekrar gönderildi! Lütfen e-posta kutunuzu kontrol edin.');
      }
    } catch (error: any) {
      toast.error(`Bir hata oluştu: ${error?.message || 'Bilinmeyen hata'}`);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-thy-red via-thy-darkRed to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Verification Message */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-thy-red mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ana Sayfaya Dön
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-thy-red/10 rounded-full mb-4">
              <Mail className="h-8 w-8 text-thy-red" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Email Adresinizi Doğrulayın 📧
            </h1>
            <p className="text-gray-600">
              {email ? (
                <>
                  <span className="font-semibold text-thy-red">{email}</span>{' '}
                  adresine doğrulama emaili gönderdik
                </>
              ) : (
                'Email adresinize doğrulama linki gönderdik'
              )}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-thy-red" />
              Sonraki Adımlar:
            </h3>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-thy-red text-white rounded-full mr-3 flex-shrink-0 text-xs font-semibold">
                  1
                </span>
                <span>Email kutunuzu kontrol edin</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-thy-red text-white rounded-full mr-3 flex-shrink-0 text-xs font-semibold">
                  2
                </span>
                <span>
                  Doğrulama linkine tıklayın (spam klasörünü de kontrol edin)
                </span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-thy-red text-white rounded-full mr-3 flex-shrink-0 text-xs font-semibold">
                  3
                </span>
                <span>Giriş yapın ve speaking pratiğine başlayın!</span>
              </li>
            </ol>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={resending || !email}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2" />
                  Gönderiliyor...
                </>
              ) : (
                'Emaili Tekrar Gönder'
              )}
            </button>

            <Link
              href="/auth/login"
              className="block w-full bg-thy-red hover:bg-thy-darkRed text-white font-semibold py-3 rounded-lg transition-all duration-300 text-center"
            >
              <CheckCircle className="inline h-5 w-5 mr-2" />
              Giriş Sayfasına Dön
            </Link>
          </div>
        </div>

        {/* Right side - Benefits */}
        <div className="hidden lg:block text-white space-y-8">
          <div>
            <h2 className="text-4xl font-bold mb-4">
              Neredeyse Hazırsınız! 🎉
            </h2>
            <p className="text-xl text-gray-200">
              Email doğrulamasından sonra THY İngilizce speaking pratik
              platformuna tam erişim kazanacaksınız
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: Zap,
                title: 'Anında Başlayın',
                description: 'Doğrulama sonrası hemen pratik yapın',
              },
              {
                icon: Target,
                title: 'Gerçek Sınav Formatı',
                description: 'THY standartlarında speaking testleri',
              },
              {
                icon: Shield,
                title: 'Güvenli Platform',
                description: 'Verileriniz tamamen korunur',
              },
              {
                icon: Award,
                title: 'İlerleme Takibi',
                description: 'Gelişiminizi detaylı raporlarla görün',
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