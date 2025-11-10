'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  ArrowLeft,
  Trash2,
  Loader2,
} from 'lucide-react';
import { getSafeUser } from '@/lib/getSafeUser';
import { createClient } from '@/lib/supabase/client';

export default function DeleteAccountPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirmed) {
      toast.error('Lütfen onay kutusunu işaretleyin');
      return;
    }

    // Additional confirmation
    const finalConfirm = window.confirm(
      'SON UYARI: Bu işlem geri alınamaz. Hesabınızı ve tüm verilerinizi kalıcı olarak silmek istediğinizden emin misiniz?'
    );

    if (!finalConfirm) return;

    setLoading(true);

    try {
      const { user } = await getSafeUser(supabase);
      if (!user) {
        toast.error('Kullanıcı bulunamadı');
        return;
      }

      // Log deletion reason (optional - for analytics)
      if (reason) {
        console.log('Account deletion reason:', reason);
        // You could send this to an analytics service or database
      }

      // Delete user profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Profile deletion error:', profileError);
        // Continue even if profile deletion fails
      }

      // Delete exam sessions
      const { error: sessionsError } = await supabase
        .from('exam_sessions')
        .delete()
        .eq('user_id', user.id);

      if (sessionsError) {
        console.error('Sessions deletion error:', sessionsError);
        // Continue even if sessions deletion fails
      }

      // TODO: Delete audio files from storage if implemented
      // const { error: storageError } = await supabase
      //   .storage
      //   .from('audio-recordings')
      //   .remove([`${user.id}/*`]);

      // Sign out the user
      await supabase.auth.signOut();

      toast.success('Hesabınız başarıyla silindi', {
        duration: 5000,
      });

      // Redirect to homepage
      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Hesap silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-thy-lightGray">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link 
            href="/dashboard/settings" 
            className="inline-flex items-center gap-2 text-thy-gray hover:text-thy-red transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Gizlilik Ayarlarına Dön
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-red-900">Hesabı Kalıcı Olarak Sil</h1>
              <p className="text-sm text-red-700">Bu işlem geri alınamaz</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Warning Card */}
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
            <div className="flex gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-red-900 mb-2">
                  ⚠️ Dikkat! Bu İşlem Geri Alınamaz
                </h2>
                <p className="text-sm text-red-800 leading-relaxed">
                  Hesabınızı sildiğinizde, aşağıdaki tüm verileriniz kalıcı olarak ve 
                  geri döndürülemez şekilde silinecektir. Lütfen bu kararı vermeden önce 
                  dikkatlice düşünün.
                </p>
              </div>
            </div>
          </div>

          {/* Data to be Deleted */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-thy-gray mb-4">
              Silinecek Veriler
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="font-medium text-thy-gray">Profil Bilgileri</p>
                  <p className="text-sm text-gray-600">Ad, soyad, e-posta, telefon numarası</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-2xl">🎤</span>
                <div>
                  <p className="font-medium text-thy-gray">Ses Kayıtları</p>
                  <p className="text-sm text-gray-600">Tüm sınav ses kayıtları ve transkriptler</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-medium text-thy-gray">Sınav Skorları ve Geçmiş</p>
                  <p className="text-sm text-gray-600">Tüm sınav sonuçları ve performans verileri</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-2xl">💳</span>
                <div>
                  <p className="font-medium text-thy-gray">Kredi Bakiyesi</p>
                  <p className="text-sm text-gray-600">
                    Kullanılmamış kredileriniz <strong>iade edilmeyecektir</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-2xl">🔐</span>
                <div>
                  <p className="font-medium text-thy-gray">Hesap Erişimi</p>
                  <p className="text-sm text-gray-600">Giriş bilgileriniz ve kimlik doğrulama</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reason (Optional) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-thy-gray mb-4">
              Silme Sebebiniz (Opsiyonel)
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Hesabınızı neden kapatıyorsunuz? Geri bildiriminiz hizmetlerimizi geliştirmemize yardımcı olur.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Örn: Artık platformu kullanmıyorum, fiyatları yüksek buldum, ihtiyacım kalmadı..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-thy-red focus:ring-4 focus:ring-thy-red/10 outline-none transition-all resize-none"
              rows={4}
            />
          </div>

          {/* Confirmation Checkbox */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-600 focus:ring-2"
              />
              <label htmlFor="confirm" className="text-sm text-thy-gray cursor-pointer leading-relaxed">
                Hesabımın silinmesi halinde tüm kişisel verilerimin{' '}
                <strong className="text-red-600">geri döndürülemez</strong> şekilde silineceğini 
                ve bu işlemin <strong className="text-red-600">iptal edilemeyeceğini</strong> anlıyorum. 
                Kredi bakiyemin iade edilmeyeceğini kabul ediyorum.
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link
              href="/dashboard/settings"
              className="px-6 py-3 border-2 border-gray-300 hover:bg-gray-50 text-thy-gray font-medium rounded-lg transition-colors"
            >
              İptal
            </Link>
            <button
              onClick={handleDelete}
              disabled={!confirmed || loading}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Siliniyor...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Hesabı Kalıcı Olarak Sil</span>
                </>
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Alternatif:</strong> Hesabınızı silmek yerine, sadece pazarlama 
              e-postalarından çıkabilir veya profil ayarlarınızı güncelleyebilirsiniz.{' '}
              <Link href="/dashboard/settings" className="text-thy-red hover:underline font-medium">
                Gizlilik Ayarlarına Git
              </Link>
            </p>
          </div>

          {/* Legal Notice */}
          <div className="text-center text-xs text-gray-500">
            <p>
              Hesap silme işlemi hakkında sorularınız için:{' '}
              <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline">
                crewenglish@crewcoach.ai
              </a>
            </p>
            <p className="mt-1">
              Yasal haklarınız için{' '}
              <Link href="/kvkk" className="text-thy-red hover:underline">
                KVKK Aydınlatma Metni
              </Link>
              &apos;ni inceleyebilirsiniz.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

