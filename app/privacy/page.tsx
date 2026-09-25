import Link from "next/link";
export const metadata = { title: "Privasi & data" };
export default function Page() {
  return (
    <article className="narrow page prose">
      <p className="eyebrow">Privasi & data</p>
      <h1>
        Anda memilih
        <br />
        cara menyimpan.
      </h1>
      <h2>Jika Anda menggunakan guest</h2>
      <p>
        Jawaban dan hasil diproses di browser, disimpan di memori dan
        sessionStorage untuk memulihkan refresh dalam tab yang sama. Tidak ada
        anonymous Firebase login, arsip cloud, atau analytics jawaban. Aplikasi
        tidak menyimpan hasil guest di localStorage atau IndexedDB.
      </p>
      <p>
        Unduh hasil sebelum menutup sesi. Browser tertentu dapat memulihkan
        sesi; kami tidak menjanjikan penghapusan forensik. Tombol Hapus sesi
        menghapus state dan entri sessionStorage aplikasi. Tes baru menggantikan
        sesi lama setelah konfirmasi.
      </p>
      <h2>Jika Anda masuk dengan Google</h2>
      <p>
        Firebase Authentication mengelola login. Jawaban, urutan soal, versi
        instrumen, waktu penyimpanan, dan hasil disimpan di Cloud Firestore pada
        ruang akun Anda. Aplikasi tidak menyalin email atau avatar ke dokumen
        profil. Identitas login tetap dikelola oleh Firebase Authentication.
      </p>
      <p>
        Jawaban guest lama tidak otomatis diunggah saat login. Sesi akun
        menggunakan penyimpanan browser sementara; tidak mengaktifkan cache
        Firestore persisten. Jika penyimpanan gagal, status akan menampilkan
        kegagalan dan tombol coba lagi. Jawaban tetap berada di sesi tab selama
        tersedia.
      </p>
      <h2>Menghapus dan keluar</h2>
      <p>
        Hapus hasil melalui Riwayat untuk menghapus satu dokumen draft atau
        hasil dari cloud. Hapus akun dan semua data mencakup seluruh subkoleksi
        asesmen serta akun autentikasi, dengan login ulang. Jika proses
        terputus, coba lagi. Keluar membersihkan cache sesi aplikasi, tetapi
        bukan hasil yang sudah disimpan di akun.
      </p>
      <h2>Unduhan dan akses</h2>
      <p>
        PNG dan PDF dibuat di perangkat dan tidak diunggah kembali oleh
        aplikasi. Berkas yang Anda unduh tetap ada di lokasi unduhan sampai Anda
        menghapusnya sendiri. Tidak ada tautan hasil publik. Jawaban tidak
        dimasukkan ke URL, log aplikasi, atau rekaman sesi.
      </p>
      <h2>Layanan eksternal</h2>
      <p>
        Mode Google menggunakan layanan Firebase untuk autentikasi dan
        penyimpanan. Operator deployment perlu menetapkan lokasi data, retensi
        operasional, serta kontak pengelola sebelum peluncuran publik.
        Keterangan ini menjelaskan perilaku aplikasi, bukan klaim sertifikasi
        kepatuhan.
      </p>
      <Link className="button secondary" href="/test">
        Kembali ke asesmen
      </Link>
    </article>
  );
}
