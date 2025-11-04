import LegalLayout from '@/components/LegalLayout';
import Link from 'next/link';
import type { Metadata } from 'next';
import TableOfContents from '@/components/legal/TableOfContents';
import PDFDownloadButton from '@/components/legal/PDFDownloadButton';
import InfoCard from '@/components/legal/InfoCard';
import { Info, Shield, AlertTriangle, Lock, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | CrewEnglish.ai',
  description: 'CrewEnglish.ai kişisel verilerin korunması ve gizlilik politikası.',
};

const tocItems = [
  { id: 'giris', title: 'Giriş', level: 2 },
  { id: 'toplanan-veriler', title: '1. Toplanan Veriler', level: 2 },
  { id: 'islenme-amaci', title: '2. İşlenme Amaçları', level: 2 },
  { id: 'guvenlik', title: '3. Güvenlik Tedbirleri', level: 2 },
  { id: 'teknik-mekanizmalar', title: '4. Teknik Mekanizmalar', level: 2 },
  { id: 'yurtdisi-aktarim', title: '5. Yurt Dışı Aktarımı', level: 2 },
  { id: 'saklama-sureleri', title: '6. Saklama Süreleri', level: 2 },
  { id: 'kvkk-haklar', title: '7. KVKK Haklarınız', level: 2 },
  { id: 'veri-ihlali', title: '8. Veri İhlali', level: 2 },
  { id: 'basvuru', title: '9. Başvuru Usulü', level: 2 },
  { id: 'degisiklikler', title: '10. Değişiklikler', level: 2 },
  { id: 'iletisim', title: '11. İletişim', level: 2 },
];

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Gizlilik Politikası"
      lastUpdated="4 Kasım 2025"
      toc={<TableOfContents items={tocItems} />}
      pdfButton={<PDFDownloadButton title="Gizlilik Politikası" />}
    >
      <InfoCard icon={Info} variant="neutral" title="Veri Sorumlusu">
        <p><strong>CrewEnglish.ai</strong>, CrewCoach.ai LLC tarafından işletilen bir markadır.</p>
        <p><strong>Veri Sorumlusu:</strong> CrewCoach.ai LLC (Delaware, ABD)</p>
        <p><strong>Kapsam:</strong> Bu Gizlilik Politikası yalnızca Türkiye'deki kullanıcılar için geçerlidir.</p>
      </InfoCard>

      <section id="giris">
        <p>
          CrewEnglish.ai olarak, kullanıcılarımızın gizliliğine önem veriyoruz. Bu politika; kişisel verilerinizin
          hangi amaçlarla ve hangi hukuki sebeplerle işlendiğini, ne kadar süre saklandığını, kimlerle paylaşıldığını
          ve haklarınızı açıklar. Platformumuzu kullanarak bu politikayı kabul etmiş olursunuz.
        </p>
      </section>

      <section id="toplanan-veriler">
        <h2>1. Toplanan Kişisel Veriler</h2>

        <h3>1.1 Kimlik ve İletişim Bilgileri</h3>
        <ul>
          <li>Ad, soyad</li>
          <li>E-posta adresi</li>
          <li>Telefon numarası</li>
        </ul>

        <h3>1.2 Ses Kaydı ve Konuşma Verileri (Özel Nitelikli Veri)</h3>
        <InfoCard icon={Shield} variant="info" title="Özel Nitelikli Veri">
          <ul>
            <li>Sınav sırasında kaydedilen sesli cevaplar (.webm)</li>
            <li>OpenAI Whisper ses transkripsiyonları</li>
            <li>Yapay zekâ değerlendirme skorları (fluency, grammar, vocabulary, pronunciation, relevance)</li>
          </ul>
          <p className="mt-2">
            <strong>Önemli:</strong> Ses kayıtları, kişiyi belirleyebilecek biyometrik veri niteliği taşıyabileceğinden
            özel nitelikli kişisel veri kapsamında en fazla 90 gün saklanır ve sonra silinir/anonimleştirilir.
          </p>
        </InfoCard>

        <h3>1.3 Teknik Veriler</h3>
        <ul>
          <li>IP adresi, tarayıcı türü/sürümü, işletim sistemi, cihaz bilgileri</li>
          <li>Oturum yönetimine ilişkin teknik tanımlayıcılar</li>
          <li>Platform kullanım istatistikleri (hata günlükleri vb.)</li>
        </ul>

        <h3>1.4 Ödeme Bilgileri</h3>
        <ul>
          <li>Kart verileri Stripe tarafından işlenir ve bizde saklanmaz</li>
          <li>Fatura bilgileri, ödeme geçmişi</li>
        </ul>
        <InfoCard variant="neutral">
          <p>Ödeme bilgileriniz doğrudan Stripe'a iletilir ve güvenli biçimde saklanır; CrewEnglish.ai kart verilerinize erişmez.</p>
        </InfoCard>
      </section>

      <section id="islenme-amaci">
        <h2>2. Verilerin İşlenme Amaçları</h2>
        <ul>
          <li><strong>Konuşma Sınavı Simülasyonu:</strong> Sesinizi analiz ederek İngilizce seviyenizi değerlendirmek</li>
          <li><strong>Geri Bildirim:</strong> Telaffuz/dilbilgisi hakkında kişiselleştirilmiş öneriler sunmak</li>
          <li><strong>Hizmetin Doğruluğunu ve Performansını İzleme:</strong> Sistem doğruluğunu ve kalite ölçütlerini iyileştirmek <em>(üçüncü taraf modellerin eğitimi yapılmaz)</em></li>
          <li><strong>Hesap ve Müşteri İşlemleri:</strong> Üyelik oluşturma, giriş, destek talepleri</li>
          <li><strong>Güvenlik:</strong> Kötüye kullanımın ve dolandırıcılığın önlenmesi</li>
          <li><strong>Yasal Yükümlülükler:</strong> Muhasebe ve mevzuat kaynaklı saklamalar</li>
        </ul>

        <InfoCard icon={Info} variant="info" title="AI Model Eğitimi Politikası">
          <p>
            <strong>Verileriniz üçüncü taraf AI sağlayıcılarının (OpenAI vb.) kendi modellerini eğitmesi için KULLANILmaz.</strong>
          </p>
          <p className="mt-2">
            Hizmet sağlayıcılarımızla yapılan sözleşmelerde, ses kayıtlarınızın ve transkriptlerinizin
            yalnızca size özel değerlendirme amacıyla işleneceği, model eğitimi için kullanılmayacağı taahhüt edilmiştir.
          </p>
          <p className="mt-2 text-sm">
            Gelecekte anonimleştirilmiş verilerle platformumuzun kendi modeli iyileştirilmek istenirse,
            bu amaçla <strong>ayrı ve açık rızanız</strong> alınacaktır.
          </p>
        </InfoCard>
      </section>

      <section id="guvenlik">
        <h2>3. Güvenlik Tedbirleri</h2>

        <h3>3.1 Teknik Önlemler</h3>
        <InfoCard icon={Lock} variant="success">
          <ul>
            <li>SSL/TLS şifreleme, güvenli veri merkezleri</li>
            <li>At-rest şifreleme (AES-256)</li>
            <li>Erişim kontrol sistemleri, çok faktörlü kimlik doğrulama (2FA)</li>
            <li>Zafiyet taramaları ve düzenli güvenlik testleri</li>
          </ul>
        </InfoCard>

        <h3>3.2 İdari Önlemler</h3>
        <InfoCard icon={Shield} variant="success">
          <ul>
            <li>Erişimi sınırlı yetkili personel</li>
            <li>Gizlilik taahhütleri ve düzenli KVKK eğitimleri</li>
            <li>Erişim loglarının tutulması ve periyodik denetimler</li>
            <li>Olay müdahale prosedürleri</li>
          </ul>
        </InfoCard>

        <h3>3.3 Özel Nitelikli Veriler İçin Ek Tedbirler</h3>
        <InfoCard icon={Shield} variant="info">
          <ul>
            <li>Rol/ilke bazlı erişim, ayrıcalıklı erişim kontrolleri</li>
            <li>Erişim günlüklerinin sıkı izlenmesi</li>
            <li>Yetkisiz erişim şüphesinde derhal kilitleme ve inceleme</li>
          </ul>
        </InfoCard>
      </section>

      <section id="teknik-mekanizmalar">
        <h2>4. Teknik Mekanizmalar (Çerezler ve Depolama)</h2>
        <p>
          Sitede <strong>pazarlama veya analitik çerezi kullanılmamaktadır</strong>. Yalnızca oturum yönetimi için
          zorunlu teknik mekanizmalar kullanılır:
        </p>
        <ul>
          <li><strong>Session Cookies:</strong> Oturum kimlik doğrulaması ve güvenlik</li>
          <li><strong>LocalStorage/SessionStorage:</strong> Kullanıcı tercihleri ve geçici veriler (örn. tema ayarları, dil tercihi)</li>
        </ul>
        <p className="text-sm text-gray-600 mt-2">
          Bu mekanizmalar zorunludur ve <strong>reklam veya analiz amaçlı kullanılmaz</strong>.
        </p>
      </section>

      <section id="yurtdisi-aktarim">
        <h2>5. Yurt Dışına Veri Aktarımı ve Açık Rıza</h2>
        <p>Hizmeti sunabilmek için bazı verileriniz aşağıdaki ABD merkezli hizmet sağlayıcılara aktarılabilir:</p>

        <ul>
          <li><strong>🤖 OpenAI (ABD):</strong> Ses transkripsiyonu ve yapay zekâ değerlendirmeleri</li>
          <li><strong>💳 Stripe (ABD):</strong> Ödeme işlemleri</li>
          <li><strong>🗄️ Supabase:</strong> Veritabanı ve kimlik doğrulama</li>
        </ul>

        <InfoCard icon={Info} variant="warning" title="Kayıt Sırasında Onaylanan Açık Rıza Metni">
          <p className="italic">
            "Kişisel verilerimin (ses kayıtları dâhil özel nitelikli verilerim) ABD'de bulunan
            veri sorumlusu CrewCoach.ai LLC ve hizmet sağlayıcıları (OpenAI, Stripe, Supabase) tarafından
            işlenmesine ve yurt dışına aktarılmasına açık rıza veriyorum."
          </p>
        </InfoCard>

        <InfoCard icon={AlertTriangle} variant="warning" title="Önemli: Rıza Geri Çekme">
          <p>
            <strong>Kişisel verileriniz ABD/AB'deki hizmet sağlayıcılara açık rızanıza dayanarak aktarılmaktadır.</strong>
          </p>
          <p className="mt-2">
            Bu rızayı istediğiniz zaman hesap ayarlarınızdan (hesap silme yoluyla) geri çekebilirsiniz.
            Ancak, rızanın geri alınması hizmetin sunulmasını engelleyeceğinden hesabınız kapatılacaktır.
          </p>
        </InfoCard>

        <h3>5.1 Rızanın Geri Alınması</h3>
        <ul>
          <li><strong>Panel:</strong> Profil → Gizlilik Ayarları</li>
          <li>
            <strong>E-posta:</strong>{' '}
            <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline">
              crewenglish@crewcoach.ai
            </a>
          </li>
        </ul>
        <InfoCard variant="warning">
          <p>Rızanın geri alınması, ses kaydı gerektiren hizmetlerin sunulmasını engelleyebilir; bu durumda hesabınız kapatılabilir.</p>
        </InfoCard>
      </section>

      <section id="saklama-sureleri">
        <h2>6. Veri Saklama Süreleri</h2>
        <ul>
          <li><strong>🎤 Ses Kayıtları:</strong> En fazla 90 gün (özel nitelikli veri)</li>
          <li><strong>📝 Transkriptler ve Skorlar:</strong> Hesap aktif olduğu sürece</li>
          <li><strong>👤 Hesap Bilgileri:</strong> Hesap silinene kadar</li>
          <li><strong>💰 Ödeme Kayıtları:</strong> İlgili mevzuat gereği 10 yıl</li>
        </ul>

        <InfoCard icon={Info} variant="info" title="İnaktiflik Kuralı (24 Ay)">
          <p>
            Hesabınıza <strong>24 ay boyunca giriş yapmamanız</strong> durumunda, KVKK md.7 uyarınca
            kişisel verileriniz (ses kayıtları hariç) <strong>silinir veya anonimleştirilir</strong>.
          </p>
          <p className="mt-2 text-sm">
            Bu işlemden <strong>30 gün önce</strong> kayıtlı e-posta adresinize bildirim gönderilir.
          </p>
        </InfoCard>
      </section>

      <section id="kvkk-haklar">
        <h2>7. KVKK Kapsamındaki Haklarınız</h2>
        <p>KVKK md.11 uyarınca:</p>

        <ul>
          <li>✓ Verinizin işlenip işlenmediğini öğrenme</li>
          <li>✓ İşleme amaçlarını ve uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>✓ Yurt içi/dışı aktarılan üçüncü kişileri bilme</li>
          <li>✓ Eksik/yanlışsa düzeltilmesini isteme</li>
          <li>✓ Silinmesini/yok edilmesini isteme</li>
          <li>✓ Münhasıran otomatik işlemeye itiraz etme</li>
          <li>✓ Zarara uğramanız hâlinde tazminat talep etme</li>
        </ul>

        <InfoCard icon={Info} variant="info" title="Otomatik Karar Verme ve Profilleme">
          <p>
            Sınav değerlendirmelerimiz AI destekli otomatik işleme ile yapılmaktadır (fluency, grammar, vocabulary, pronunciation skorları).
          </p>
          <p className="mt-2">
            <strong>Bu sonuçlara itiraz etme hakkınız</strong> bulunmaktadır. İtirazınızı{' '}
            <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline">
              crewenglish@crewcoach.ai
            </a>
            {' '}adresine bildirebilirsiniz.
          </p>
        </InfoCard>

        <p>
          Detaylar için{' '}
          <Link href="/kvkk" className="text-thy-red hover:underline">
            KVKK Aydınlatma Metni
          </Link>
          'ni inceleyebilirsiniz.
        </p>
      </section>

      <section id="veri-ihlali">
        <h2>8. Veri İhlali Bildirimi</h2>
        <p>
          Kişisel veri güvenliğini etkileyen bir ihlal tespit edilirse, KVKK'ya uygun şekilde
          en kısa sürede (öğrenmeden itibaren 72 saat içinde) Kişisel Verileri Koruma Kurulu'na
          ve etkilenen kişilere bildirim yapılır. İhlalin niteliği, etkilenen veri kategorileri ve
          alınan önlemler açıklanır.
        </p>
      </section>

      <section id="basvuru">
        <h2>9. Başvuru Usulü (Hakların Kullanımı)</h2>
        <InfoCard icon={Mail} variant="neutral" title="E-posta ile Başvuru">
          <p>
            <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline font-semibold text-lg">
              crewenglish@crewcoach.ai
            </a>
          </p>
          <p className="mt-2">
            <strong>Başvuru Yöntemi:</strong> Tercihen kayıtlı e-posta adresinizden başvurunuz.
          </p>
          <p className="mt-2">
            <strong>Kimlik Doğrulama:</strong> Güvenlik amacıyla, sınırlı kimlik bilgisi (ad-soyad ve e-posta) talep edilebilir.
            Kimlik belgesi fotokopisi yalnızca gerekli durumlarda istenir ve doğrulama sonrası <strong>derhal imha edilir</strong>.
          </p>
          <p className="mt-2">
            <strong>Yanıt Süresi:</strong> Başvurular <strong>30 gün</strong> içinde yanıtlanır.
          </p>
        </InfoCard>
      </section>

      <section id="degisiklikler">
        <h2>10. Politika Değişiklikleri</h2>
        <p>
          Bu politika zaman zaman güncellenebilir. Önemli değişiklikler e-posta ile bildirilir;
          en güncel sürüm bu sayfada yayımlanır.
        </p>
      </section>

      <section id="iletisim">
        <h2>11. İletişim ve Yasal Bilgiler</h2>
        <InfoCard icon={Mail} variant="neutral" title="Veri Sorumlusu">
          <p><strong>Şirket:</strong> CrewCoach.ai LLC (Delaware, USA)</p>
          <p><strong>Vergi Durumu:</strong> ABD merkezli LLC (Türkiye'de vergi mükellefiyeti bulunmamaktadır)</p>
          <p><strong>Adres:</strong> 201 Orange Street, Suite 600, Wilmington, DE 19801, USA</p>
          <p><strong>Telefon:</strong> +1 (302) 575-087</p>
          <p>
            <strong>E-posta:</strong>{' '}
            <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline">
              crewenglish@crewcoach.ai
            </a>
          </p>
        </InfoCard>

        <InfoCard icon={Info} variant="info" title="Yaş Sınırlaması">
          <p>
            <strong>Hizmetimiz 18+ yaş için tasarlanmıştır.</strong> 18 yaşından küçükseniz, platformu kullanmadan önce
            veli veya vasinin onayını almanız gerekmektedir.
          </p>
        </InfoCard>

        <InfoCard icon={AlertTriangle} variant="warning" title="Türkiye VERBİS Kaydı">
          <p><strong>Veri Sorumlusu Temsilcisi (Türkiye):</strong> [Atanacak - KVKK md.29 uyarınca gerekirse]</p>
          <p><strong>VERBİS No:</strong> [Kayıt süreci devam ediyor]</p>
          <p className="text-sm mt-2">
            Not: ABD merkezli veri sorumluları için VERBİS kaydı zorunluluğu sınırlı hallerde uygulanır.
            İlgili gelişmeler bu sayfada paylaşılacaktır.
          </p>
        </InfoCard>
      </section>
    </LegalLayout>
  );
}
