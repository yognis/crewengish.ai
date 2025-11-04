'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  Shield, 
  CheckCircle2, 
  Settings as SettingsIcon, 
  Mail, 
  Trash2,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface UserConsents {
  terms_accepted: boolean;
  kvkk_accepted: boolean;
  age_verified: boolean;
  marketing_consent: boolean;
  created_at: string;
}

export default function PrivacySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [consents, setConsents] = useState<UserConsents | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUserConsents();
  }, []);

  const loadUserConsents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUserEmail(user.email || '');

      const { data, error } = await supabase
        .from('profiles')
        .select('terms_accepted, kvkk_accepted, age_verified, marketing_consent, created_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setConsents(data);
    } catch (error) {
      console.error('Error loading consents:', error);
      toast.error('Ayarlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateMarketingConsent = async (value: boolean) => {
    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ marketing_consent: value })
        .eq('id', user.id);

      if (error) throw error;

      setConsents(prev => prev ? { ...prev, marketing_consent: value } : null);
      toast.success(
        value 
          ? 'Pazarlama e-postaları açıldı' 
          : 'Pazarlama e-postalarından çıkıldı'
      );
    } catch (error) {
      console.error('Error updating consent:', error);
      toast.error('Ayar güncellenemedi');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-thy-lightGray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-thy-red border-t-transparent mx-auto mb-4"></div>
          <p className="text-thy-gray">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-thy-lightGray">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-thy-gray hover:text-thy-red transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard'a Dön
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-thy-red/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-thy-red" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-thy-gray">Gizlilik Ayarları</h1>
              <p className="text-sm text-gray-600">Veri kullanım tercihlerinizi yönetin</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Zorunlu Onaylar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-5 h-5 text-thy-red" />
            <h2 className="text-xl font-semibold text-thy-gray">Zorunlu Onaylar</h2>
          </div>
          
          <p className="text-sm text-gray-600">
            Bu onaylar platformu kullanabilmeniz için gereklidir ve değiştirilemez.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-thy-gray">Kullanım Koşulları</p>
                  <p className="text-sm text-gray-600">
                    Onay tarihi: {consents?.created_at ? new Date(consents.created_at).toLocaleDateString('tr-TR') : '-'}
                  </p>
                </div>
              </div>
              <span className="text-green-600 font-semibold text-sm">✓ Onaylandı</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-thy-gray">KVKK Açık Rızası</p>
                  <p className="text-sm text-gray-600">
                    Yurt dışı veri aktarımı onayı (OpenAI, Deepgram, Stripe)
                  </p>
                </div>
              </div>
              <span className="text-green-600 font-semibold text-sm">✓ Onaylandı</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-thy-gray">18+ Yaş Doğrulaması</p>
                  <p className="text-sm text-gray-600">
                    Reşit olduğunuzu beyan ettiniz
                  </p>
                </div>
              </div>
              <span className="text-green-600 font-semibold text-sm">✓ Onaylandı</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-900">
                  <strong>⚠️ Önemli:</strong> Bu onayları geri almak isterseniz, hesabınızı silmeniz gerekmektedir.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* İsteğe Bağlı Onaylar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-thy-red" />
            <h2 className="text-xl font-semibold text-thy-gray">İsteğe Bağlı Onaylar</h2>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-thy-red/30 transition-colors">
            <div className="flex-1 pr-4">
              <p className="font-medium text-thy-gray mb-1">Pazarlama İletişimi</p>
              <p className="text-sm text-gray-600">
                Yeni özellikler, kampanyalar ve güncellemeler hakkında e-posta alın
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={consents?.marketing_consent || false}
                onChange={(e) => updateMarketingConsent(e.target.checked)}
                disabled={updating}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-thy-red/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-thy-red"></div>
            </label>
          </div>
        </motion.div>

        {/* KVKK Hakları */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-thy-red" />
            <h2 className="text-xl font-semibold text-thy-gray">KVKK Haklarınız</h2>
          </div>

          <p className="text-sm text-gray-600">
            6698 sayılı KVKK uyarınca aşağıdaki haklarınızı kullanabilirsiniz:
          </p>

          <ul className="space-y-2">
            {[
              'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
              'İşleme amacını ve uygun kullanılıp kullanılmadığını öğrenme',
              'Yurt içi/dışı aktarım yapılan üçüncü kişileri bilme',
              'Eksik veya yanlış verilerin düzeltilmesini isteme',
              'Verilerin silinmesini veya yok edilmesini isteme',
            ].map((right, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-thy-red mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{right}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Haklarınızı kullanmak için bizimle iletişime geçin:
            </p>
            <a
              href="mailto:crewenglish@crewcoach.ai"
              className="inline-flex items-center gap-2 px-4 py-2 bg-thy-lightGray hover:bg-gray-200 text-thy-gray rounded-lg transition-colors text-sm font-medium"
            >
              <Mail className="w-4 h-4" />
              crewenglish@crewcoach.ai
            </a>
          </div>

          <p className="text-xs text-gray-500">
            Detaylı bilgi için{' '}
            <Link href="/kvkk" className="text-thy-red hover:underline">
              KVKK Aydınlatma Metni
            </Link>
            &apos;ni inceleyebilirsiniz.
          </p>
        </motion.div>

        {/* Hesap Silme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-50 border-2 border-red-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold text-red-900">Tehlikeli Bölge</h2>
          </div>

          <p className="text-sm text-red-800">
            Hesabınızı sildiğinizde, tüm verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.
          </p>

          <div className="bg-white border border-red-300 rounded-lg p-4">
            <p className="text-sm text-red-900 font-medium mb-2">Silinecek veriler:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
              <li>Profil bilgileriniz</li>
              <li>Tüm sınav kayıtlarınız</li>
              <li>Ses kayıtları ve transkriptler</li>
              <li>Sınav skorlarınız</li>
              <li>Kredi bakiyeniz (iade edilmez)</li>
            </ul>
          </div>

          <Link
            href="/dashboard/settings/delete-account"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Hesabı Sil
          </Link>
        </motion.div>

        {/* İlgili Politikalar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <Link
            href="/kullanim-kosullari"
            className="block bg-white hover:shadow-md rounded-lg p-4 transition-all"
          >
            <h3 className="font-semibold text-thy-red mb-1">📄 Kullanım Koşulları</h3>
            <p className="text-sm text-gray-600">Platform kullanım şartları</p>
          </Link>

          <Link
            href="/gizlilik-politikasi"
            className="block bg-white hover:shadow-md rounded-lg p-4 transition-all"
          >
            <h3 className="font-semibold text-thy-red mb-1">🔒 Gizlilik Politikası</h3>
            <p className="text-sm text-gray-600">Veri işleme uygulamalarımız</p>
          </Link>

          <Link
            href="/kvkk"
            className="block bg-white hover:shadow-md rounded-lg p-4 transition-all"
          >
            <h3 className="font-semibold text-thy-red mb-1">⚖️ KVKK Aydınlatma Metni</h3>
            <p className="text-sm text-gray-600">Kişisel veri haklarınız</p>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

