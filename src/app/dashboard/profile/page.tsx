'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { User, Lock, Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  // Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Oturum bulunamadı. Lütfen giriş yapın.');
        router.push('/auth/login');
        return;
      }

      // Get profile from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found, which is ok for new users
        console.error('Profile load error:', error);
      }

      setEmail(user.email || '');
      setFullName(profile?.full_name || user.user_metadata?.full_name || '');
    } catch (error) {
      console.error('Load profile error:', error);
      toast.error('Profil bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profil bilgileriniz güncellendi!');
      loadProfile(); // Reload profile data
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Validation
    if (newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor');
      return;
    }

    setLoadingPassword(true);

    try {
      if (!email) {
        setPasswordError('Email adresi bulunamadı');
        setLoadingPassword(false);
        return;
      }

      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordError('Mevcut şifreniz yanlış');
        setLoadingPassword(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast.success('Şifreniz başarıyla güncellendi!');

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password update error:', error);
      setPasswordError(error.message || 'Şifre güncellenirken bir hata oluştu');
    } finally {
      setLoadingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-thy-red" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-thy-red hover:text-thy-darkRed font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil Ayarları</h1>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Profile Information Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-thy-red/10">
                <User className="h-6 w-6 text-thy-red" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Profil Bilgileri</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thy-red focus:border-transparent transition-all"
                  placeholder="Adınız ve soyadınız"
                  required
                  disabled={updatingProfile}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  E-posta adresi değiştirilemez
                </p>
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="w-full flex items-center justify-center gap-2 bg-thy-red hover:bg-thy-darkRed text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingProfile ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Profili Güncelle
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Password Change Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10">
                <Lock className="h-6 w-6 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Şifre Değiştir</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mevcut Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Mevcut şifrenizi girin"
                    required
                    disabled={loadingPassword}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError('');
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="En az 6 karakter"
                    required
                    minLength={6}
                    disabled={loadingPassword}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre (Tekrar)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Yeni şifrenizi tekrar girin"
                    required
                    minLength={6}
                    disabled={loadingPassword}
                  />
                </div>
              </div>

              {passwordError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loadingPassword}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingPassword ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Şifreyi Güncelle
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Security Info Card */}
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Lock className="h-5 w-5 text-thy-red" />
            Güvenlik İpuçları
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
            <li>Şifreniz en az 6 karakter olmalıdır</li>
            <li>Güçlü bir şifre için büyük ve küçük harf, sayı ve özel karakter kullanın</li>
            <li>Şifrenizi düzenli olarak değiştirin</li>
            <li>Şifrenizi kimseyle paylaşmayın</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
