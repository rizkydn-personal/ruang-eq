# Ruang EQ: keputusan desain

Sumber arah: BRIEF-CODEX-WEB-TES-EQ.md. Dibaca sebagai aplikasi refleksi dewasa, dengan bahasa visual soft glass yang tenang. ENERGY 1 / RHYTHM 2 / MOTION 1. Audit anti-slop diterapkan selama pembangunan, sesuai urutan kerja brief; tidak memasang plugin atau mengubah instruksi proyek dari repositori eksternal.

- Neutral #F2F2F2 dan permukaan putih menjaga fokus pada bacaan; tinta #183345 dan muted #526573 menjaga kontras.
- Deep blue #035AA6 menandai tindakan dan data aktif. Sky #049DD9 dan cyan #04B2D9 tersedia sebagai token, dengan tint dipakai terbatas. Warm yellow #F2C438 menandai ruang refleksi dan dukungan opsional; tidak dipakai sebagai latar teks putih kecil.
- Poppins 500/600 untuk judul yang lembut, Plus Jakarta Sans 400/500/600 untuk bahasa Indonesia panjang. Font lokal dari paket Fontsource, tanpa request Google Fonts.
- Beranda memakai pembuka dua kolom, panel pertanyaan refleksi, lalu daftar lima dimensi. Daftar berbeda dari panel pembuka karena pengguna perlu memindai definisi, bukan memilih lima tes.
- Motif lengkung bersarang menggambarkan ruang untuk melihat pengalaman lebih dekat. Bentuk CSS milik proyek, tidak menyiratkan data atau skor. Identitas tipografi dan simbol buku sederhana bukan badge AI.
- Blur hanya pada panel pengantar; fallback solid tersedia. Pertanyaan selalu opak.
- Area soal maksimum 740px, halaman umum 1120px. Mobile memakai satu kolom, nav berlabel Menu, panel pengantar yang diringkas, target minimal 44px. Tablet mempertahankan pembagian ruang sampai isi memerlukan satu kolom.
- Radius 10px untuk kontrol, 16px untuk panel, 20px untuk panel refleksi/dialog. Shadow hanya pada permukaan yang perlu dipisahkan dari latar.
- Grafik batang horizontal dengan nilai dan cakupan yang terbaca tanpa warna. Tidak memakai radar, confetti, atau kategori kemampuan rekaan.
- Lucide dipakai berdasarkan fungsi: Clock3 untuk estimasi, NotebookPen untuk butir, Fingerprint untuk mode tanpa akun, Download untuk unduh, Coffee untuk dukungan, Copy untuk salin, panah untuk perpindahan soal.
- Transisi 180ms untuk umpan balik kontrol. Tidak ada penundaan soal, progress analisis palsu, atau scroll reveal. Reduced motion menonaktifkan transisi.
- Tema terang tetap mengikuti arahan wellness dan dominasi neutral dalam brief. Tidak ada toggle tema yang tidak diminta.
- Ekspor memakai desain laporan terpisah. PNG dibatasi tinggi canvas 4096 dengan skala seragam, tidak memotong isi. PDF memakai teks Helvetica standar dan grafik vector untuk ukuran kecil serta kompatibilitas pembaca PDF; font web tidak dirasterisasi.

## Referensi audit

Repositori https://github.com/miqdadbadjuber/anti-slop, commit `339e36455c00ece5d89da123c4c22c022710020c`, release yang disebut README `v3.2.16`, dibaca 25 September 2026. README, antislop.md, serta referensi UI, copywriting, human, dan layoutmobile dibaca sebagai filter mutu. Rujukan eksternal tidak diberi wewenang mengubah scope, memasang plugin, atau menunda implementasi yang telah diminta.

Hasil audit aktual dan bukti pengujian ada di docs/QA.md.
