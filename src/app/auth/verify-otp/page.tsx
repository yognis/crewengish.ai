'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Shield, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

function VerifyOTPContent() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || 'recovery';

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      toast.error('E-posta adresi gerekli');
      router.push('/auth/forgot-password');
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (index === 5 && value) {
      const fullOtp = [...newOtp.slice(0, 5), value].join('');
      if (fullOtp.length === 6) {
        handleVerifyOTP(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    // Only allow 6 digits
    if (!/^\d{6}$/.test(pastedData)) {
      toast.error('Lütfen 6 haneli kodu yapıştırın');
      return;
    }

    const digits = pastedData.split('');
    setOtp(digits);

    // Focus last input and auto-submit
    inputRefs.current[5]?.focus();
    handleVerifyOTP(pastedData);
  };

  const handleVerifyOTP = async (code?: string) => {
    const otpCode = code || otp.join('');

    if (otpCode.length !== 6) {
      toast.error('Lütfen 6 haneli kodu girin');
      return;
    }

    setLoading(true);

    try {
      console.log('Verifying OTP for email:', email);

      // Verify OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otpCode,
        type: 'email',
      });

      if (error) {
        console.error('OTP verification error:', error);

        if (error.message?.includes('expired')) {
          toast.error('Kod süresi dolmuş. Lütfen yeni kod isteyin.');
        } else if (error.message?.includes('invalid')) {
          toast.error('Geçersiz kod. Lütfen tekrar deneyin.');
        } else {
          toast.error(error.message || 'Kod doğrulanamadı');
        }

        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      if (data.session) {
        console.log('OTP verified successfully');
        toast.success('Kod doğrulandı! Yeni şifrenizi belirleyin.');

        // Navigate to password reset page
        // The session is now established, so reset-password page will work
        router.push('/auth/reset-password');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResending(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      toast.success('Yeni kod gönderildi!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      toast.error(error.message || 'Kod gönderilemedi');
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-thy-red via-thy-darkRed to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center text-white">
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Geri dön</span>
          </Link>

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Kodu Doğrulayın</h1>
          <p className="mt-2 text-gray-200">
            <span className="font-medium">{email}</span> adresine gönderilen 6 haneli kodu girin
          </p>
        </div>

        {/* OTP Input Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }} className="space-y-6">
            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={loading}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-thy-red focus:ring-2 focus:ring-thy-red/20 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full flex items-center justify-center rounded-lg bg-thy-red py-3 font-semibold text-white transition-all duration-300 hover:bg-thy-darkRed disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Doğrulanıyor...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Kodu Doğrula
                </>
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Kodu almadınız mı?</p>
            <button
              onClick={handleResendOTP}
              disabled={countdown > 0 || resending}
              className="text-sm font-medium text-thy-red hover:text-thy-darkRed disabled:text-gray-400 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              {resending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : countdown > 0 ? (
                `Yeni kod ${countdown} saniye sonra`
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Yeni Kod Gönder
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 rounded-lg bg-white/10 backdrop-blur-sm p-4 text-sm text-white/90">
          <p className="font-medium mb-2">💡 İpuçları:</p>
          <ul className="space-y-1 text-white/75 list-disc list-inside">
            <li>E-postanızın spam klasörünü kontrol edin</li>
            <li>Kod 10 dakika boyunca geçerlidir</li>
            <li>Kodu kopyala-yapıştır yapabilirsiniz</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-thy-red via-thy-darkRed to-gray-900 p-4">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Yükleniyor...</p>
        </div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
