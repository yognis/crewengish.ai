'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Check,
  Zap,
  Award,
  Target,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  Loader2,
  Shield,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const supabase = createClient();

  // Password strength calculation
  const getPasswordStrength = (pass: string): 'weak' | 'medium' | 'strong' => {
    if (pass.length < 6) return 'weak';
    if (pass.length < 10) return 'medium';
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/) && pass.match(/[0-9]/)) return 'strong';
    return 'medium';
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

  // Validation functions
  const validateField = (field: string, value: string, comparePassword?: string): string => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Ad soyad gereklidir';
        if (value.trim().split(' ').length < 2) return 'Lütfen ad ve soyadınızı giriniz';
        return '';
      case 'phone':
        if (!value) return 'Telefon numarası gereklidir';
        if (!/^[0-9]{10}$/.test(value)) return 'Geçerli bir telefon numarası giriniz (10 rakam)';
        return '';
      case 'email':
        if (!value) return 'E-posta gereklidir';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Geçerli bir e-posta adresi giriniz';
        return '';
      case 'password':
        if (!value) return 'Şifre gereklidir';
        if (value.length < 6) return 'Şifre en az 6 karakter olmalıdır';
        return '';
      case 'confirmPassword':
        if (!value) return 'Şifre tekrarı gereklidir';
        if (value !== comparePassword) return 'Şifreler eşleşmiyor';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched({ ...touched, [field]: true });
    const error = field === 'confirmPassword'
      ? validateField(field, value, password)
      : validateField(field, value);
    setErrors({ ...errors, [field]: error });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {
      fullName: validateField('fullName', fullName),
      phone: validateField('phone', phone),
      email: validateField('email', email),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword, password),
    };

    setErrors(newErrors);
    setTouched({ fullName: true, phone: true, email: true, password: true, confirmPassword: true });

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error)) {
      toast.error('Lütfen tüm alanları doğru şekilde doldurunuz');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const profileResponse = await fetch('/api/profiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: authData.user.id,
            email,
            fullName,
            phone,
          }),
        });

        if (!profileResponse.ok) {
          const profileResult = await profileResponse.json().catch(() => ({}));
          throw new Error(profileResult.error || 'Profil oluşturulamadı.');
        }
      }

      toast.success('Kayıt başarılı! E-postanızı kontrol edin.');
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      const errorMessage = error.message || 'Kayıt başarısız';
      // Translate common Supabase errors to Turkish
      if (errorMessage.includes('already registered')) {
        toast.error('Bu e-posta adresi zaten kayıtlı');
      } else if (errorMessage.includes('Invalid email')) {
        toast.error('Geçersiz e-posta adresi');
      } else if (errorMessage.includes('Password')) {
        toast.error('Şifre gereksinimleri karşılanmıyor');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Check, text: '3 ücretsiz test kredisi ile başlayın' },
    { icon: Zap, text: 'Anında AI geri bildirimi alın' },
    { icon: Award, text: '4 kriter üzerinden detaylı analiz' },
    { icon: Target, text: 'THY sınav formatına uygun sorular' },
  ];

  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Back to Homepage Link */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 flex items-center space-x-2 text-thy-red hover:text-thy-darkRed lg:text-white/80 lg:hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Ana Sayfa</span>
      </Link>

      {/* LEFT SIDE - Marketing Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-thy-red via-thy-darkRed to-thy-red relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo Section */}
          <div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center space-x-3 mb-12"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <Target className="w-8 h-8 text-thy-red" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">DLA Test</h2>
                <p className="text-sm text-white/80">Dil Seviye Analizi</p>
              </div>
            </motion.div>

            {/* Hero Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-12"
            >
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                İngilizce Seviyenizi
                <br />
                Keşfedin
              </h1>
              <p className="text-lg text-white/90">
                AI destekli analizlerle THY standartlarına göre değerlendirilme
              </p>
            </motion.div>

            {/* Feature Bullets */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="space-y-4 mb-12"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                  className="flex items-center space-x-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-white/90 text-base">{feature.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Social Proof & Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="space-y-6"
          >
            {/* Social Proof */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 bg-white/30 rounded-full border-2 border-white"></div>
                  ))}
                </div>
                <p className="text-sm text-white/90">
                  <span className="font-semibold">1,000+</span> THY çalışanı tarafından kullanılıyor
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center space-x-6 text-white/70 text-xs">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>KVKK Uyumlu</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>SSL Şifreli</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Güvenli</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* RIGHT SIDE - Signup Form */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-4 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-thy-red rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-thy-gray">DLA Test</h2>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hesap Oluşturun</h1>
            <p className="text-sm text-gray-600">3 ücretsiz test kredisi ile başlayın</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad <span className="text-thy-red">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (touched.fullName) {
                      setErrors({ ...errors, fullName: validateField('fullName', e.target.value) });
                    }
                  }}
                  onBlur={() => handleBlur('fullName', fullName)}
                  className={`w-full h-12 pl-12 pr-4 text-base border-2 rounded-lg transition-all duration-200 ${
                    errors.fullName && touched.fullName
                      ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : fullName && !errors.fullName
                      ? 'border-green-500 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                      : 'border-gray-200 focus:border-thy-red focus:ring-4 focus:ring-thy-red/10'
                  } focus:outline-none`}
                  placeholder="Ahmet Yılmaz"
                />
                {fullName && !errors.fullName && touched.fullName && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.fullName && touched.fullName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-xs text-red-600 flex items-center space-x-1"
                >
                  <span>⚠</span>
                  <span>{errors.fullName}</span>
                </motion.p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon Numarası <span className="text-thy-red">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(value);
                    if (touched.phone) {
                      setErrors({ ...errors, phone: validateField('phone', value) });
                    }
                  }}
                  onBlur={() => handleBlur('phone', phone)}
                  className={`w-full h-12 pl-12 pr-4 text-base border-2 rounded-lg transition-all duration-200 ${
                    errors.phone && touched.phone
                      ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : phone && !errors.phone
                      ? 'border-green-500 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                      : 'border-gray-200 focus:border-thy-red focus:ring-4 focus:ring-thy-red/10'
                  } focus:outline-none`}
                  placeholder="5xxxxxxxxx"
                />
                {phone && !errors.phone && touched.phone && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {!errors.phone && (
                <p className="mt-1 text-xs text-gray-500">Telefon numaranızı başında 0 olmadan giriniz</p>
              )}
              {errors.phone && touched.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-xs text-red-600 flex items-center space-x-1"
                >
                  <span>⚠</span>
                  <span>{errors.phone}</span>
                </motion.p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta <span className="text-thy-red">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) {
                      setErrors({ ...errors, email: validateField('email', e.target.value) });
                    }
                  }}
                  onBlur={() => handleBlur('email', email)}
                  className={`w-full h-12 pl-12 pr-4 text-base border-2 rounded-lg transition-all duration-200 ${
                    errors.email && touched.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : email && !errors.email
                      ? 'border-green-500 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                      : 'border-gray-200 focus:border-thy-red focus:ring-4 focus:ring-thy-red/10'
                  } focus:outline-none`}
                  placeholder="ornek@thy.com"
                />
                {email && !errors.email && touched.email && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.email && touched.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-xs text-red-600 flex items-center space-x-1"
                >
                  <span>⚠</span>
                  <span>{errors.email}</span>
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre <span className="text-thy-red">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    const newErrors = { ...errors };
                    if (touched.password) {
                      newErrors.password = validateField('password', e.target.value);
                    }
                    // Re-validate confirmPassword when password changes
                    if (touched.confirmPassword && confirmPassword) {
                      newErrors.confirmPassword = validateField('confirmPassword', confirmPassword, e.target.value);
                    }
                    setErrors(newErrors);
                  }}
                  onBlur={() => handleBlur('password', password)}
                  className={`w-full h-12 pl-12 pr-12 text-base border-2 rounded-lg transition-all duration-200 ${
                    errors.password && touched.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : password && !errors.password
                      ? 'border-green-500 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                      : 'border-gray-200 focus:border-thy-red focus:ring-4 focus:ring-thy-red/10'
                  } focus:outline-none`}
                  placeholder="En az 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <div className="flex space-x-1 mb-1">
                    <div className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength === 'weak' ? 'bg-red-500' :
                      passwordStrength === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <div className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength === 'medium' || passwordStrength === 'strong' ?
                      (passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500') :
                      'bg-gray-200'
                    }`}></div>
                    <div className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                  </div>
                  <p className={`text-xs ${
                    passwordStrength === 'weak' ? 'text-red-600' :
                    passwordStrength === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    Şifre gücü: {passwordStrength === 'weak' ? 'Zayıf' : passwordStrength === 'medium' ? 'Orta' : 'Güçlü'}
                  </p>
                </motion.div>
              )}

              {errors.password && touched.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-xs text-red-600 flex items-center space-x-1"
                >
                  <span>⚠</span>
                  <span>{errors.password}</span>
                </motion.p>
              )}
            </div>

            {/* Password Confirmation Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre Tekrar <span className="text-thy-red">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (touched.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: validateField('confirmPassword', e.target.value, password) });
                    }
                  }}
                  onBlur={() => handleBlur('confirmPassword', confirmPassword)}
                  className={`w-full h-12 pl-12 pr-12 text-base border-2 rounded-lg transition-all duration-200 ${
                    errors.confirmPassword && touched.confirmPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : confirmPassword && !errors.confirmPassword && password
                      ? 'border-green-500 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                      : 'border-gray-200 focus:border-thy-red focus:ring-4 focus:ring-thy-red/10'
                  } focus:outline-none`}
                  placeholder="Şifrenizi tekrar girin"
                />
                {confirmPassword && !errors.confirmPassword && password && touched.confirmPassword && (
                  <CheckCircle2 className="absolute right-14 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-xs text-red-600 flex items-center space-x-1"
                >
                  <span>⚠</span>
                  <span>{errors.confirmPassword}</span>
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full h-12 bg-thy-red hover:bg-thy-darkRed text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <span>Kayıt Ol</span>
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="text-thy-red hover:underline font-medium">
              Giriş yapın
            </Link>
          </div>

          {/* Legal Text */}
          <div className="mt-4 text-center text-xs text-gray-500">
            Kayıt olarak{' '}
            <Link href="/terms" className="underline hover:text-thy-red">
              Kullanım Şartları
            </Link>
            {' '}ve{' '}
            <Link href="/privacy" className="underline hover:text-thy-red">
              Gizlilik Politikası
            </Link>
            'nı kabul ediyorsunuz
          </div>

          {/* Mobile Features (show on mobile only) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:hidden mt-8 space-y-3"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 text-gray-600">
                <div className="flex-shrink-0 w-5 h-5 bg-thy-red/10 rounded-full flex items-center justify-center">
                  <feature.icon className="w-3 h-3 text-thy-red" />
                </div>
                <p className="text-sm">{feature.text}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
