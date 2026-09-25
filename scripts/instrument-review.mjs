import { mkdir, writeFile } from "node:fs/promises";
import { items, dimensions } from "../lib/assessment/items.ts";
await mkdir("docs", { recursive: true });
await writeFile(
  "docs/item-bank.json",
  JSON.stringify(
    {
      version: "eq-id-1.0.0",
      status: "draft_self_report",
      referencePeriod: "empat minggu terakhir",
      items,
    },
    null,
    2,
  ) + "\n",
);
const header =
  "# Review manusia: bank soal v1\n\nStatus seluruh butir: draft_self_report; belum ditinjau psikolog/ahli psikometri. Semua item ditulis khusus untuk produk ini, bukan salinan skala berlisensi. Acuan jawaban: empat minggu terakhir.\n\nReviewer: belum ditetapkan. Tanggal review: belum dilakukan. Keputusan rilis ilmiah: belum tersedia.\n\nNilai tiap butir untuk relevansi, kejelasan satu gagasan, sensitivitas konteks, kebutuhan pengalaman, dan kemungkinan bias. Catat usulan perubahan dan alasan. Perubahan harus menaikkan versi dan mengulang pemeriksaan blueprint.\n\n| ID | Dimensi | Pernyataan | Arah | Alasan pemetaan | Review | Catatan ahli |\n| --- | --- | --- | --- | --- | --- | --- |\n";
await writeFile(
  "docs/ITEM-REVIEW.md",
  header +
    items
      .map(
        (i) =>
          `| ${i.id} | ${dimensions.find((d) => d.id === i.dimension).name} | ${i.text} | ${i.reverse ? "reverse" : "forward"} | ${i.rationale} | Belum direview | |`,
      )
      .join("\n") +
    "\n",
);
console.log("50 items exported to docs/item-bank.json and docs/ITEM-REVIEW.md");
