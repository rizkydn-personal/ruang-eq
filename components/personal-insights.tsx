"use client";
import { useState } from "react";
import type { Result } from "@/lib/assessment/engine";
import { lowestDimensions } from "@/lib/assessment/insights";

export function PersonalInsights({ dimensions }: Pick<Result, "dimensions">) {
  const lowest = lowestDimensions(dimensions);
  const [selected, setSelected] = useState("");
  const focus = lowest.find((d) => d.id === selected) ?? lowest[0];
  return (
    <section
      className="personal-insights paper"
      aria-labelledby="insights-title"
    >
      <p className="eyebrow">Langkah kecil untuk Anda</p>
      <h2 id="insights-title">Mulai dari satu aspek.</h2>
      {!focus ? (
        <p>
          Data belum cukup untuk memilih latihan personal. Lengkapi minimal 8
          respons numerik pada satu aspek agar fokus latihan dapat ditentukan.
        </p>
      ) : (
        <>
          <p>
            {dimensions.some((d) => d.index === null)
              ? "Di antara aspek dengan data cukup, "
              : "Dalam profil Anda, "}
            <strong>{focus.name}</strong> memiliki indeks{" "}
            {lowest.length > 1
              ? "terendah yang sama dengan aspek lain"
              : "paling rendah"}{" "}
            ({Math.round(focus.index!)}/100). Jadikan ini titik awal latihan;
            selisih kecil bukan bukti perbedaan kemampuan.
          </p>
          {lowest.length > 1 && (
            <div
              className="focus-options"
              role="group"
              aria-label="Pilih aspek dengan skor terendah yang sama"
            >
              {lowest.map((d) => (
                <button
                  key={d.id}
                  className={d.id === focus.id ? "primary" : "secondary"}
                  aria-pressed={d.id === focus.id}
                  onClick={() => setSelected(d.id)}
                >
                  {d.name}
                </button>
              ))}
            </div>
          )}
          <h3>Latihan untuk {focus.name}</h3>
          <p className="small muted">
            Pilih satu untuk dicoba hari ini, lalu ulangi besok.
          </p>
          <ol className="personal-exercises">
            {focus.exercises.slice(0, 3).map((exercise, i) => (
              <li key={`${focus.id}-${i}`}>
                <span className="exercise-number" aria-hidden="true">
                  0{i + 1}
                </span>
                <p>{exercise}</p>
              </li>
            ))}
          </ol>
          <p className="small muted">
            Setelah mencoba, catat situasinya, apa yang Anda lakukan, dan apa
            yang ingin Anda sesuaikan berikutnya.
          </p>
        </>
      )}
    </section>
  );
}
