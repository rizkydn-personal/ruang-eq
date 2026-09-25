# Ruang EQ

Aplikasi Next.js berbahasa Indonesia untuk refleksi kecerdasan emosional. Satu asesmen, 50 butir, lima tahap, lima dimensi, guest sementara atau akun Google, laporan PNG/PDF dan riwayat privat. **Status instrumen: draft_self_report, belum tervalidasi.** Aplikasi bukan alat diagnosis atau tes EQ terstandar.

## Jalankan lokal

Node yang diuji: **24.18.1**, npm **11.16.0**. Dependency inti yang diverifikasi dari registry pada 25 September 2026: Next **16.3.6**, React/React DOM **19.3.0**, Firebase **12.19.0**, Firebase Admin **14.5.0**. Seluruh versi tepat dikunci package-lock.json. TypeScript strict, App Router, CSS custom, Zod, Lucide. Java 21 untuk emulator Firestore.

```powershell
cd D:\brutalx\Nodejs\myEQ
npm ci
npm run dev
```

Buka http://127.0.0.1:3000. Guest dapat berjalan tanpa Firebase. Jika membuat konfigurasi baru, salin `.env.example` ke `.env.local`; jangan menimpa konfigurasi yang sudah ada. `.env.local` tidak masuk version control. Nama/variabel `NEXT_PUBLIC_*` di-inline saat build: restart dev atau rebuild setelah mengubahnya.

## Firebase produksi

1. Buat Firebase project dan Firestore, tentukan region sesuai kebutuhan operator. Aktifkan Google provider di Authentication.
2. Isi `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` dari konfigurasi web Firebase. Public config bukan Admin credential.
3. Isi `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` melalui secret manager host atau `.env.local`. Private key mendukung literal `\n`. Jangan pernah memberi prefix NEXT_PUBLIC pada Admin credential.
4. Set `APP_ORIGIN` persis origin yang digunakan browser, termasuk port, tanpa slash akhir. Misalnya `http://127.0.0.1:3000`, bukan `http://localhost:3000` jika browser membuka 127.0.0.1.
5. Tambahkan domain aplikasi serta localhost/127.0.0.1 bila dibutuhkan ke Firebase Authentication authorized domains. Jangan menganggap localhost otomatis diizinkan untuk project baru.
6. Popup dibatalkan/terblokir ditampilkan sebagai error. Tombol fallback redirect menggunakan `signInWithRedirect`. Untuk browser yang membatasi third-party storage, konfigurasikan authDomain same-site/Firebase Hosting atau proxy `/__/auth/` sesuai [dokumentasi redirect Firebase](https://firebase.google.com/docs/auth/web/redirect-best-practices). Origin, OAuth redirect URI, dan authorized domain harus cocok. Uji pada deployment sesungguhnya sebelum rilis.
7. Deploy aturan dan indeks dengan identitas operator yang memiliki akses:

```powershell
npx firebase deploy --only firestore:rules,firestore:indexes --project PROJECT_ID_ANDA
```

Tidak ada deployment yang dilakukan oleh implementasi ini. Firestore TTL `rateLimits.expiresAt` di konfigurasi membersihkan penghitung kedaluwarsa; aktifkan/cek kebijakan TTL sesuai dukungan project. Ini bukan TTL data asesmen.

## Emulator tanpa credential produksi

Untuk menjalankan manual, gunakan nilai berikut di env lokal sementara (simpan konfigurasi asli terlebih dahulu). Admin email/key tidak diperlukan dalam emulator.

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=demo-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-ruang-eq
NEXT_PUBLIC_FIREBASE_APP_ID=demo-app
NEXT_PUBLIC_USE_EMULATORS=true
FIREBASE_PROJECT_ID=demo-ruang-eq
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
APP_ORIGIN=http://127.0.0.1:3000
```

Terminal 1: `npm run emulators`. Terminal 2: `npm run dev`. UI emulator: http://127.0.0.1:4000. Google popup emulator menampilkan akun simulasi lokal secara eksplisit; tidak menyatakan login Google produksi berhasil. Jangan gunakan flag/host emulator pada deployment produksi.

Pengujian Playwright mengoverride public config melalui environment proses agar tidak menggunakan `.env.local` produksi. Mode default menguji guest. Mode akun memakai port 3001 dan project demo:

```powershell
npm run test:security
# Untuk E2E akun, jalankan emulator di terminal terpisah terlebih dahulu:
$env:EQ_E2E_EMULATOR='1'
npm run test:e2e
Remove-Item Env:EQ_E2E_EMULATOR
```

Jangan menjalankan dua Next dev pada direktori `.next` yang sama bersamaan. Tutup dev manual sebelum Playwright karena server tes sengaja tidak memakai ulang server yang konfigurasinya belum diketahui.

## Alur data dan keamanan

- Guest: state React dan satu key `sessionStorage` (`ruang-eq-session-v1`), tidak ada cloud write atau anonymous Auth. Refresh mempertahankan urutan/jawaban; posisi soal dapat kembali ke awal. Hapus sesi membersihkan state dan key aplikasi. Tidak menghapus berkas yang sudah diunduh.
- Google: Firebase Auth menggunakan browser session persistence. Guest lama tidak dimigrasikan. Draft di-debounce 750ms, write diserialkan. Status menyimpan/tersimpan/gagal mengikuti hasil endpoint. Kegagalan mempertahankan respons lokal dan menyediakan retry. Konflik revisi mengharuskan membuka draft terbaru dari Riwayat; tidak menimpa diam-diam.
- API read/write selalu memakai UID hasil verifikasi ID token, tidak menerima UID pemilik dari body. Client Firestore write ditolak. Endpoint menolak origin berbeda, payload lebih dari 24 KB, ID/schema/versi invalid, serta lebih dari 100 mutasi/menit/UID menggunakan penghitung transaksi Firestore. Token bearer tidak dikirim otomatis oleh browser; Origin check menjadi lapisan tambahan CSRF.
- Server menghitung ulang hasil dari respons, menyimpan snapshot dan versi. Finalisasi transaction/idempotent. Final yang berbeda tidak bisa menimpa hasil selesai. Urutan tahap diturunkan langsung dari itemOrder per 10 item, diverifikasi terhadap seed.
- Riwayat 10 dokumen per halaman, cursor dokumen milik pengguna. Semua endpoint sensitif `private, no-store`; halaman privat noindex. Tidak ada analytics, payload logging, public result link atau HTML mentah.
- Penghapusan akun memasang lock operasional ber-ID hash, menghapus seluruh subkoleksi, profil dan rate counter, lalu menghapus Auth terakhir. Jika Auth gagal, identitas masih tersedia untuk login ulang dan retry; lock mencegah write baru selama proses. Setelah sukses, token lama ditolak. Lock dibersihkan segera; kegagalan cleanup lock ditangani TTL 24 jam, tanpa menyimpan respons, email, atau nama. Untuk akun sangat besar, gunakan job server agar tidak melewati timeout host.
- Endpoint Admin memiliki owner check sendiri karena Admin melewati Security Rules. Tidak ada persistent Firestore cache client. Pembacaan aplikasi melalui endpoint, sementara SDK rules diverifikasi tersendiri dalam tes emulator.

## Penyesuaian produk

Nama: `NEXT_PUBLIC_PRODUCT_NAME`. Palet, typography, spacing, radius, motion dan shadow: `app/globals.css` bagian `:root`. Arah visual: `DESIGN.md`.

Popup kopi memakai `DONATION_BANK_NAME`, `DONATION_ACCOUNT_NUMBER`, `DONATION_ACCOUNT_HOLDER`. Nomor rekening selalu string; nol awal dipertahankan. Kompatibilitas konfigurasi lokal juga tersedia untuk `NEXT_PUBLIC_DONATION_BANK`, `NEXT_PUBLIC_DONATION_ACCOUNT`, `NEXT_PUBLIC_DONATION_NAME`. Ketiganya harus tersedia untuk menampilkan rekening; jika kosong tampil state “Informasi rekening belum tersedia”. Tidak ada rekening rekaan dalam source.

Bank item kanonik ada di `lib/assessment/items.ts`. ID dan versi jangan berubah setelah rilis tanpa menaikkan versi. Regenerasi JSON/review: `node scripts/instrument-review.mjs`. Dokumen ilmiah: `docs/INSTRUMENT.md`, `docs/ITEM-REVIEW.md`, `docs/VALIDATION-PLAN.md`.

PDF memakai jsPDF, 4 halaman A4, teks/vector, hard gate Blob.size <= 5.000.000 byte. Tanpa gambar dekoratif sehingga tidak perlu downsampling PDF. Jika ukuran melewati batas, tidak diunduh dan pengguna mendapat error/retry atau PNG. PNG menggunakan canvas khusus, lebar ideal 1440; bila konten sangat panjang, skala diperkecil agar tinggi <=4096, seluruh isi tetap disertakan. Ekspor dinamis dimuat saat dibutuhkan.

## Verifikasi dan deploy

`npm run build` menjalankan `verify:firebase-runtime` sebelum build Next. Pemeriksaan ini memuat Firebase Admin dan memverifikasi kunci/tanda tangan JWKS dengan `require(ESM)` dinonaktifkan, tanpa jaringan atau kredensial. Override `jwks-rsa@4.1.0 > jose@5.10.0` menjaga kompatibilitas CommonJS di runtime serverless; versi jose milik paket lain tidak diubah. Ini mengatasi [bug upstream #507](https://github.com/auth0/node-jwks-rsa/issues/507). Hapus override hanya setelah perbaikan upstream lulus pemeriksaan runtime ini.

```powershell
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run test:security
npm run build
npm start
```

`node scripts/inspect-pdf.mjs` memeriksa fixture PDF yang dibuat E2E, mengekstrak teks dan merender empat halaman via PDF.js untuk inspeksi visual. Bukti sementara ada di test-results; Playwright membersihkan folder itu saat run baru. Hasil aktual dan batas pengujian dicatat di `docs/QA.md`.

Deploy ke host Node yang mendukung Next Route Handlers (bukan static export). Masukkan secret di host, cocokkan APP_ORIGIN dan Google authDomain, deploy rules/indexes, build ulang, lalu lakukan smoke test akun milik operator. Aktifkan HTTPS. Operator perlu menetapkan kontak pengelola, region/retensi data dan kebijakan layanan sebelum peluncuran publik. Instrumen tetap draft sampai review manusia dan bukti validasi nyata tersedia.

Dokumentasi resmi yang diperiksa: [Next installation](https://nextjs.org/docs/app/getting-started/installation), dokumentasi route lokal dalam paket Next, [Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin), [transactions](https://firebase.google.com/docs/firestore/manage-data/transactions), [Auth Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth). Audit desain merujuk commit anti-slop yang dicatat di DESIGN.md.
