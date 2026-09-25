# Instrumen eq-id-1.0.0

Status: **draft_self_report**, belum tervalidasi, belum direview ahli. Target: dewasa 18+, konteks keseharian selama empat minggu terakhir. Tidak untuk diagnosis, sertifikasi, rekrutmen, kelayakan kerja, atau keputusan klinis.

## Blueprint

| Dimensi | Definisi | Batas konstruk | Butir | Reverse |
| --- | --- | --- | --- | --- |
| Kesadaran Diri | Nama emosi, pemicu, sinyal tubuh, pengaruh pada perilaku | Bukan sekadar banyak memikirkan diri | awareness-01..10 | 09, 10 |
| Regulasi Diri | Jeda, ekspresi aman, pengelolaan impuls, pemulihan | Bukan penekanan semua emosi | regulation-01..10 | 09, 10 |
| Motivasi Internal | Tindakan bermakna, memulai ulang, usaha berkelanjutan | Bukan produktivitas tanpa batas | motivation-01..10 | 09, 10 |
| Empati | Mendengarkan, perspektif, klarifikasi asumsi | Bukan selalu setuju atau mengabaikan batas | empathy-01..10 | 09, 10 |
| Keterampilan Sosial | Asertivitas, koordinasi, konflik dan perbaikan hubungan | Bukan ekstroversi atau popularitas | social-01..10 | 09, 10 |

50 butir tetap; lima tahap berisi 10 butir (dua per dimensi). `itemOrder` merupakan sumber assignment tahap: indeks 0..9 tahap 1, dst. Seed uint32 dan UUID berasal dari Web Crypto. Fisher-Yates memakai PRNG deterministik setelah seed dibuat; PRNG bukan mekanisme keamanan. Jawaban terikat item ID. Urutan baru tidak menjamin butir tidak diingat.

## Data dan skoring

Sumber kanonik: `lib/assessment/items.ts`. Salinan JSON untuk review: `docs/item-bank.json`. Lembar review lengkap: `docs/ITEM-REVIEW.md`; tidak ada tanda review ahli yang diisi secara rekaan. Regenerasi: `node scripts/instrument-review.mjs`.

Skala 1 Hampir tidak pernah, 2 Jarang, 3 Kadang-kadang, 4 Sering, 5 Hampir selalu. `null` adalah tidak dapat menilai; tidak adanya key berarti belum menjawab. Semua 50 butir perlu direspons (termasuk null) sebelum selesai. Forward x, reverse 6-x. Rata-rata numerik dihitung presisi penuh, indeks `(mean-1)*25`; pembulatan hanya tampilan. Minimum 8 respons per dimensi. Agregat rata-rata lima dimensi hanya bila seluruh dimensi cukup.

Interpretasi `1.0.0` merangkum perilaku subset item yang tertera di `interpretation-rules.ts` bila paling sedikit dua item terkait memiliki respons numerik; dimensi sendiri tetap memerlukan 8/10. Rentang editorial mendekati lima titik skala (batas 1.5, 2.5, 3.5, 4.5). Ini bukan norma, cutoff kemampuan, atau bukti validitas. Dua latihan tetap per dimensi; tiga dimensi dengan indeks relatif terkecil ditawarkan sebagai fokus, tanpa klaim signifikansi selisih.

Hasil cloud menyimpan snapshot dimensi, cakupan, ringkasan dan recommendationId, plus versi skoring/instrumen/interpretasi. Hasil terdahulu dibaca dari snapshot. Untuk versi instrumen baru, tambahkan registry versi sebelum mengizinkan resume draft lama; jangan mengubah bank v1 diam-diam. Guest bersifat sementara dan ditolak pemulihannya jika schema/versi tidak cocok.

## Kerangka dan lisensi

Lima dimensi adalah keputusan konseptual produk pada brief, selaras dengan tema umum literatur kecerdasan emosional. Bukan klaim adopsi resmi atau reproduksi tes tertentu. Semua item baru, tidak disalin dari instrumen berlisensi. Review orisinalitas, lisensi, dan kelayakan penggunaan tetap menjadi bagian review manusia.

Rujukan yang diberikan brief: Tett, Fox & Wang (2005), https://pubmed.ncbi.nlm.nih.gov/15951360/; perbandingan performance-based dan self-report, https://pubmed.ncbi.nlm.nih.gov/16436018/. Akses PubMed saat implementasi terhalang pemeriksaan browser; tidak mengklaim membaca teks lengkap. Referensi tersebut bukan bukti validitas bank baru. Asal teori lima dimensi perlu dipertegas ahli sebelum publikasi ilmiah.

Angka 50 butir, dua reverse per dimensi, cakupan 80%, dan bobot sama adalah keputusan awal untuk dievaluasi. Reliabilitas saja bukan validitas.
