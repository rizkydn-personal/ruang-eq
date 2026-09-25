# Laporan QA implementasi

Tanggal: 25 September 2026. Windows, Node 24.18.1, Chromium Playwright 153, Firebase Auth/Firestore Emulator dengan project `demo-ruang-eq`, Java 21. Data browser dan laporan contoh berasal dari fixture otomatis, bukan asesmen pengguna atau hasil penelitian.

## Hasil pengujian aktual

| Pemeriksaan | Perintah / metode | Hasil |
| --- | --- | --- |
| TypeScript strict | `npm run typecheck` | PASS, tanpa error |
| Lint | `npm run lint` | PASS, tanpa error/warning ESLint |
| Produksi | `npm run build` | PASS; seluruh halaman dan Route Handler terbangun |
| Engine dan PDF | `npm test` | PASS, 7 tes |
| Otorisasi dan transaksi | `npm run test:security`; pada emulator yang sudah berjalan: `npx vitest run tests/security.integration.ts` dengan emulator env | PASS, 5 tes pada revisi akhir |
| Guest lengkap | `npm run test:e2e` | PASS untuk alur 50 jawaban, refresh, missing, review, hasil, PNG, PDF, kosongkan sesi; 0 request Auth/Firestore/API attempt saat guest tanpa konfigurasi |
| Viewport dan aksesibilitas | `npm run test:e2e -- --grep responsive` | PASS, 360/390/768/1024/1440; tidak ada overflow horizontal; navigasi menu mobile, radio keyboard; axe tidak menemukan pelanggaran pada halaman yang diperiksa |
| Hasil parsial dan pembesaran teks | `npm run test:e2e -- --grep partial` | PASS setelah perbaikan reflow; agregat tersembunyi untuk semua missing; viewport utama, teks 200%, reduced motion, Tab/Escape/fokus kembali |
| Google emulator end-to-end | `$env:EQ_E2E_EMULATOR='1'; npm run test:e2e` (tes alur akun) | PASS, login popup, save, simulasi jaringan putus, retry, resume draft, 50 jawaban, finalisasi, riwayat, buka snapshot, hapus hasil, logout dan session cleanup |
| Login mobile dan dialog | `$env:EQ_E2E_EMULATOR='1'; npm run test:e2e -- --grep 'mobile\|donation'` | PASS, 2 tes: popup dibatalkan, popup diblokir, redirect login emulator berhasil; rekening simulasi panjang, salin native clipboard, penolakan clipboard, Escape dan fokus pemicu |
| PDF aktual | `node scripts/inspect-pdf.mjs` setelah fixture E2E dibuat | PASS, 4 halaman A4, **8.031 byte**, selectable text, 5 dimensi + disclaimer + Hari 7 terdeteksi, teks tidak bertabrakan dengan footer |
| Inspeksi visual | PNG beranda desktop/mobile, soal mobile, laporan PNG dan keempat halaman PDF dibuka sebagai gambar | PASS pada fixture yang diperiksa; font, pemenggalan, grafik, footer terbaca |
| Dependency produksi | `npm audit --omit=dev` setelah override uuid | PASS, **0 vulnerabilities** |
| Smoke build produksi lokal | `npm start`, Playwright guest sampai soal berikutnya | PASS, 0 pageerror; `/result` 200 dan `/api/attempts` tanpa token 401, keduanya `private, no-store` |

Tes keamanan mencakup owner read, non-owner/unauth read ditolak, semua SDK write/delete ditolak, invalid token/origin/schema, konflik revisi, skor client diabaikan, dua finalisasi bersamaan menghasilkan satu snapshot, delete seluruh subkoleksi + Auth, payload >24 KB ditolak, shared rate limit, serta kegagalan Auth setelah penghapusan data yang dapat dicoba ulang tanpa membuka write baru.

Tes engine memeriksa tepat 50 ID unik; 10 item dan 2 reverse per dimensi; 5 tahap dengan 2 per dimensi; seed stabil dan bervariasi; minimum/maksimum terarah 0/100; reverse; missing; cakupan 7/8; agregat parsial; invariansi urutan; versi/schema; PDF full/partial di bawah 5 MB.

Run awal menemukan selector emulator yang tidak mempunyai label aksesibel, timeout kompilasi pertama, serta selector alert ganda karena route announcer Next. Tes disesuaikan dengan DOM emulator aktual dan waktu kompilasi lokal. Ini tidak dilaporkan sebagai kerusakan produk. Temuan produk yang diperbaiki: konflik draft bersih yang tersimpan ulang saat refresh, waktu selesai yang tertimpa respons draft terlambat, judul hasil parsial overflow pada teks 200%, dan Tab dialog satu tombol yang dapat berpindah ke chrome browser. Tes terkait kemudian lulus. Ringkasan PASS di atas merupakan hasil run relevan terakhir, bukan klaim semua tes dijalankan sekaligus dalam satu run.

## Bukti yang disimpan

`docs/qa-artifacts/` berisi beranda 1440 dan 360, soal mobile, serta fixture `report.png` dan `report.pdf`. Semuanya data sintetis uji. File PDF 8.031 byte adalah contoh aktual; unit test juga membuat fixture parsial. Batas 5.000.000 byte diperiksa pada setiap ekspor pengguna. Output tes dan trace sementara ada di `test-results/`, yang dibersihkan Playwright pada run berikutnya.

Screenshot bernama `home-production-1440.png`, `home-production-360.png`, dan `question-production-360.png` berasal dari build produksi lokal terakhir (tanpa overlay Next dev). Variabel Firebase public, Admin dan rekening terdeteksi terisi pada `.env.local`; keberadaan nilai tidak diperlakukan sebagai bukti integrasi produksi berhasil. Tidak ada nilai credential/rekening yang dicantumkan dalam laporan ini.

PNG fixture memakai lebar 1440, seluruh lima dimensi, latihan dan rencana tujuh hari. Canvas menurunkan skala seragam jika konten melewati tinggi 4096. Tidak ada screenshot viewport yang dipakai sebagai laporan. PDF memakai teks/vector, bukan screenshot. Render PDF memakai standard-font outlines PDF.js (bukan fallback font sistem yang dapat berbeda antarperangkat).

## Audit anti-slop

Referensi: commit `339e36455c00ece5d89da123c4c22c022710020c` pada miqdadbadjuber/anti-slop, README menyebut v3.2.16. Arah utama tetap BRIEF dan DESIGN.md.

- **Hard Gate PASS pada scope yang diuji:** tidak ada testimoni/statistik rekaan, headline akurasi, public result link, nav mati, atau progress analisis palsu. Semua halaman inti berisi alur nyata. Empty/error/loading ada; guest dan akun diuji. Hasil dan ekspor memuat batas klaim. Tanda kosong pada review adalah simbol missing, bukan gaya prosa.
- **Purpose Gate PASS:** alasan palet, font lokal, panel glass tunggal, motif lengkung, ikon, panah perpindahan, shadow dan layout tercatat di DESIGN.md. Tidak memakai neon gradient, glow dekoratif, template dashboard, atau kartu fitur generik berulang.
- **Liveliness PASS:** ENERGY 1 / RHYTHM 2 / MOTION 1; focal point beranda adalah ajakan refleksi, pengerjaan adalah satu soal, hasil adalah profil lima dimensi. Ritme pembuka/daftar/pernyataan batas berbeda sesuai isi. Aksen kuning terbatas dan motif ruang konsisten.
- **Craftsmanship/Quality Locks PASS pada fixture dan platform yang diuji:** tombol dan tautan utama memiliki perilaku; mobile reflow, radio keyboard, native dialog plus focus wrap, reduced motion, error/retry, hasil parsial serta unduhan berfungsi. Perbaikan diuji ulang. Tidak mengklaim semua browser, screen reader, atau produksi sudah diverifikasi.

Kontras yang dihitung dengan rumus luminansi WCAG: #035AA6/putih 6,96:1; #183345/putih 13,14:1; #526573/#F7F8F8 5,69:1; #526573/#EAF3F6 5,38:1; #526573/#FAF3D9 5,45:1; #9D2929/putih 7,55:1. Batas kontrol #7B8E99/putih 3,40:1. Aksen dekoratif tidak menjadi satu-satunya penyampai informasi. Audit axe dijalankan pada halaman beranda, pertanyaan, hasil, privasi, metodologi dan empty history/result sesuai tes.

## Batas verifikasi dan pekerjaan eksternal

- Login Google **produksi**, authorized domains, credential Admin, deployment rules/indexes/TTL serta redirect same-site belum diuji terhadap project pemilik. Semua uji akun di atas memakai emulator. `.env.local` yang sudah tersedia dipertahankan dan nilainya tidak dicantumkan.
- NVDA/JAWS/VoiceOver, Safari/iOS fisik, keyboard virtual perangkat nyata, dan pemulihan sesi browser spesifik belum diuji. Keyboard, semantics/axe, reduced motion dan pembesaran teks 200% telah diuji di Chromium; ini tidak sama dengan sertifikasi aksesibilitas.
- PDF/PNG diperiksa pada fixture konkret, bukan seluruh kemungkinan nama produk tanpa batas. Tidak ada gambar pada PDF yang perlu dikompres ulang; hard gate ukuran menghentikan unduhan yang melampaui batas.
- Npm audit penuh masih melaporkan **3 moderate** pada tool development Firebase CLI / pubsub / OpenTelemetry 1.x. `npm audit fix --force` mengusulkan downgrade lintas versi; tidak diterapkan karena dapat mengubah toolchain. Dependency runtime bersih setelah override uuid 11.1.1 untuk gaxios 6.7.1; emulator diuji ulang dengan patch tersebut.
- Akun dengan jumlah dokumen sangat besar dapat memerlukan background deletion job sesuai timeout host. Implementasi sekarang retryable dengan lock selama penghapusan dan Auth terakhir. TTL lock operasional perlu diaktifkan pada produksi.
- Review ahli, wawancara kognitif, pilot, validitas, reliabilitas, norma dan bias kelompok **belum dilakukan**. Status ilmiah tetap draft_self_report.
- Aplikasi belum dipublikasikan. Operator perlu menentukan kontak pengelola, kebijakan layanan, region/retensi data dan konfigurasi rekening nyata.
