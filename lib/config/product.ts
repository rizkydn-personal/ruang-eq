export const product = {
  name: process.env.NEXT_PUBLIC_PRODUCT_NAME || "Ruang EQ",
};
export const disclaimer =
  "Hasil ini menggambarkan jawaban Anda saat ini untuk refleksi diri, bukan diagnosis atau ukuran EQ terstandar.";
export const versions = {
  instrumentVersion: "eq-id-1.0.0",
  scoringVersion: "1.0.0",
  interpretationVersion: "1.0.0",
} as const;
