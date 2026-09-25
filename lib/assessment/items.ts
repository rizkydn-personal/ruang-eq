export const dimensions = [
  {
    id: "awareness",
    name: "Kesadaran Diri",
    description: "Mengenali emosi, pemicu, dan pengaruhnya pada tindakan.",
    situation:
      "Saat respons Anda terasa lebih kuat daripada yang Anda harapkan.",
  },
  {
    id: "regulation",
    name: "Regulasi Diri",
    description: "Memberi jeda, mengelola impuls, dan pulih dari tekanan.",
    situation: "Saat menerima pesan yang membuat Anda kesal.",
  },
  {
    id: "motivation",
    name: "Motivasi Internal",
    description:
      "Kembali pada tujuan yang bermakna, termasuk ketika kemajuan terasa lambat.",
    situation: "Saat rencana yang penting bagi Anda tidak berjalan.",
  },
  {
    id: "empathy",
    name: "Empati",
    description:
      "Mendengarkan dan memeriksa pemahaman tentang pengalaman orang lain.",
    situation:
      "Saat orang terdekat bercerita tentang pengalaman yang berbeda dari pengalaman Anda.",
  },
  {
    id: "social",
    name: "Keterampilan Sosial",
    description:
      "Menyampaikan kebutuhan dan merawat hubungan saat ada perbedaan.",
    situation: "Saat Anda perlu membicarakan perbedaan pendapat.",
  },
] as const;
export type DimensionId = (typeof dimensions)[number]["id"];
export type Item = {
  id: string;
  dimension: DimensionId;
  text: string;
  reverse: boolean;
  rationale: string;
  reviewStatus: "draft_self_report";
};
const content: Record<DimensionId, [string, string][]> = {
  awareness: [
    [
      "Saya memberi nama pada perasaan yang sedang saya alami.",
      "Pelabelan emosi",
    ],
    [
      "Saya mengenali kejadian yang memicu perubahan suasana hati saya.",
      "Identifikasi pemicu",
    ],
    [
      "Saya memperhatikan tanda tubuh ketika saya mulai tegang.",
      "Kesadaran sinyal tubuh",
    ],
    [
      "Saya menyadari pengaruh perasaan saya terhadap cara berbicara.",
      "Kaitan emosi dan perilaku",
    ],
    [
      "Saya membedakan rasa kecewa dari rasa marah dalam diri saya.",
      "Diferensiasi emosi",
    ],
    [
      "Sebelum mengambil keputusan, saya memperhatikan perasaan yang sedang memengaruhi saya.",
      "Kesadaran emosi dalam keputusan",
    ],
    [
      "Setelah bereaksi kuat, saya menelusuri perasaan yang mendasarinya.",
      "Refleksi respons emosional",
    ],
    [
      "Saya mengenali kebutuhan pribadi di balik perasaan tidak nyaman.",
      "Kaitan kebutuhan dan emosi",
    ],
    [
      "Saya baru menyadari bahwa saya kesal setelah melampiaskannya kepada orang lain.",
      "Keterlambatan mengenali emosi",
    ],
    [
      "Ketika suasana hati berubah, saya kesulitan menjelaskan perasaan saya.",
      "Kesulitan pelabelan emosi",
    ],
  ],
  regulation: [
    [
      "Ketika kesal, saya memberi jeda sebelum membalas pesan.",
      "Jeda sebelum tindakan impulsif",
    ],
    [
      "Saat tegang, saya memakai cara sederhana untuk menenangkan tubuh.",
      "Strategi regulasi fisiologis",
    ],
    [
      "Saya menunda pembicaraan yang memanas sampai saya siap membahasnya.",
      "Pengaturan waktu respons",
    ],
    [
      "Setelah mengalami tekanan, saya meluangkan waktu untuk memulihkan diri.",
      "Pemulihan setelah stres",
    ],
    [
      "Ketika muncul dorongan untuk membentak, saya menurunkan nada suara.",
      "Modulasi ekspresi emosi",
    ],
    [
      "Saat pikiran mengganggu berulang, saya mengarahkan perhatian pada kegiatan yang sedang dilakukan.",
      "Pengalihan perhatian terarah",
    ],
    [
      "Saya mengungkapkan rasa sedih dengan cara yang tidak menyakiti diri sendiri.",
      "Ekspresi emosi aman",
    ],
    [
      "Ketika rencana berubah mendadak, saya menenangkan diri sebelum menentukan tindakan.",
      "Fleksibilitas respons",
    ],
    [
      "Saat kesal, saya langsung bereaksi sebelum memikirkan akibatnya.",
      "Reaktivitas impulsif",
    ],
    [
      "Saya membawa kekesalan dari satu kejadian ke percakapan berikutnya.",
      "Kesulitan pemulihan emosi",
    ],
  ],
  motivation: [
    [
      "Saya mengerjakan langkah kecil menuju tujuan yang penting bagi saya.",
      "Tindakan menuju tujuan bermakna",
    ],
    [
      "Setelah rencana gagal, saya mencoba kembali dengan langkah yang bisa dilakukan.",
      "Memulai kembali setelah hambatan",
    ],
    [
      "Saya mengingat alasan pribadi untuk meneruskan kegiatan yang sulit.",
      "Orientasi makna internal",
    ],
    [
      "Saya tetap menjalankan kegiatan yang bermakna meskipun tidak mendapat pujian.",
      "Persistensi tanpa penguatan eksternal",
    ],
    [
      "Ketika tugas terasa besar, saya membaginya menjadi langkah yang lebih kecil.",
      "Pengelolaan usaha",
    ],
    [
      "Saya menyesuaikan target dengan tenaga yang tersedia.",
      "Persistensi berkelanjutan",
    ],
    [
      "Setelah tertunda, saya menentukan waktu untuk memulai lagi.",
      "Pemulihan komitmen",
    ],
    [
      "Saya mengakui kemajuan kecil dalam hal yang sedang saya pelajari.",
      "Penguatan intrinsik",
    ],
    [
      "Saya meninggalkan tujuan yang masih penting bagi saya setelah menemui hambatan kecil.",
      "Melepas tujuan akibat hambatan",
    ],
    [
      "Saya menunggu dorongan orang lain untuk memulai kegiatan yang sebenarnya ingin saya lakukan.",
      "Ketergantungan dorongan eksternal",
    ],
  ],
  empathy: [
    [
      "Saya mendengarkan cerita orang lain sampai selesai sebelum menanggapi.",
      "Mendengarkan pengalaman",
    ],
    [
      "Saya memeriksa apakah tebakan saya tentang perasaan orang lain sudah sesuai.",
      "Verifikasi pemahaman",
    ],
    [
      "Saat berbeda pandangan, saya mencoba memahami alasan orang lain.",
      "Pengambilan perspektif",
    ],
    [
      "Saya menanyakan dukungan yang dibutuhkan sebelum memberikan saran.",
      "Respons pada kebutuhan orang lain",
    ],
    [
      "Saya memperhatikan perubahan nada suara orang yang berbicara dengan saya.",
      "Perhatian pada petunjuk emosional",
    ],
    [
      "Saya mempertimbangkan situasi seseorang sebelum menilai tindakannya.",
      "Kontekstualisasi perilaku",
    ],
    [
      "Saya mengakui perasaan orang lain meskipun tidak setuju dengan pilihannya.",
      "Validasi tanpa persetujuan",
    ],
    [
      "Jika cerita seseorang belum jelas, saya mengajukan pertanyaan untuk memahaminya.",
      "Klarifikasi pengalaman",
    ],
    [
      "Saya menganggap orang lain merasakan hal yang sama dengan saya tanpa memeriksanya.",
      "Asumsi perspektif",
    ],
    [
      "Saat orang bercerita tentang kesulitan, saya mengalihkan pembicaraan ke pengalaman saya sendiri.",
      "Pengalihan fokus mendengarkan",
    ],
  ],
  social: [
    [
      "Saya menyampaikan kebutuhan saya dengan kata-kata yang jelas.",
      "Komunikasi kebutuhan",
    ],
    [
      "Saat berbeda pendapat, saya membahas masalah tanpa merendahkan orangnya.",
      "Konflik konstruktif",
    ],
    [
      "Saya menyampaikan batas ketika permintaan orang lain melebihi kemampuan saya.",
      "Asertivitas batas",
    ],
    [
      "Ketika ucapan saya menyakiti seseorang, saya mengakui bagian yang menjadi tanggung jawab saya.",
      "Perbaikan hubungan",
    ],
    [
      "Saya memastikan pembagian tugas dipahami bersama ketika bekerja dengan orang lain.",
      "Koordinasi komunikasi",
    ],
    [
      "Saya meminta penjelasan ketika pesan seseorang terasa membingungkan.",
      "Klarifikasi komunikasi",
    ],
    [
      "Saat ada ketegangan, saya mengajak mencari langkah yang bisa disepakati.",
      "Negosiasi konflik",
    ],
    [
      "Saya menyampaikan apresiasi atas tindakan spesifik orang lain.",
      "Pemeliharaan hubungan",
    ],
    [
      "Saya menyimpan keberatan sampai akhirnya muncul sebagai sindiran.",
      "Komunikasi kebutuhan tidak langsung",
    ],
    [
      "Saat berselisih, saya memotong pembicaraan sebelum orang lain selesai menjelaskan.",
      "Hambatan dialog",
    ],
  ],
};
export const items: Item[] = dimensions.flatMap((d) =>
  content[d.id].map(([text, rationale], i) => ({
    id: `${d.id}-${String(i + 1).padStart(2, "0")}`,
    dimension: d.id,
    text,
    reverse: i >= 8,
    rationale,
    reviewStatus: "draft_self_report",
  })),
);
export const itemById = Object.fromEntries(
  items.map((item) => [item.id, item]),
);
export const responseLabels = [
  "Hampir tidak pernah",
  "Jarang",
  "Kadang-kadang",
  "Sering",
  "Hampir selalu",
];
