import LegalLayout from '@/components/LegalLayout';
import Link from 'next/link';
import type { Metadata } from 'next';
import TableOfContents from '@/components/legal/TableOfContents';
import PDFDownloadButton from '@/components/legal/PDFDownloadButton';
import InfoCard from '@/components/legal/InfoCard';
import { Info, AlertTriangle, FileText, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ön Bilgilendirme Formu | CrewEnglish.ai',
  description: 'CrewEnglish.ai mesafeli satış ön bilgilendirme formu.',
};

const tocItems = [
  { id: 'giris', title: 'Giriş', level: 2 },
  { id: 'hizmet-nitelikleri', title: '1. Hizmetin Temel Nitelikleri', level: 2 },
  { id: 'bedel-vergiler', title: '2. Bedel ve Vergiler', level: 2 },
  { id: 'teslim-ifa', title: '3. Teslim/İfa', level: 2 },
  { id: 'cayma-hakki', title: '4. Cayma Hakkı', level: 2 },
  { id: 'cayma-kullanimi', title: '5. Cayma Hakkının Kullanımı', level: 2 },
  { id: 'odeme-ve-fatura', title: '6. Ödeme ve Fatura', level: 2 },
  { id: 'sikayet-basvuru', title: '7. Şikâyet ve Başvuru', level: 2 },
  { id: 'iletisim', title: 'İletişim', level: 2 },
];

export default function PreInformationForm() {
  return (
    <LegalLayout
      title="Ön Bilgilendirme Formu"
      lastUpdated="4 Kasım 2025"
      toc={<TableOfContents items={tocItems} />}
      pdfButton={<PDFDownloadButton title="Ön Bilgilendirme Formu" />}
    >
      <InfoCard icon={Info} variant="neutral" title="Hizmet Sağlayıcı">
        <p><strong>Marka:</strong> CrewEnglish.ai</p>
        <p><strong>Şirket:</strong> CrewCoach.ai LLC (Delaware, USA)</p>
        <p><strong>Adres:</strong> 201 Orange Street, Suite 600, Wilmington, DE 19801, USA</p>
        <p><strong>Telefon:</strong> +1 (302) 575-087</p>
        <p>
          <strong>E-posta:</strong>{' '}
          <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline">
            crewenglish@crewcoach.ai
          </a>
        </p>
        <p className="mt-2"><strong>Kapsam:</strong> Bu ön bilgilendirme yalnızca Türkiye'deki kullanıcılar (tüketiciler) için geçerlidir.</p>
      </InfoCard>

      <section id="giris">
        <InfoCard icon={AlertTriangle} variant="warning">
          <p>
            <strong>Not:</strong> "THY / Turkish Airlines", Türk Hava Yolları A.O.'nun tescilli markasıdır;
            CrewEnglish.ai ile herhangi bir ortaklık/sponsorluk/bağlılık ilişkisi bulunmamaktadır.
          </p>
        </InfoCard>
      </section>

      <section id="hizmet-nitelikleri">
        <h2>1. Hizmetin Temel Nitelikleri</h2>
        <ul>
          <li><strong>Amaç:</strong> Yapay zekâ destekli İngilizce konuşma sınavı simülasyonları ve kişisel geri bildirim/raporlar.</li>
          <li><strong>Kapsam:</strong> 1 kredi = 1 sınav oturumu (ör. 5 soru + AI değerlendirme).</li>
          <li><strong>Nitelik:</strong> Dijital içerik ve anında ifa (çevrim içi).</li>
          <li><strong>Garanti:</strong> Eğitim/alıştırma amaçlıdır; sınav/işe kabul garantisi vermez.</li>
        </ul>
      </section>

      <section id="bedel-vergiler">
        <h2>2. Bedel, Vergiler ve Ek Masraflar</h2>
        <ul>
          <li><strong>Fiyatlandırma Para Birimi:</strong> TL.</li>
          <li><strong>Toplam Bedel:</strong> Ödeme ekranında KDV dâhil/haricî durumu açıkça gösterilir; varsa tüm ek masraflar ayrıca belirtilir.</li>
          <li><strong>Ödeme Yöntemleri:</strong> Kredi/banka kartı (Stripe).</li>
          <li><strong>Belge:</strong> e-Arşiv/e-Fatura mevzuata uygun düzenlenir ve iletilir.</li>
        </ul>
      </section>

      <section id="teslim-ifa">
        <h2>3. Teslim/İfa Şekli ve Süresi</h2>
        <ul>
          <li><strong>Teslim:</strong> Dijital içerik; hesaba kredi tanımlanması ve Platform üzerinden kullanımı.</li>
          <li><strong>Süre:</strong> Ödeme onayıyla derhâl.</li>
          <li><strong>Teknik Gereksinimler:</strong> Güncel tarayıcı, mikrofon ve kararlı internet bağlantısı.</li>
        </ul>
      </section>

      <section id="cayma-hakki">
        <h2>4. Cayma Hakkı ve İstisna (Dijital İçerik)</h2>
        <ul>
          <li>
            <strong>Genel Kural:</strong> 6502 sayılı TKHK ve ilgili yönetmelik uyarınca tüketicinin 14 gün içinde cayma hakkı vardır.
          </li>
          <li>
            <strong>İstisna:</strong> Fiziksel olmayan dijital içerikte, ifaya derhâl başlanması ve
            tüketicinin açık onayı hâlinde cayma hakkı kullanılamaz.
          </li>
        </ul>

        <InfoCard icon={FileText} variant="info" title="UI Onayları (Ödeme Ekranı)">
          <p>☑️ Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi'ni okudum.</p>
          <p>☑️ Kredilerin derhâl kullanılmasına onay veriyor ve cayma hakkımı kaybedeceğimi biliyorum.</p>
        </InfoCard>
      </section>

      <section id="cayma-kullanimi">
        <h2>5. Cayma Hakkının Kullanımı (Hakkın Bulunduğu Hâller)</h2>
        <ul>
          <li>
            <strong>Yöntem:</strong>{' '}
            <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline">
              crewenglish@crewcoach.ai
            </a>{' '}
            adresine "Cayma Talebi" konulu e-posta.
          </li>
          <li><strong>Süre:</strong> Bildirimden itibaren 14 gün içinde iade yapılır.</li>
          <li><strong>Kapsam:</strong> Kullanılmamış krediler iade edilebilir; kullanılmış krediler iade kapsamı dışındadır.</li>
          <li><strong>İade Yöntemi:</strong> Ödeme yönteminizle aynı kanal (kart/hesap).</li>
        </ul>
      </section>

      <section id="odeme-ve-fatura">
        <h2>6. Ödeme ve Fatura</h2>
        <ul>
          <li><strong>Alıcı tarafından:</strong> Kartla ödeme (Stripe), ödeme onayıyla sözleşme kurulur.</li>
          <li><strong>Satıcı tarafından:</strong> e-Arşiv/e-Fatura Alıcı'ya iletilir.</li>
        </ul>
      </section>

      <section id="sikayet-basvuru">
        <h2>7. Şikâyet ve Başvuru Yolları</h2>
        <ul>
          <li><strong>Tüketici Hakem Heyeti:</strong> Alıcı, yerleşim yerindeki Tüketici Hakem Heyeti'ne başvurabilir (parasal limitler: Yönetmelik eki).</li>
          <li><strong>Tüketici Mahkemesi:</strong> Alıcı, yerleşim yerindeki Tüketici Mahkemesi'ne dava açabilir.</li>
          <li>
            <strong>Tüketici konuları:</strong>{' '}
            <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline">
              crewenglish@crewcoach.ai
            </a>
          </li>
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
          <strong>Onay:</strong> Bu Ön Bilgilendirme Formu'nu elektronik ortamda onaylayarak içeriğini okuduğunuzu
          ve kabul ettiğinizi beyan edersiniz. Devamında{' '}
          <Link href="/mesafeli-satis" className="text-thy-red hover:underline">
            Mesafeli Satış Sözleşmesi
          </Link>
          'ni onaylayarak satın alma işlemine devam edebilirsiniz.
        </p>
      </div>
    </LegalLayout>
  );
}
