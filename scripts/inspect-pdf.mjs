import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createCanvas, DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";
globalThis.DOMMatrix = DOMMatrix;
globalThis.ImageData = ImageData;
globalThis.Path2D = Path2D;
const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
const path = process.argv[2] || "test-results/artifacts/report.pdf";
const data = await readFile(path);
if (data.length > 5_000_000) throw new Error("PDF exceeds hard limit");
const pdf = await getDocument({
  data: new Uint8Array(data),
  useSystemFonts: false,
  disableFontFace: true,
  standardFontDataUrl: `${process.cwd().replaceAll("\\", "/")}/node_modules/pdfjs-dist/standard_fonts/`,
}).promise;
await mkdir("test-results/pdf-pages", { recursive: true });
let allText = "";
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = createCanvas(viewport.width, viewport.height);
  await page.render({
    canvasContext: canvas.getContext("2d"),
    viewport,
    canvas,
  }).promise;
  await writeFile(
    `test-results/pdf-pages/page-${i}.png`,
    canvas.toBuffer("image/png"),
  );
  const content = await page.getTextContent();
  allText += content.items.map((x) => x.str || "").join(" ") + "\n";
  for (const item of content.items) {
    if (
      item.str?.trim() &&
      item.transform[5] < 35 &&
      !item.str.includes("Refleksi diri") &&
      !/^\d \/ \d$/.test(item.str)
    )
      throw new Error(`Text too near footer on page ${i}: ${item.str}`);
  }
}
for (const text of [
  "Kesadaran Diri",
  "Regulasi Diri",
  "Motivasi Internal",
  "Empati",
  "Keterampilan Sosial",
  "bukan diagnosis",
  "Hari 7",
])
  if (!allText.includes(text)) throw new Error(`Missing PDF content: ${text}`);
await writeFile("test-results/pdf-pages/extracted.txt", allText);
console.log(
  JSON.stringify({
    pages: pdf.numPages,
    bytes: data.length,
    selectableText: true,
    requiredContent: true,
  }),
);
