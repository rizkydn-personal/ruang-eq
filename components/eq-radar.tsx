"use client";
import { useId } from "react";
import type { Result } from "@/lib/assessment/engine";

export function EqRadar({ dimensions }: Pick<Result, "dimensions">) {
  const id = useId();
  const point = (axis: number, radius: number) => {
    const angle = -Math.PI / 2 + (axis * 2 * Math.PI) / 5;
    return [180 + Math.cos(angle) * radius, 160 + Math.sin(angle) * radius];
  };
  const ring = (radius: number) =>
    dimensions.map((_, i) => point(i, radius).join(",")).join(" ");
  const complete = dimensions.every((d) => d.index !== null);
  return (
    <figure className="eq-radar">
      <svg
        viewBox="0 0 360 320"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>Grafik radar lima aspek EQ</title>
        <desc id={`${id}-desc`}>
          {dimensions
            .map(
              (d) =>
                `${d.name}: ${d.index === null ? "belum cukup data" : `${Math.round(d.index)} dari 100`}`,
            )
            .join(". ")}
          . Pusat bernilai 0; garis terluar bernilai 100.
        </desc>
        {[20, 40, 60, 80, 100].map((n) => (
          <polygon key={n} points={ring(n * 1.12)} className="radar-grid" />
        ))}
        {dimensions.map((d, i) => {
          const [x, y] = point(i, 112);
          const [lx, ly] = point(i, 140);
          return (
            <g key={d.id}>
              <line x1="180" y1="160" x2={x} y2={y} className="radar-grid" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="radar-label"
              >
                {i + 1}
              </text>
            </g>
          );
        })}
        {complete && (
          <polygon
            className="radar-area"
            points={dimensions
              .map((d, i) => point(i, d.index! * 1.12).join(","))
              .join(" ")}
          />
        )}
        {[0, 20, 40, 60, 80, 100].map((n) => (
          <text key={n} x="186" y={160 - n * 1.12 + 4} className="radar-scale">
            {n}
          </text>
        ))}
        {dimensions.map((d, i) => {
          if (d.index === null) return null;
          const [cx, cy] = point(i, d.index * 1.12);
          return (
            <circle key={d.id} cx={cx} cy={cy} r="4" className="radar-point" />
          );
        })}
      </svg>
      <figcaption className="small muted">
        Nomor sumbu mengikuti aspek di bawah.{" "}
        {complete
          ? "Semakin jauh dari pusat, semakin tinggi indeks jawaban."
          : "Hasil parsial: hanya aspek dengan data cukup yang ditampilkan sebagai titik; data kosong bukan skor nol."}
      </figcaption>
    </figure>
  );
}
