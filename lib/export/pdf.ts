import { jsPDF } from "jspdf";
import type { Report } from "./report";
export function buildPdf(report: Report): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const left = 20,
    width = 170;
  const clean = (s: string) =>
    s.replace(/[–—]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  let y = 24;
  function text(s: string, size = 10, color = "#183345") {
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(clean(s), width);
    doc.text(lines, left, y);
    y += lines.length * size * 0.45 + 4;
  }
  function heading(s: string) {
    doc.setFont("helvetica", "bold");
    text(s, 15, "#035AA6");
    doc.setFont("helvetica", "normal");
  }
  function page() {
    doc.addPage();
    y = 24;
  }
  heading(report.title);
  text(`${report.date} | ${report.version} | draft_self_report`, 9);
  text(report.disclaimer, 10);
  y += 5;
  heading("Lima dimensi jawaban Anda");
  for (const d of report.dimensions) {
    text(
      `${d.name}: ${d.index === null ? "Jawaban belum cukup" : Math.round(d.index) + " / 100"}`,
      11,
    );
    doc.setFillColor("#E3EDF3");
    doc.rect(left, y, 170, 3, "F");
    if (d.index !== null) {
      doc.setFillColor("#035AA6");
      doc.rect(left, y, (170 * d.index) / 100, 3, "F");
    }
    y += 10;
    text(`${d.count}/10 respons numerik`, 8, "#526573");
  }
  if (report.summary !== null)
    text(
      `Ringkasan indeks refleksi: ${Math.round(report.summary)} / 100 (rata-rata lima dimensi)`,
      10,
    );
  text(
    "Indeks jawaban 0-100, bukan persentil atau persentase kecerdasan. Minimal 8 dari 10 respons numerik per dimensi. Missing tidak masuk perhitungan.",
    9,
  );
  text(
    "Tidak untuk rekrutmen, kelayakan kerja, atau keputusan klinis. Instrumen belum tervalidasi.",
    9,
  );
  const detail = (d: Report["dimensions"][number]) => {
    heading(d.name);
    text(
      `${d.index === null ? "Jawaban belum cukup" : Math.round(d.index) + " / 100"} | Cakupan ${d.count}/10`,
      10,
    );
    text(d.description);
    text(d.interpretation);
    text(`Situasi: ${d.situation}`);
    for (const [i, e] of d.exercises.entries()) text(`${i + 1}. ${e}`, 10);
    y += 6;
  };
  page();
  detail(report.dimensions[0]);
  detail(report.dimensions[1]);
  page();
  detail(report.dimensions[2]);
  detail(report.dimensions[3]);
  page();
  detail(report.dimensions[4]);
  if (report.focus.length)
    text(
      `Area yang dapat dipilih untuk latihan: ${report.dimensions
        .filter((d) => report.focus.includes(d.id))
        .map((d) => d.name)
        .join(", ")}.`,
      9,
    );
  heading("Rencana latihan 7 hari");
  report.plan.forEach((s, i) => text(`Hari ${i + 1}: ${s}`, 9));
  text(
    "Pilih latihan dari area dengan data cukup. Selisih kecil bukan perbedaan yang terbukti bermakna. Latihan tidak menjamin peningkatan skor. Rentang frekuensi adalah aturan editorial berdasarkan skala jawaban, bukan norma populasi.",
    8,
  );
  for (let p = 1; p <= doc.getNumberOfPages(); p++) {
    doc.setPage(p);
    doc.setDrawColor("#D1DCE2");
    doc.line(20, 281, 190, 281);
    doc.setFontSize(8);
    doc.setTextColor("#526573");
    doc.text("Refleksi diri | Bukan diagnosis", 20, 287);
    doc.text(`${p} / ${doc.getNumberOfPages()}`, 190, 287, { align: "right" });
  }
  const blob = doc.output("blob");
  if (blob.size > 5_000_000)
    throw new Error("PDF melebihi batas 5 MB. Coba lagi atau unduh PNG.");
  return blob;
}
