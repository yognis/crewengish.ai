import LegalLayout from '@/components/LegalLayout';
import Link from 'next/link';
import type { Metadata } from 'next';
import TableOfContents from '@/components/legal/TableOfContents';
import PDFDownloadButton from '@/components/legal/PDFDownloadButton';
import InfoCard from '@/components/legal/InfoCard';
import { Info, Scale, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi | CrewEnglish.ai',
  description: 'CrewEnglish.ai mesafeli satış sözleşmesi.',
};

const tocItems = [
  { id: 'giris', title: 'Giriş', level: 2 },
  { id: 'taraflar', title: '1. Taraflar', level: 2 },
  { id: 'konu-kapsam', title: '2. Konu ve Kapsam', level: 2 },
  { id: 'tanimlar', title: '3. Tanımlar', level: 2 },
  { id: 'hizmet-nitelikleri', title: '4. Hizmetin Nitelikleri', level: 2 },
  { id: 'bedel-odeme', title: '5. Bedel ve Ödeme', level: 2 },
  { id: 'cayma-hakki', title: '6. Cayma Hakkı', level: 2 },
  { id: 'yukumlulukler', title: '7. Yükümlülükler', level: 2 },
  { id: 'fesih', title: '8. Fesih ve Sona Erme', level: 2 },
  { id: 'uyusmazlik', title: '9. Uyuşmazlık Çözümü', level: 2 },
  { id: 'iletisim', title: 'İletişim', level: 2 },
];

export default function DistanceSalesContract() {
  return (
    <LegalLayout
      title="Mesafeli Satış Sözleşmesi"
      lastUpdated="4 Kasım 2025"
      toc={<TableOfContents items={tocItems} />}
      pdfButton={<PDFDownloadButton title="Mesafeli Satış Sözleşmesi" />}
    >
      <section id="giris">
        <InfoCard icon={Info} variant="neutral">
          <p><strong>Sözleşme No:</strong> [Otomatik oluşturulur]</p>
          <p><strong>Tarih:</strong> [Ödeme onayı anı]</p>
        </InfoCard>
      </section>

      <section id="taraflar">
        <h2>1. Taraflar</h2>
        
        <h3>Satıcı (Hizmet Sağlayıcı):</h3>
        <ul>
          <li><strong>Şirket:</strong> CrewCoach.ai LLC (Delaware, USA)</li>
          <li><strong>Marka:</strong> CrewEnglish.ai</li>
          <li><strong>Adres:</strong> 201 Orange Street, Suite 600, Wilmington, DE 19801, USA</li>
          <li><strong>Telefon:</strong> +1 (302) 575-087</li>
          <li>
            <strong>E-posta:</strong>{' '}
            <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline">
              crewenglish@crewcoach.ai
            </a>
          </li>
        </ul>

        <h3>Alıcı (Tüketici/Kullanıcı):</h3>
        <ul>
          <li><strong>Ad-Soyad:</strong> [Kullanıcı Ad-Soyad]</li>
          <li><strong>E-posta:</strong> [Kullanıcı E-posta]</li>
          <li><strong>Adres:</strong> [Varsa fatura adresi]</li>
        </ul>

        <p><strong>Kapsam:</strong> İşbu sözleşme yalnızca Türkiye'deki tüketiciler için geçerlidir.</p>
      </section>

      <section id="konu-kapsam">
        <h2>2. Konu ve Kapsam</h2>
        <p>
          Bu sözleşme, Alıcı'nın Platform üzerinden Satıcı'dan dijital içerik niteliğinde kredi paketi satın
          almasına ve bu kredilerin Platform'da İngilizce konuşma sınavı simülasyonları için kullanılmasına ilişkin;
          6502 sayılı TKHK ve Mesafeli Sözleşmeler Yönetmeliği hükümleri çerçevesinde tarafların hak
          ve yükümlülüklerini düzenler.
        </p>
      </section>

      <section id="tanimlar">
        <h2>3. Tanımlar</h2>
        <ul>
          <li><strong>Platform:</strong> CrewEnglish.ai alan adı ve buna bağlı web uygulamaları.</li>
          <li><strong>Kredi:</strong> 1 kredi = 1 sınav oturumu (ör. 5 soru + AI değerlendirme).</li>
          <li><strong>Dijital İçerik:</strong> Fiziksel teslim gerektirmeyen çevrim içi hizmetler.</li>
          <li><strong>Ön Bilgilendirme:</strong> Sözleşme öncesi Alıcı'ya sunulan metin.</li>
        </ul>
      </section>

      <section id="hizmet-nitelikleri">
        <h2>4. Hizmetin Nitelikleri ve İfa</h2>
        <ul>
          <li>Alıcı'nın hesabına ödeme onayıyla derhâl kredi tanımlanır.</li>
          <li>Hizmet eğitim/alıştırma amaçlıdır; sınav/işe kabul garantisi vermez.</li>
          <li>Krediler süresiz geçerlidir (devredilemez ve başkasına satılamaz).</li>
          <li>Platform'un çalışması için güncel tarayıcı, mikrofon ve kararlı internet bağlantısı gereklidir.</li>
        </ul>
      </section>

      <section id="bedel-odeme">
        <h2>5. Bedel ve Ödeme</h2>
        <ul>
          <li><strong>Toplam Bedel:</strong> TL cinsinden gösterilir; KDV dâhil/haricî ödeme ekranında belirtilir.</li>
          <li><strong>Ödeme Yöntemi:</strong> Kredi/banka kartı (Stripe aracılığıyla).</li>
          <li><strong>Ödeme Anı:</strong> Ödeme onayı sözleşmenin kurulma anıdır.</li>
          <li><strong>Fatura:</strong> e-Arşiv/e-Fatura düzenlenir ve Alıcı'ya iletilir.</li>
        </ul>
      </section>

      <section id="cayma-hakki">
        <h2>6. Cayma Hakkı ve Dijital İçerik İstisnası</h2>
        
        <h3>6.1 Genel Kural</h3>
        <p>
          6502 sayılı TKHK uyarınca Alıcı 14 gün içinde herhangi bir gerekçe göstermeksizin cayma hakkına sahiptir.
        </p>

        <h3>6.2 İstisna: Dijital İçerikte İfaya Derhâl Başlama</h3>
        <InfoCard icon={Scale} variant="warning" title="Önemli: Dijital İçerik İstisnası">
          <p>
            Fiziksel olmayan dijital içerikte, ifaya derhâl başlanması ve Alıcı'nın bunu açıkça onaylaması hâlinde
            cayma hakkı kullanılamaz (Mesafeli Sözleşmeler Yönetmeliği md.15/1-g).
          </p>
          <p className="mt-2">
            Satın alma ekranında ayrı bir onay kutusuyla Alıcı'nın bu onayı verdiği kayıt altına alınır.
          </p>
        </InfoCard>

        <h3>6.3 Cayma Hakkının Bulunduğu Hâller</h3>
        <ul>
          <li>Kullanılmamış krediler için cayma talep edilebilir.</li>
          <li>Cayma bildirimi: <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline">crewenglish@crewcoach.ai</a></li>
          <li>İade süresi: Bildirimin alınmasından itibaren 14 gün içinde ödeme yöntemiyle aynı kanal üzerinden yapılır.</li>
        </ul>

        <h3>6.4 İade Kapsam Dışı Hâller</h3>
        <ul>
          <li>İfaya başlanarak kullanılmış krediler.</li>
          <li>Açık rıza onayı verilip derhâl ifa edilen dijital içerik.</li>
        </ul>
      </section>

      <section id="yukumlulukler">
        <h2>7. Tarafların Yükümlülükleri</h2>

        <h3>7.1 Satıcı'nın Yükümlülükleri</h3>
        <ul>
          <li>Ön Bilgilendirme Formu ve bu Sözleşme'yi Alıcı'ya sunmak</li>
          <li>Ödeme onayıyla derhâl kredi tanımlamak</li>
          <li>Platformun çalışması için makul özeni göstermek (Hatasızlık garanti edilmez; "olduğu gibi" sunulur)</li>
          <li>Tüketicinin cayma hakkı çerçevesinde iade taleplerini değerlendirmek</li>
        </ul>

        <h3>7.2 Alıcı'nın Yükümlülükleri</h3>
        <ul>
          <li>Satın alma ekranındaki onay kutularını okuyup onaylamak</li>
          <li>Hesap bilgilerini güncel tutmak ve giriş bilgilerinin güvenliğini sağlamak</li>
          <li>Kredileri yalnızca kişisel kullanım amaçlı kullanmak; ticari kullanım/alt lisanslama/devir yasaktır</li>
          <li>Platform'u yasalara ve Kullanım Koşulları'na uygun kullanmak</li>
        </ul>
      </section>

      <section id="fesih">
        <h2>8. Fesih ve Sona Erme</h2>
        <ul>
          <li><strong>Alıcı tarafından:</strong> Profil → Ayarlar → Hesabı Sil ile dilediğiniz an sonlandırabilirsiniz.</li>
          <li><strong>Satıcı tarafından:</strong> Kanun, yönetmelik, sözleşme veya Kullanım Koşulları ihlali hâlinde Satıcı hesabı askıya alabilir veya feshedebilir.</li>
          <li><strong>Fesih sonrası:</strong> Kullanılmamış krediler için iade politikası (cayma istisnası saklı kalmak üzere); kullanılmış krediler iade kapsamı dışındadır.</li>
        </ul>
      </section>

      <section id="uyusmazlik">
        <h2>9. Uyuşmazlık Çözümü ve Uygulanacak Hukuk</h2>
        <p><strong>Uygulanacak Hukuk:</strong> Türkiye Cumhuriyeti kanunları.</p>
        <p><strong>Yetkili Merciler:</strong></p>
        <ul>
          <li><strong>Tüketici:</strong> Alıcı'nın yerleşim yerindeki Tüketici Hakem Heyetleri ve/veya Tüketici Mahkemeleri yetkilidir.</li>
          <li><strong>Tüketici Dışı:</strong> İstanbul (Merkez/Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir.</li>
        </ul>
      </section>

      <section id="iletisim">
        <h2>İletişim</h2>
        <InfoCard icon={Mail} variant="neutral" title="Hizmet Sağlayıcı (Satıcı)">
          <p><strong>Şirket:</strong> CrewCoach.ai LLC (Delaware, USA)</p>
          <p><strong>Adres:</strong> 201 Orange Street, Suite 600, Wilmington, DE 19801, USA</p>
          <p><strong>Telefon:</strong> +1 (302) 575-087</p>
          <p>
            <strong>E-posta:</strong>{' '}
            <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline">
              crewenglish@crewcoach.ai
            </a>
          </p>
        </InfoCard>
      </section>

      <div className="border-t pt-8 mt-8">
        <p className="text-sm text-gray-600">
          <strong>Onay:</strong> Bu Mesafeli Satış Sözleşmesi'ni elektronik ortamda onaylayarak içeriğini
          okuduğunuzu ve kabul ettiğinizi beyan edersiniz. Sözleşme elektronik ortamda saklanır.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Detaylı bilgi için{' '}
          <Link href="/kullanim-kosullari" className="text-thy-red hover:underline">
            Kullanım Koşulları
          </Link>{' '}
          ve{' '}
          <Link href="/gizlilik-politikasi" className="text-thy-red hover:underline">
            Gizlilik Politikası
          </Link>
          'nı inceleyebilirsiniz.
        </p>
      </div>
    </LegalLayout>
  );
}
