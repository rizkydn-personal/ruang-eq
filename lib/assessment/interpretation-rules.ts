import type { DimensionId } from "./items";
export const rules: Record<
  DimensionId,
  {
    id: string;
    itemIds: string[];
    behavior: string;
    exercises: [string, string];
  }
> = {
  awareness: {
    id: "awareness-notice",
    itemIds: ["awareness-01", "awareness-02", "awareness-03"],
    behavior: "mengenali dan memberi nama pada emosi",
    exercises: [
      "Sekali sehari, tulis satu emosi, pemicunya, dan sensasi tubuh yang menyertainya. Cukup tiga menit.",
      "Sebelum merespons situasi sulit, lengkapi kalimat: Saya merasa ... karena saya membutuhkan ... .",
    ],
  },
  regulation: {
    id: "regulation-pause",
    itemIds: ["regulation-01", "regulation-02", "regulation-09"],
    behavior: "memberi jeda sebelum bereaksi",
    exercises: [
      "Saat kesal, letakkan ponsel selama satu menit. Ambil tiga napas pelan sebelum memutuskan apakah akan membalas.",
      "Pilih satu cara pulih yang realistis, seperti berjalan lima menit. Coba setelah satu kejadian yang menegangkan.",
    ],
  },
  motivation: {
    id: "motivation-restart",
    itemIds: ["motivation-01", "motivation-02", "motivation-05"],
    behavior: "memulai kembali langkah menuju tujuan",
    exercises: [
      "Pilih satu tujuan yang bermakna. Tuliskan langkah yang bisa dilakukan dalam lima menit, lalu tentukan waktunya.",
      "Setelah tertunda, catat satu hambatan dan kecilkan langkah berikutnya agar sesuai tenaga Anda.",
    ],
  },
  empathy: {
    id: "empathy-check",
    itemIds: ["empathy-01", "empathy-02", "empathy-04"],
    behavior: "mendengarkan dan memeriksa pemahaman",
    exercises: [
      "Dalam satu percakapan, rangkum yang Anda dengar lalu tanyakan: Apakah saya memahaminya dengan tepat?",
      "Sebelum memberi saran, tanyakan: Kamu ingin didengarkan atau ingin mencari langkah bersama?",
    ],
  },
  social: {
    id: "social-express",
    itemIds: ["social-01", "social-02", "social-03"],
    behavior: "menyampaikan kebutuhan dengan jelas",
    exercises: [
      "Latih satu kalimat: Ketika ... terjadi, saya merasa ... dan saya membutuhkan ... . Pilih situasi ringan terlebih dahulu.",
      "Sampaikan satu batas yang realistis dengan tenang. Tawarkan alternatif hanya jika Anda memang mampu.",
    ],
  },
};
export function tendency(mean: number | null, behavior: string) {
  if (mean === null)
    return "Respons terkait perilaku ini belum cukup untuk dirangkum.";
  const frequency =
    mean < 1.5
      ? "hampir tidak pernah"
      : mean < 2.5
        ? "jarang"
        : mean < 3.5
          ? "kadang-kadang"
          : mean < 4.5
            ? "sering"
            : "hampir selalu";
  return `Dalam jawaban Anda, kebiasaan ${behavior} tergambar ${frequency}. Gunakan pengalaman nyata untuk memeriksa apakah gambaran ini sesuai.`;
}
export const sevenDays = [
  "Pilih satu latihan dan tulis situasi yang ingin Anda perhatikan.",
  "Amati satu kejadian tanpa mencoba mengubah semuanya.",
  "Coba latihan pilihan Anda selama tiga sampai lima menit.",
  "Ulangi pada situasi ringan. Catat apa yang terasa membantu.",
  "Perhatikan hambatan. Sesuaikan langkah dengan energi Anda.",
  "Coba kembali; bila relevan, minta masukan orang yang Anda percaya.",
  "Baca catatan Anda. Pilih satu kebiasaan kecil untuk minggu berikutnya.",
];
