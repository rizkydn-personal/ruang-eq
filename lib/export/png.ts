import type { Report } from "./report";
export async function buildPng(report: Report): Promise<Blob> {
  await document.fonts.ready;
  const width = 1440,
    padding = 92,
    content = width - padding * 2;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = 4096;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser tidak mendukung ekspor PNG. Coba PDF.");
  const commands: ((ctx: CanvasRenderingContext2D) => void)[] = [];
  let y = 88;
  function text(s: string, size = 25, color = "#183345", bold = false) {
    const font = `${bold ? 600 : 400} ${size}px "Plus Jakarta Sans", sans-serif`;
    ctx!.font = font;
    const words = s.split(/\s+/);
    let line = "";
    const lines: string[] = [];
    for (const word of words) {
      if (ctx!.measureText(line + " " + word).width > content && line) {
        lines.push(line);
        line = word;
      } else line += (line ? " " : "") + word;
    }
    if (line) lines.push(line);
    const top = y;
    commands.push((c) => {
      c.font = font;
      c.fillStyle = color;
      lines.forEach((line, i) =>
        c.fillText(line, padding, top + i * size * 1.55),
      );
    });
    y += lines.length * size * 1.55 + 20;
  }
  text(report.title, 42, "#035AA6", true);
  text(`${report.date} · ${report.version} · draft_self_report`, 21, "#526573");
  text(report.disclaimer, 24);
  y += 16;
  for (const d of report.dimensions) {
    text(
      `${d.name}   ${d.index === null ? "Jawaban belum cukup" : Math.round(d.index) + " / 100"}`,
      29,
      "#035AA6",
      true,
    );
    const barY = y;
    commands.push((c) => {
      c.fillStyle = "#E3EDF3";
      c.fillRect(padding, barY, content, 12);
      if (d.index !== null) {
        c.fillStyle = "#035AA6";
        c.fillRect(padding, barY, (content * d.index) / 100, 12);
      }
    });
    y += 45;
    text(
      `Cakupan: ${d.count}/10 respons numerik. ${d.description}`,
      22,
      "#526573",
    );
    text(d.interpretation, 24);
    text(`Situasi: ${d.situation}`, 22);
    d.exercises.forEach((e, i) => text(`${i + 1}. ${e}`, 22));
    y += 25;
  }
  if (report.summary !== null)
    text(
      `Ringkasan indeks refleksi: ${Math.round(report.summary)} / 100`,
      26,
      "#035AA6",
      true,
    );
  if (report.focus.length)
    text(
      `Area yang dapat dipilih untuk latihan: ${report.dimensions
        .filter((d) => report.focus.includes(d.id))
        .map((d) => d.name)
        .join(", ")}.`,
      22,
    );
  text("Rencana latihan 7 hari", 32, "#035AA6", true);
  report.plan.forEach((s, i) => text(`Hari ${i + 1}. ${s}`, 22));
  text(
    "Indeks 0–100 merangkum jawaban, bukan persentil atau ukuran EQ terstandar. Minimal 8/10 jawaban numerik per dimensi. Missing dikecualikan. Rentang frekuensi bersifat editorial. Selisih kecil bukan perbedaan signifikan. Latihan tidak menjamin peningkatan skor. Tidak untuk rekrutmen atau keputusan klinis.",
    21,
    "#526573",
  );
  const height = y + 60;
  const scale = Math.min(1, 4096 / height);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.ceil(height * scale);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  commands.forEach((draw) => draw(ctx));
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) =>
        b ? resolve(b) : reject(new Error("PNG gagal dibuat. Coba PDF.")),
      "image/png",
    ),
  );
}
