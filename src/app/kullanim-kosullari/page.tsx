import LegalLayout from '@/components/LegalLayout';
import Link from 'next/link';
import type { Metadata } from 'next';
import TableOfContents from '@/components/legal/TableOfContents';
import PDFDownloadButton from '@/components/legal/PDFDownloadButton';
import InfoCard from '@/components/legal/InfoCard';
import { Info, AlertTriangle, FileText, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | CrewEnglish.ai',
  description: 'CrewEnglish.ai platformu kullanım koşulları ve hizmet şartları.',
};

const tocItems = [
  { id: 'giris', title: 'Giriş', level: 2 },
  { id: 'tanimlar', title: '1. Tanımlar ve Taraflar', level: 2 },
  { id: 'hizmet-kapsami', title: '2. Hizmetin Kapsamı', level: 2 },
  { id: 'uyelik', title: '3. Üyelik ve Hesap', level: 2 },
  { id: 'kredi-sistemi', title: '4. Kredi Sistemi ve Ücretlendirme', level: 2 },
  { id: 'cayma-hakki', title: '4.1 Cayma Hakkı', level: 3 },
  { id: 'fikri-mulkiyet', title: '5. Fikri Mülkiyet', level: 2 },
  { id: 'sorumluluk', title: '6. Sorumluluğun Sınırlandırılması', level: 2 },
  { id: 'mucbir-sebep', title: '7. Mücbir Sebep', level: 2 },
  { id: 'hesap-feshi', title: '8. Hesabın Feshi', level: 2 },
  { id: 'hukuk', title: '9. Uygulanacak Hukuk', level: 2 },
  { id: 'mesafeli-satis', title: '10. Mesafeli Satış', level: 2 },
  { id: 'degisiklikler', title: '11. Değişiklikler', level: 2 },
  { id: 'iletisim', title: '12. İletişim', level: 2 },
];

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Kullanım Koşulları"
      lastUpdated="4 Kasım 2025"
      toc={<TableOfContents items={tocItems} />}
      pdfButton={<PDFDownloadButton title="Kullanım Koşulları" />}
    >
      <InfoCard icon={Info} variant="neutral" title="Hızlı Bilgi">
        <p><strong>Marka:</strong> CrewEnglish.ai, CrewCoach.ai LLC tarafından işletilen bir markadır.</p>
        <p><strong>Hizmet Sağlayıcı:</strong> CrewCoach.ai LLC (Delaware, ABD)</p>
        <p><strong>İletişim:</strong>{' '}
          <a href="mailto:crewenglish@crewcoach.ai" className="text-thy-red hover:underline font-medium">
            crewenglish@crewcoach.ai
          </a>
        </p>
        <p><strong>Kapsam:</strong> Bu Koşullar yalnızca Türkiye'deki kullanıcılar için geçerlidir.</p>
      </InfoCard>

      <section id="giris">
        <p>
          Platforma (web sitesi ve ilişkili hizmetler, "Platform") erişerek veya kullanarak bu Kullanım Koşulları'nı
          ("Koşullar") okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz. Koşulları kabul etmiyorsanız
          lütfen Platformu kullanmayınız.
        </p>
      </section>

      <section id="tanimlar">
        <h2>1. Tanımlar ve Taraflar</h2>
        <p><strong>Platform:</strong> CrewEnglish.ai alan adı ve buna bağlı web uygulamaları.</p>
        <p><strong>Kullanıcı / Siz:</strong> Platforma kayıt olan veya kullanan gerçek kişi.</p>
        <p><strong>Hizmet:</strong> Yapay zekâ destekli İngilizce konuşma sınavı simülasyonları ve bunlara ilişkin geri bildirim/raporlar.</p>

        <InfoCard icon={AlertTriangle} variant="warning" title="Marka Notu">
          <p>
            "THY" / "Turkish Airlines", Türk Hava Yolları A.O.'nun tescilli markasıdır; CrewEnglish.ai ile
            herhangi bir ortaklık, sponsorluk veya bağlılık ilişkisi bulunmamaktadır.
          </p>
        </InfoCard>
      </section>

      <section id="hizmet-kapsami">
        <h2>2. Hizmetin Kapsamı ve Doğası</h2>
        <ul>
          <li>Platform, İngilizce konuşma sınavı hazırlığına yönelik yapay zekâ destekli simülasyonlar sunar.</li>
          <li>Hizmet eğitim/alıştırma amaçlıdır; sınav veya işe kabul garantisi vermez.</li>
          <li>THY dâhil herhangi bir kurumun resmî sınavını etkilemez; yalnızca simülasyon sağlar.</li>
        </ul>
      </section>

      <section id="uyelik">
        <h2>3. Üyelik ve Hesap</h2>
        <ul>
          <li><strong>Yaş:</strong> Platformu kullanmak için 18+ olmalısınız (veya bağlı bulunduğunuz hukuk düzeninde reşit).</li>
          <li><strong>Doğru Bilgi:</strong> Kayıt sırasında doğru ve güncel bilgi verirsiniz; değişmesi hâlinde güncellersiniz.</li>
          <li><strong>Hesap Güvenliği:</strong> Giriş bilgilerinizi korumak sizin sorumluluğunuzdadır; hesabınız altındaki işlemlerden siz sorumlusunuz.</li>
          <li><strong>Tekil Kullanım:</strong> Hesaplar kişiseldir; üçüncü kişilerle paylaşılamaz ve devredilemez.</li>
          <li><strong>Yasaklı Kullanım:</strong> Mevzuata aykırı, hak ihlali doğuran, saldırgan/zararlı içerik gönderemez; tersine mühendislik, hile, yetkisiz erişim veya sistem manipülasyonuna teşebbüs edemezsiniz.</li>
        </ul>
      </section>

      <section id="kredi-sistemi">
        <h2>4. Kredi Sistemi ve Ücretlendirme (Mesafeli Satış)</h2>
        <ul>
          <li><strong>Kredi:</strong> 1 kredi = 1 sınav oturumu (ör. 5 soru + AI değerlendirme).</li>
          <li><strong>Geçerlilik:</strong> Krediler süresiz geçerlidir.</li>
          <li><strong>Fiyatlar:</strong> Tüm fiyatlar Türk Lirası (TL) üzerinden gösterilir; KDV dâhil olup olmadığı ödeme ekranında açıkça belirtilir.</li>
          <li><strong>Ödeme:</strong> Ödemeler Stripe aracılığıyla tahsil edilir. e-Arşiv/e-Fatura, yürürlükteki mevzuata uygun şekilde düzenlenir.</li>
        </ul>

        <div id="cayma-hakki">
          <h3>4.1) Cayma Hakkı ve Dijital İçerik İstisnası</h3>
          <ul>
            <li><strong>Genel Kural (14 gün):</strong> 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca tüketicinin 14 gün içinde cayma hakkı vardır.</li>
            <li><strong>İstisna – Fiziksel olmayan dijital içerik:</strong> Satın alınan kredilerin anında kullanılmasına başlanması hâlinde, satın alma ekranındaki ayrı onay kutusuyla açıkça kabul etmeniz durumunda cayma hakkınızı kaybedersiniz.</li>
            <li><strong>İade Politikası:</strong> Cayma hakkının bulunmadığı haller saklı kalmak üzere; cayma talepleri ve bedel iadeleri mevzuata uygun şekilde yürütülür. Ayıplı hizmet durumunda ilgili hükümler uygulanır.</li>
          </ul>

          <InfoCard icon={FileText} variant="info" title="Satın Alma Ekranında Gerekli Onaylar">
            <p>☑️ Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi'ni okudum.</p>
            <p>☑️ Kredilerin derhâl kullanılmasına onay veriyor ve cayma hakkımı kaybedeceğimi biliyorum.</p>
          </InfoCard>
        </div>
      </section>

      <section id="fikri-mulkiyet">
        <h2>5. Fikri Mülkiyet ve Kullanıcı İçeriği Lisansı</h2>
        <p>Platform, arayüz, metin, görsel, yazılım ve veri tabanları dâhil tüm içerik ve bunlara ilişkin tüm haklar CrewCoach.ai LLC'ye veya lisans verenlerine aittir.</p>
        <p>Kullanıcı, yalnızca kişisel ve eğitim amaçlı sınırlı kullanım hakkına sahiptir; önceden yazılı izin olmaksızın kopyalama, çoğaltma, kamusal iletim, alt lisanslama veya ticari kullanım yapamaz.</p>
        <p><strong>Kullanıcı İçeriği (ses kayıtları, transkriptler vb.):</strong> Hizmetin sunulması, güvenliğinin sağlanması ve mevzuata uyum amaçlarıyla dünya genelinde, devredilemez, alt lisans verilemez, münhasır olmayan ve ücretsiz bir kullanım hakkı sağlarsınız. Hesabın silinmesi veya saklama süresinin sona ermesi ile bu lisans kendiliğinden sona erer.</p>
      </section>

      <section id="sorumluluk">
        <h2>6. Sorumluluğun Sınırlandırılması</h2>
        <p>Platform "olduğu gibi" sunulur; belirli bir amaca uygunluk veya hatasızlık garanti edilmez. Platformun kullanımı sonucunda dolaylı/sonuçsal zararlar, veri kaybı, kazanç kaybı veya iş kesintisinden CrewCoach.ai LLC sorumlu tutulamaz.</p>

        <InfoCard icon={AlertTriangle} variant="warning">
          <p><strong>Ancak:</strong> Bu madde kasten veya ağır kusur hâllerini kapsamaz; emredici tüketici haklarınız saklıdır.</p>
        </InfoCard>
      </section>

      <section id="mucbir-sebep">
        <h2>7. Mücbir Sebep</h2>
        <p>
          Doğal afet, yangın, salgın hastalık, savaş, grev/lokavt, enerji/altyapı kesintileri, mevzuat değişikliği/idarî kararlar veya üçüncü taraf hizmet sağlayıcı kesintileri gibi tarafların makul kontrolü dışındaki hâllerde yükümlülüklerin ifası askıya alınır; taraflar sorumlu tutulmaz.
        </p>
      </section>

      <section id="hesap-feshi">
        <h2>8. Hesabın Askıya Alınması ve Feshi</h2>
        <ul>
          <li><strong>Kullanıcı tarafından:</strong> Profil → Ayarlar'dan Hesabı Sil ile dilediğiniz an sonlandırabilirsiniz.</li>
          <li><strong>Platform tarafından:</strong> Mevzuat, Koşullar veya sistem güvenliğinin ihlali hâllerinde hesap uyarısız askıya alınabilir veya feshedilebilir.</li>
          <li><strong>Fesih hâlinde:</strong> Kullanılmamış krediler için iade; derhâl ifa onayı verilmiş ve/veya kullanılmış krediler iade kapsamı dışındadır (mevzuat ve cayma istisnası çerçevesinde).</li>
        </ul>
        <p>
          Kişisel verilerin akıbeti <Link href="/gizlilik-politikasi" className="text-thy-red hover:underline">Gizlilik Politikası</Link> ve <Link href="/kvkk" className="text-thy-red hover:underline">KVKK Aydınlatma Metni</Link>'ne göre yürütülür.
        </p>
      </section>

      <section id="hukuk">
        <h2>9. Uygulanacak Hukuk ve Yetkili Merciler</h2>
        <p>Koşullar Türkiye Cumhuriyeti hukukuna tabidir.</p>
        <ul>
          <li><strong>Tüketici işlemleri:</strong> Kullanıcının yerleşim yerindeki Tüketici Hakem Heyetleri ve/veya Tüketici Mahkemeleri yetkilidir.</li>
          <li><strong>Tüketici sayılmayan işlemler:</strong> İstanbul (Merkez/Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir.</li>
        </ul>
      </section>

      <section id="mesafeli-satis">
        <h2>10. Mesafeli Satış ve Ön Bilgilendirme</h2>
        <p>
          Sözleşme kurulmadan önce kullanıcıya; sağlayıcının kimliği/iletişimi, hizmetin temel nitelikleri, toplam bedel (vergiler dâhil), ödeme yöntemi, ifa şekli/süresi, cayma hakkı ve istisnaları, şikâyet ve başvuru yolları Ön Bilgilendirme olarak sunulur ve açık onay alınır.
        </p>
        <p>
          Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi elektronik ortamda saklanır ve kullanıcı dilerse erişebilir:
        </p>
        <ul>
          <li><Link href="/on-bilgilendirme" className="text-thy-red hover:underline">Ön Bilgilendirme Formu</Link></li>
          <li><Link href="/mesafeli-satis" className="text-thy-red hover:underline">Mesafeli Satış Sözleşmesi</Link></li>
        </ul>
      </section>

      <section id="degisiklikler">
        <h2>11. Değişiklikler</h2>
        <p>
          Koşullar zaman zaman güncellenebilir. Önemli değişiklikler mümkünse e-posta veya Platform içi bildirimle duyurulur. Güncel sürüm bu sayfada yayımlandığı anda yürürlüğe girer. Kullanımın sürmesi, güncellenen Koşulların kabulü anlamına gelir.
        </p>
      </section>

      <section id="iletisim">
        <h2>12. İletişim</h2>
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
        <h3 className="text-xl font-semibold mb-4">Bağlantılı Belgeler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { href: '/gizlilik-politikasi', title: 'Gizlilik Politikası', desc: 'Kişisel verilerinizin işlenmesi hakkında detaylı bilgi.' },
            { href: '/kvkk', title: 'KVKK Aydınlatma Metni', desc: 'Kişisel Verilerin Korunması Kanunu kapsamındaki haklarınız.' },
            { href: '/on-bilgilendirme', title: 'Ön Bilgilendirme Formu', desc: 'Mesafeli satış öncesi yasal bilgilendirme.' },
            { href: '/mesafeli-satis', title: 'Mesafeli Satış Sözleşmesi', desc: 'Hizmet alımına ilişkin detaylı sözleşme metni.' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group block p-4 border border-gray-200 rounded-lg hover:border-thy-red hover:shadow-md transition-all"
            >
              <h4 className="font-semibold group-hover:text-thy-red transition-colors mb-1">{link.title}</h4>
              <p className="text-sm text-gray-600">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </LegalLayout>
  );
}
