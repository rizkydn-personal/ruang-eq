import Link from "next/link";
import { dimensions } from "@/lib/assessment/items";
export const metadata = { title: "Metodologi" };
export default function Page() {
  return (
    <article className="narrow page prose">
      <p className="eyebrow">Tentang asesmen</p>
      <h1>
        Refleksi yang bisa
        <br />
        ditelusuri.
      </h1>
      <p className="lead">
        Ruang EQ membantu Anda memperhatikan kebiasaan emosional melalui laporan
        pengalaman sendiri.
      </p>
      <p className="notice">
        Status: draft_self_report. Instrumen ini belum tervalidasi. Hasil
        menggambarkan jawaban Anda saat ini untuk refleksi diri, bukan diagnosis
        atau ukuran EQ terstandar.
      </p>
      <h2>Apa yang ditanyakan?</h2>
      <p>
        Ada 50 butir asli berbahasa Indonesia, 10 per dimensi. Acuan waktunya
        empat minggu terakhir. Lima tahap masing-masing berisi dua butir dari
        setiap dimensi, dengan urutan yang diacak dan tetap sepanjang sesi.
      </p>
      <dl>
        {dimensions.map((d) => (
          <div key={d.id}>
            <dt>
              <strong>{d.name}</strong>
            </dt>
            <dd>{d.description}</dd>
          </div>
        ))}
      </dl>
      <h2>Bagaimana indeks dihitung?</h2>
      <p>
        Jawaban frekuensi bernilai 1 hingga 5. Dua butir berarah negatif per
        dimensi dibalik dengan rumus 6 dikurangi jawaban. Rata-rata respons
        numerik setiap dimensi diubah ke indeks 0–100: (rata-rata − 1) ÷ 4 ×
        100.
      </p>
      <p>
        “Tidak dapat menilai” adalah missing, tidak masuk pembilang maupun
        penyebut. Dimensi memerlukan minimal 8 dari 10 respons numerik. Ambang
        80% ini merupakan kebijakan operasional awal, bukan cutoff ilmiah.
        Ringkasan hanya muncul jika semua dimensi cukup, dengan bobot yang sama.
      </p>
      <h2>Bagaimana membaca hasil?</h2>
      <p>
        Lima dimensi adalah hasil utama. Rekomendasi berasal dari aturan tetap
        yang terkait perilaku dalam butir, bukan analisis AI bebas. Deskripsi
        frekuensi memakai rentang editorial: di bawah 1,5; 1,5–kurang dari 2,5;
        2,5–kurang dari 3,5; 3,5–kurang dari 4,5; dan 4,5–5. Rentang ini
        mengikuti lima label jawaban; bukan kategori kemampuan.
      </p>
      <p>
        Tidak ada norma populasi, persentil, klaim akurasi, atau label
        kepribadian. Selisih kecil tidak dinyatakan bermakna secara statistik.
        Jangan gunakan hasil untuk rekrutmen, kelayakan kerja, atau keputusan
        klinis.
      </p>
      <h2>Apa keterbatasannya?</h2>
      <p>
        Laporan diri dapat dipengaruhi suasana, ingatan, dan keinginan terlihat
        baik. Pengacakan mengubah urutan, bukan isi soal; tidak menjamin soal
        tidak diingat. Kejujuran lebih berguna daripada mencari nilai tinggi.
        Asesmen ditujukan untuk dewasa 18+ dan bukan layanan krisis atau
        diagnosis.
      </p>
      <h2>Langkah validasi yang masih diperlukan</h2>
      <p>
        Review isi oleh ahli, wawancara kognitif, pilot yang direncanakan ahli,
        pemeriksaan struktur faktor, reliabilitas, test-retest, bukti hubungan
        dengan ukuran lain, dan bias kelompok belum dilakukan. Tidak ada peserta
        atau hasil penelitian yang diklaim. Reliabilitas saja tidak membuktikan
        validitas.
      </p>
      <h2>Dasar kehati-hatian</h2>
      <p>
        Literatur kecerdasan emosional membedakan laporan diri dari pengukuran
        kinerja. Lima dimensi menjadi kerangka konseptual produk, bukan adopsi
        resmi instrumen berlisensi.
      </p>
      <ul>
        <li>
          <a href="https://pubmed.ncbi.nlm.nih.gov/15951360/">
            Tett, Fox & Wang (2005): pengembangan dan validasi ukuran laporan
            diri multidimensi
          </a>
        </li>
        <li>
          <a href="https://pubmed.ncbi.nlm.nih.gov/16436018/">
            Perbandingan metode performance-based dan self-report
          </a>
        </li>
      </ul>
      <p>Versi instrumen: eq-id-1.0.0. Skoring: 1.0.0. Interpretasi: 1.0.0.</p>
      <Link className="button primary" href="/test">
        Mulai refleksi
      </Link>
    </article>
  );
}
