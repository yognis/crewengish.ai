import LegalLayout from '@/components/LegalLayout';
import Link from 'next/link';
import type { Metadata } from 'next';
import TableOfContents from '@/components/legal/TableOfContents';
import PDFDownloadButton from '@/components/legal/PDFDownloadButton';
import InfoCard from '@/components/legal/InfoCard';
import { Info, Shield, AlertTriangle, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni | CrewEnglish.ai',
  description: 'CrewEnglish.ai KVKK aydınlatma metni ve kişisel veri işleme politikası.',
};

const tocItems = [
  { id: 'giris', title: 'Giriş', level: 2 },
  { id: 'veri-sorumlusu', title: '1. Veri Sorumlusu', level: 2 },
  { id: 'islenme-amaclari', title: '2. İşlenme Amaçları', level: 2 },
  { id: 'islenen-veriler', title: '3. İşlenen Veriler', level: 2 },
  { id: 'toplama-yontemleri', title: '4. Toplama Yöntemleri', level: 2 },
  { id: 'veri-aktarimlari', title: '5. Veri Aktarımları', level: 2 },
  { id: 'saklama-sureleri', title: '6. Saklama Süreleri', level: 2 },
  { id: 'kvkk-haklar', title: '7. KVKK Haklarınız', level: 2 },
  { id: 'basvuru', title: '8. Başvuru Süreci', level: 2 },
  { id: 'acik-riza', title: '9. Açık Rıza Onayı', level: 2 },
  { id: 'iletisim', title: 'İletişim', level: 2 },
];

export default function KVKKPage() {
  return (
    <LegalLayout
      title="KVKK Aydınlatma Metni"
      lastUpdated="4 Kasım 2025"
      toc={<TableOfContents items={tocItems} />}
      pdfButton={<PDFDownloadButton title="KVKK Aydınlatma Metni" />}
    >
      <section id="giris">
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verilerinizin
          CrewEnglish.ai tarafından nasıl işlendiği konusunda sizleri bilgilendirmek isteriz.
        </p>

        <InfoCard icon={Info} variant="info" title="Bu Metin Nedir?">
          <p>
            KVKK Aydınlatma Metni, kişisel verilerinizin hangi amaçlarla toplandığını, nasıl işlendiğini,
            kimlerle paylaşıldığını ve haklarınızın neler olduğunu detaylı şekilde açıklar.
          </p>
        </InfoCard>
      </section>

      <section id="veri-sorumlusu">
        <h2>1. Veri Sorumlusu</h2>
        <InfoCard variant="neutral" title="Şirket Bilgileri">
          <p><strong>Şirket:</strong> CrewCoach.ai LLC (Delaware, USA)</p>
          <p><strong>Adres:</strong> 201 Orange Street, Suite 600, Wilmington, DE 19801, USA</p>
          <p><strong>Telefon:</strong> +1 (302) 575-087</p>
          <p>
            <strong>E-posta:</strong>{' '}
            <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline">
              crewenglish@crewcoach.ai
            </a>
          </p>
          <p className="text-sm mt-2">
            Veri sorumlusu, kişisel verilerin işleme amaçlarını ve vasıtalarını belirleyen,
            veri kayıt sisteminin kurulmasından ve yönetilmesinden sorumlu olan gerçek veya tüzel kişidir.
          </p>
        </InfoCard>
      </section>

      <section id="islenme-amaclari">
        <h2>2. Kişisel Verilerin İşlenme Amaçları</h2>
        <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
        
        <ul>
          <li><strong>🎯 Konuşma Sınavı Simülasyonu:</strong> İngilizce seviyenizi değerlendirmek ve detaylı geri bildirim sağlamak</li>
          <li><strong>🗣️ Speech Recognition Accuracy:</strong> Türk aksanlı İngilizce konuşma tanıma sistemlerinin doğruluğunu artırmak</li>
          <li><strong>📊 Pronunciation Analysis:</strong> Telaffuz, akıcılık ve dilbilgisi kalitesi hakkında analiz yapmak</li>
          <li><strong>👤 Hesap Yönetimi:</strong> Kullanıcı hesabınızı oluşturmak, yönetmek ve kimlik doğrulaması yapmak</li>
          <li><strong>💳 Ödeme İşlemleri:</strong> Kredi satın alma işlemlerini gerçekleştirmek ve faturalandırma yapmak</li>
          <li><strong>📧 İletişim ve Bilgilendirme:</strong> Hizmet güncellemeleri, destek talepleri ve önemli duyurular göndermek</li>
          <li><strong>🔒 Güvenlik ve Dolandırıcılık Önleme:</strong> Platformun güvenliğini sağlamak ve kötüye kullanımı tespit etmek</li>
        </ul>
      </section>

      <section id="islenen-veriler">
        <h2>3. İşlenen Veriler ve Kategorileri</h2>

        <h3>Kimlik Verileri</h3>
        <ul>
          <li>Ad, soyad</li>
          <li>E-posta adresi</li>
          <li>Telefon numarası</li>
        </ul>
        <p className="text-sm text-gray-600"><strong>Hukuki Sebep:</strong> Sözleşmenin kurulması ve ifası (KVKK md.5/2-c)</p>

        <h3>Ses ve Konuşma Verileri (Özel Nitelikli)</h3>
        <InfoCard icon={Shield} variant="info" title="Özel Nitelikli Veri Uyarısı">
          <ul>
            <li>Audio recordings (.webm format)</li>
            <li>Speech transcriptions (metinleştirilmiş konuşma)</li>
            <li>Pronunciation scores (telaffuz puanları)</li>
            <li>Fluency metrics (akıcılık metrikleri)</li>
            <li>Grammar analysis results (dilbilgisi analizi)</li>
          </ul>
          <p className="mt-2">
            <strong>⚠️ Önemli:</strong> Ses kayıtları, kişinin kimliğini belirleyebilecek biyometrik veri içerdiğinden
            KVKK md.6 kapsamında özel nitelikli veri olarak kabul edilir ve işlenmesi için açık rızanız gereklidir.
          </p>
          <p className="text-sm mt-2">
            <strong>Hukuki Sebep:</strong> Açık rıza (KVKK md.6/2)<br />
            <strong>Saklama Süresi:</strong> Maksimum 90 gün
          </p>
        </InfoCard>

        <h3>Teknik Veriler</h3>
        <ul>
          <li>IP adresi</li>
          <li>Browser MediaRecorder API kullanım verileri</li>
          <li>Cihaz bilgileri (işletim sistemi, tarayıcı)</li>
          <li>Çerez tanımlayıcıları</li>
          <li>Platform kullanım istatistikleri</li>
        </ul>
        <p className="text-sm text-gray-600"><strong>Hukuki Sebep:</strong> Meşru menfaat (KVKK md.5/2-f)</p>

        <h3>İşlem Güvenliği Verileri</h3>
        <ul>
          <li>Ödeme geçmişi</li>
          <li>Kredi bakiyesi</li>
          <li>Fatura bilgileri</li>
        </ul>
        <p className="text-sm text-gray-600"><strong>Hukuki Sebep:</strong> Sözleşmenin ifası ve yasal yükümlülük (KVKK md.5/2-c, e)</p>
      </section>

      <section id="toplama-yontemleri">
        <h2>4. Veri Toplama Yöntemleri</h2>
        <p>Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:</p>
        <ul>
          <li><strong>📝 Web Formları:</strong> Kayıt ve profil bilgileri</li>
          <li><strong>🎤 Mikrofon Erişimi:</strong> Browser MediaRecorder API</li>
          <li><strong>🔊 Audio Streaming:</strong> Gerçek zamanlı ses kaydı</li>
          <li><strong>🍪 Çerezler:</strong> Oturum ve performans takibi</li>
        </ul>
      </section>

      <section id="veri-aktarimlari">
        <h2>5. Kişisel Verilerin Aktarıldığı Taraflar</h2>
        <p>Hizmetlerimizi sunabilmek için kişisel verileriniz aşağıdaki üçüncü taraflara aktarılmaktadır:</p>

        <h3>🇺🇸 OpenAI (Amerika Birleşik Devletleri)</h3>
        <ul>
          <li><strong>Aktarılan Veriler:</strong> Ses kayıtları, transkriptler</li>
          <li><strong>Amaç:</strong> Whisper API ile ses transkripsiyonu ve GPT-4 ile AI değerlendirme</li>
          <li><strong>Hukuki Dayanak:</strong> Açık rıza (KVKK md.5/1, md.6/2)</li>
        </ul>

        <h3>🇺🇸 Deepgram / AssemblyAI (Amerika Birleşik Devletleri)</h3>
        <ul>
          <li><strong>Aktarılan Veriler:</strong> Ses kayıtları</li>
          <li><strong>Amaç:</strong> Speech-to-text dönüşümü ve konuşma analizi</li>
          <li><strong>Hukuki Dayanak:</strong> Açık rıza (KVKK md.5/1, md.6/2)</li>
        </ul>

        <h3>🇺🇸 Stripe (Amerika Birleşik Devletleri)</h3>
        <ul>
          <li><strong>Aktarılan Veriler:</strong> Ödeme bilgileri, fatura bilgileri</li>
          <li><strong>Amaç:</strong> Güvenli ödeme işlemleri</li>
          <li><strong>Hukuki Dayanak:</strong> Sözleşmenin ifası (KVKK md.5/2-c)</li>
        </ul>

        <h3>🇺🇸🇪🇺 Supabase (ABD/Avrupa)</h3>
        <ul>
          <li><strong>Aktarılan Veriler:</strong> Hesap bilgileri, sınav skorları</li>
          <li><strong>Amaç:</strong> Veritabanı hizmetleri ve kimlik doğrulama</li>
          <li><strong>Hukuki Dayanak:</strong> Sözleşmenin ifası (KVKK md.5/2-c)</li>
        </ul>

        <InfoCard icon={AlertTriangle} variant="warning">
          <p>
            <strong>⚠️ Önemli:</strong> Yurt dışına veri aktarımı için kayıt sırasında açık rızanız alınır.
            Bu rızayı istediğiniz zaman geri çekebilirsiniz (hesap silme yoluyla).
          </p>
        </InfoCard>
      </section>

      <section id="saklama-sureleri">
        <h2>6. Saklama Süreleri</h2>
        <ul>
          <li><strong>🎤 Ses Kayıtları:</strong> Maksimum 90 gün</li>
          <li><strong>📝 Transkriptler:</strong> Hesap aktif olduğu sürece</li>
          <li><strong>📊 Sınav Skorları:</strong> Hesap aktif olduğu sürece</li>
          <li><strong>👤 Hesap Bilgileri:</strong> Hesap silinene kadar</li>
          <li><strong>💰 Ödeme Kayıtları:</strong> 10 yıl (Vergi Kanunu, Ticaret Kanunu)</li>
        </ul>
      </section>

      <section id="kvkk-haklar">
        <h2>7. İlgili Kişinin Hakları (KVKK md.11)</h2>
        <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>

        <ol>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
          <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
          <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
          <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
          <li>Düzeltme, silme veya yok etme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
          <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
          <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
        </ol>
      </section>

      <section id="basvuru">
        <h2>8. Başvuru Süreci</h2>
        <p>Yukarıdaki haklarınızı kullanmak için başvurunuzu aşağıdaki şekilde yapabilirsiniz:</p>

        <InfoCard icon={Mail} variant="neutral" title="Başvuru Yöntemi">
          <p>
            <strong>E-posta Adresi:</strong>{' '}
            <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline font-semibold text-lg">
              crewenglish@crewcoach.ai
            </a>
          </p>
          
          <p className="mt-3"><strong>Başvuruda Bulunması Gerekenler:</strong></p>
          <ul>
            <li>Adınız, soyadınız</li>
            <li>T.C. kimlik numaranız (kimlik doğrulama için)</li>
            <li>Kayıtlı e-posta adresiniz</li>
            <li>Başvuru konusu ve talebiniz</li>
            <li>Kimlik belgesi fotokopisi (imzalı)</li>
          </ul>

          <p className="mt-3">
            <strong>⏰ Yanıt Süresi:</strong> Başvurularınız en geç 30 gün içinde yanıtlanacaktır.
            İşlemin ayrıca bir maliyeti gerektirmesi halinde, Kişisel Verileri Koruma Kurulu tarafından
            belirlenen tarifedeki ücret alınacaktır.
          </p>
        </InfoCard>
      </section>

      <section id="acik-riza">
        <h2>9. Açık Rıza Onayı Metni</h2>
        <InfoCard icon={AlertTriangle} variant="warning" title="Kayıt Sırasında Onaylanan Açık Rıza">
          <p className="italic">
            "Kişisel verilerimin, Amerika Birleşik Devletleri'nde bulunan CrewCoach.ai LLC
            ve hizmet sağlayıcıları (OpenAI, Deepgram/AssemblyAI, Stripe, Supabase) tarafından
            işlenmesine ve <strong>ses kayıtlarımın yurt dışına aktarılarak transkripsiyonunun
            yapılmasına</strong> açık rıza veriyorum."
          </p>
          <p className="mt-3">
            <strong>📝 Not:</strong> Bu rızayı istediğiniz zaman{' '}
            <Link href="/dashboard/settings" className="text-thy-red hover:underline">
              hesap ayarları
            </Link>
            {' '}üzerinden geri çekebilirsiniz (hesap silme).
          </p>
        </InfoCard>
      </section>

      <section id="iletisim">
        <h2>İletişim</h2>
        <InfoCard icon={Mail} variant="neutral" title="Veri Sorumlusu">
          <p><strong>Şirket:</strong> CrewCoach.ai LLC (Delaware, USA)</p>
          <p><strong>Adres:</strong> 201 Orange Street, Suite 600, Wilmington, DE 19801, USA</p>
          <p><strong>Telefon:</strong> +1 (302) 575-087</p>
          <p>
            <strong>E-posta:</strong>{' '}
            <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline">
              crewenglish@crewcoach.ai
            </a>
          </p>
          <p className="text-sm mt-2">KVKK ile ilgili tüm sorularınız için yukarıdaki iletişim bilgilerini kullanabilirsiniz.</p>
        </InfoCard>
      </section>
    </LegalLayout>
  );
}
