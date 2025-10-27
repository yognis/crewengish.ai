'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { createClient } from '@/lib/auth-client';
import {
  Mail,
  ArrowLeft,
  Check,
  Zap,
  Award,
  Target,
  Shield,
  Lock,
  CheckCircle,
  Info,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const featureHighlights = [
  { icon: Check, text: '3 ücretsiz test kredisi bekliyor' },
  { icon: Zap, text: 'Anında AI geri bildirimi alın' },
  { icon: Award, text: '4 kriter üzerinden detaylı analiz' },
  { icon: Target, text: 'THY sınav formatına uygun sorular' },
];

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (cooldown > 0 || !email) return;

    setResendLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        throw error;
      }

      toast.success('Doğrulama e-postası tekrar gönderildi!');
      setCooldown(60);
    } catch (error: any) {
      console.error('Resend error:', error);
      toast.error(error.message || 'E-posta gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setResendLoading(false);
    }
  };

  const resendDisabled = resendLoading || cooldown > 0 || !email;
  const emailDisplay = email ?? 'E-posta adresinize';

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Marketing Rail */}
      <div className="relative hidden lg:flex lg:w-2/5 flex-col justify-center p-12 bg-gradient-to-br from-thy-red via-thy-darkRed to-red-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_50%)]" />
        </div>

        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors group z-10"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Ana Sayfa</span>
        </Link>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center text-lg font-bold">
              CE
            </div>
            <div>
              <p className="text-sm text-white/70">CrewEnglish.ai</p>
              <p className="text-xl font-semibold text-white">DLA Test</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">Neredeyse Hazırsınız!</h1>
          <p className="text-xl text-white/80 mb-8">
            E-posta adresinizi doğrulayın ve hemen pratik yapmaya başlayın
          </p>

          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                <Check className="h-5 w-5 text-white" />
              </div>
              <span className="text-white/90">Kayıt Tamamlandı</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                <Mail className="h-5 w-5 text-thy-red" />
              </div>
              <span className="text-white font-medium">E-posta Doğrulama</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Zap className="h-5 w-5 text-white/50" />
              </div>
              <span className="text-white/50">İlk Test</span>
            </div>
          </div>

          <div className="space-y-4 mb-12">
            {featureHighlights.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-white/80" />
                <span className="text-white/90">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/10 rounded-lg p-4 mb-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((avatar) => (
                  <div
                    key={avatar}
                    className="h-8 w-8 rounded-full bg-white/30 border-2 border-white/40"
                  />
                ))}
              </div>
              <span className="text-white/90 text-sm font-medium">1,000+ THY çalışanı</span>
            </div>
            <p className="text-white/70 text-xs">tarafından güvenle kullanılıyor</p>
          </div>

          <div className="flex items-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>KVKK Uyumlu</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>SSL Şifreli</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Güvenli</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex w-full lg:w-3/5 items-center justify-center p-6 sm:p-8 bg-white">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="lg:hidden mb-6">
            <Link href="/" className="flex items-center gap-2 text-thy-red mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Ana Sayfa</span>
            </Link>
          </div>

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-thy-red/10">
            <Mail className="h-10 w-10 text-thy-red animate-pulse" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">E-postanızı Kontrol Edin</h1>

          <p className="text-base text-gray-600 mb-6">
            <span className="font-semibold text-thy-red">
              {email ? email : 'E-posta adresinize'}
            </span>{' '}
            bir doğrulama e-postası gönderdik.
          </p>

          {!email && (
            <p className="mb-6 text-sm text-amber-600 font-medium">
              E-posta adresini otomatik olarak bulamadık. Lütfen kayıt olduğunuz e-posta kutunu kontrol edin
              veya kaydı yeniden başlatın.
            </p>
          )}

          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left shadow-sm border border-gray-100">
            <ol className="space-y-3 text-sm text-gray-600">
              {[
                'E-posta gelen kutunuzu kontrol edin',
                "CrewEnglish.ai'dan gelen mesajı bulun",
                'Doğrulama linkine tıklayın',
                'Hesabınız otomatik olarak aktif hale gelecek',
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-thy-red text-white text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <p className="mt-4 text-xs text-gray-500 italic flex items-center gap-2">
              <Info className="h-4 w-4" />
              E-postayı görmüyor musunuz? Spam klasörünüzü de kontrol edin.
            </p>
          </div>

          <button
            onClick={handleResendEmail}
            disabled={resendDisabled}
            className={`w-full h-12 rounded-lg font-semibold text-base border-2 border-thy-red text-thy-red hover:bg-thy-red hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mb-6`}
          >
            {resendLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Gönderiliyor...</span>
              </>
            ) : cooldown > 0 ? (
              <span>Tekrar gönder ({cooldown}s)</span>
            ) : email ? (
              <>
                <RefreshCw className="h-5 w-5" />
                <span>E-postayı Tekrar Gönder</span>
              </>
            ) : (
              <span>E-posta adresi gerekli</span>
            )}
          </button>

          <p className="text-sm text-gray-600 mb-4">
            E-posta gelmedi mi?{' '}
            <a href="mailto:destek@crewenglish.ai" className="text-thy-red hover:underline font-medium">
              destek@crewenglish.ai
            </a>{' '}
            adresine yazın.
          </p>

          <p className="text-sm text-gray-600">
            Zaten doğruladınız mı?{' '}
            <Link href="/auth/login" className="text-thy-red hover:underline font-medium">
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
