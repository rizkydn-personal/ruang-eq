"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Coffee, Download, Copy, X, ArrowLeft } from "lucide-react";
import { score, type Attempt, type Result } from "@/lib/assessment/engine";
import { disclaimer } from "@/lib/config/product";
import { sevenDays } from "@/lib/assessment/interpretation-rules";
import { download, fileName, reportModel } from "@/lib/export/report";
import { EqRadar } from "./eq-radar";
import { PersonalInsights } from "./personal-insights";
export type Donation = { bank: string; number: string; holder: string };
export function Results({
  attempt,
  snapshot,
  donation,
  onClear,
}: {
  attempt: Attempt;
  snapshot?: Result;
  donation: Donation;
  onClear?: () => void;
}) {
  const result = snapshot || score(attempt.responsesByItemId);
  const [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [copied, setCopied] = useState("");
  const dialog = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const exportReport = async (format: "pdf" | "png") => {
    setBusy(format);
    setError("");
    try {
      const report = reportModel(attempt, result);
      const blob =
        format === "pdf"
          ? (await import("@/lib/export/pdf")).buildPdf(report)
          : await (await import("@/lib/export/png")).buildPng(report);
      download(blob, fileName(format));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unduhan gagal. Coba lagi.");
    } finally {
      setBusy("");
    }
  };
  const values = Object.values(attempt.responsesByItemId).filter(
    (v) => v !== null,
  );
  const reviewSuggested =
    (values.length > 0 && new Set(values).size === 1) ||
    Date.parse(attempt.completedAt || attempt.createdAt) -
      Date.parse(attempt.createdAt) <
      120000;
  return (
    <div className="container page">
      <div className="result-heading">
        <Link href="/test" className="back-link">
          <ArrowLeft size={16} /> Sesi asesmen
        </Link>
        <p className="eyebrow">Hasil refleksi Anda</p>
        <h1>
          Kenali polanya.
          <br />
          Pilih langkah berikutnya.
        </h1>
        <p className="lead">
          Lima sudut pandang dari pengalaman Anda dalam empat minggu terakhir.
        </p>
        <p className="small muted">
          {new Date(
            attempt.completedAt || attempt.createdAt,
          ).toLocaleDateString("id-ID", { dateStyle: "long" })}{" "}
          · {attempt.instrumentVersion} · Draft refleksi diri
        </p>
      </div>
      <p className="notice">
        {disclaimer} Instrumen belum tervalidasi (draft_self_report). Tidak
        untuk rekrutmen atau keputusan klinis.
      </p>
      {reviewSuggested && (
        <p className="notice">
          Respons Anda seragam atau waktu pengerjaan cukup singkat. Coba periksa
          apakah hasil ini sesuai dengan pengalaman nyata. Skor tidak dikurangi.
        </p>
      )}
      <div className="result-layout">
        <section className="paper chart-card" aria-labelledby="profile-title">
          <h2 id="profile-title">Profil lima dimensi</h2>
          <p className="small muted">
            Indeks jawaban 0–100. Semakin besar indeks, semakin sering perilaku
            terarah dilaporkan.
          </p>
          <EqRadar dimensions={result.dimensions} />
          {result.dimensions.map((d, i) => (
            <div className="chart-row" key={d.id}>
              <div className="chart-label">
                <span>
                  {i + 1}. {d.name}
                </span>
                <strong>
                  {d.index === null
                    ? "Belum cukup"
                    : `${Math.round(d.index)} / 100`}
                </strong>
              </div>
              <div className="chart-track" aria-hidden="true">
                <div
                  className="chart-fill"
                  style={{ width: `${d.index ?? 0}%` }}
                />
              </div>
              <div className="chart-meta">
                {d.count} dari 10 respons numerik
                {d.index === null ? " · perlu minimal 8" : ""}
              </div>
            </div>
          ))}
          <div className="chart-axis" aria-hidden="true">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
          {result.summary !== null ? (
            <div className="summary">
              <span>Ringkasan indeks refleksi</span>
              <strong>
                {Math.round(result.summary)}
                <span className="small"> / 100</span>
              </strong>
            </div>
          ) : (
            <p className="notice">
              Hasil parsial. Ringkasan belum tersedia karena ada dimensi dengan
              kurang dari 8 respons numerik.
            </p>
          )}
          <p className="small muted">
            Missing tidak dihitung sebagai nilai tengah. Indeks bukan persentil
            atau persentase kecerdasan.
          </p>
        </section>
        <aside className="result-aside">
          <h2>Simpan untuk diri Anda.</h2>
          <p>
            Unduh profil dan rencana latihan. Hasil guest tidak memiliki arsip
            cloud.
          </p>
          <button
            className="primary"
            disabled={!!busy}
            onClick={() => void exportReport("pdf")}
          >
            <Download size={17} />
            {busy === "pdf" ? "Menyiapkan PDF..." : "Unduh PDF"}
          </button>
          <button
            className="secondary"
            disabled={!!busy}
            onClick={() => void exportReport("png")}
          >
            <Download size={17} />
            {busy === "png" ? "Menyiapkan PNG..." : "Unduh PNG"}
          </button>
          <p className="small">
            PDF A4 · maksimal 5 MB
            <br />
            Unduhan dibuat di perangkat Anda.
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button
            className="coffee-button"
            ref={trigger}
            onClick={() => {
              setCopied("");
              dialog.current?.showModal();
            }}
          >
            <Coffee size={18} /> Give me a Coffe
          </button>
          <p className="small">
            Dukungan bersifat opsional. Semua hasil dan unduhan tetap tersedia.
          </p>
          {onClear && (
            <button className="text-button danger" onClick={onClear}>
              Hapus sesi
            </button>
          )}
        </aside>
      </div>
      <PersonalInsights key={attempt.id} dimensions={result.dimensions} />
      <section className="result-details">
        <p className="eyebrow">Memahami jawaban Anda</p>
        <h2>Apa yang dapat Anda perhatikan?</h2>
        <p className="muted">
          Deskripsi frekuensi memakai rentang editorial dari skala jawaban,
          bukan batas kemampuan atau norma populasi. Latihan di bawah adalah
          pilihan, bukan kewajiban.
        </p>
        {result.dimensions.map((d) => (
          <article className="dimension-detail" key={d.id}>
            <div className="detail-title">
              <h2>{d.name}</h2>
              <strong>
                {d.index === null
                  ? "Belum cukup"
                  : Math.round(d.index) + "/100"}
              </strong>
            </div>
            <p className="muted">{d.description}</p>
            <p>{d.interpretation}</p>
            <p className="small">
              <strong>Situasi untuk diamati:</strong> {d.situation}
            </p>
            <ol className="exercise-list">
              {d.exercises.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ol>
          </article>
        ))}
        <section className="plan">
          <p className="eyebrow">Sedikit, tetapi bisa dilakukan</p>
          <h2>Rencana tujuh hari.</h2>
          {result.focus.length ? (
            <p className="small">
              Area yang dapat dipilih untuk latihan:{" "}
              {result.dimensions
                .filter((d) => result.focus.includes(d.id))
                .map((d) => d.name)
                .join(", ")}
              . Pilihan berdasarkan indeks relatif lebih kecil; selisih kecil
              tidak dinyatakan signifikan.
            </p>
          ) : (
            <p className="small">
              Data belum cukup untuk memilih fokus personal. Anda tetap boleh
              memakai rencana umum ini atau mengulang asesmen saat dapat menilai
              pengalaman Anda.
            </p>
          )}
          {sevenDays.map((text, i) => (
            <div key={text} className="day">
              <strong>Hari {i + 1}</strong>
              <span>{text}</span>
            </div>
          ))}
        </section>
        <p className="small muted">
          Tidak ada jaminan peningkatan skor. Perubahan hasil dari waktu ke
          waktu bersifat deskriptif dan belum tentu menunjukkan perubahan
          kemampuan.
        </p>
        <div className="actions">
          <Link href="/test" className="button secondary">
            Kembali ke sesi
          </Link>
          <Link href="/methodology" className="button secondary">
            Baca metodologi
          </Link>
        </div>
      </section>
      <dialog
        className="dialog"
        ref={dialog}
        aria-labelledby="coffee-title"
        onClose={() => trigger.current?.focus()}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]',
            ),
          );
          const first = controls[0],
            last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="dialog-close">
          <button
            aria-label="Tutup dukungan kopi"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <Coffee size={30} />
        <h2 id="coffee-title">Terima kasih sudah singgah.</h2>
        <p className="small">
          Jika ruang refleksi ini membantu, Anda dapat mendukung
          pengembangannya.
        </p>
        {donation.bank && donation.number && donation.holder ? (
          <>
            <dl>
              <dt>Bank</dt>
              <dd>{donation.bank}</dd>
              <dt>Nomor rekening</dt>
              <dd>{donation.number}</dd>
              <dt>Nama pemilik</dt>
              <dd>{donation.holder}</dd>
            </dl>
            <button
              className="primary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(donation.number);
                  setCopied("Nomor rekening disalin.");
                } catch {
                  setCopied(
                    "Tidak dapat menyalin. Salin nomor rekening secara manual.",
                  );
                }
              }}
            >
              <Copy size={17} /> Salin nomor rekening
            </button>
            <p role="status" className="small">
              {copied}
            </p>
          </>
        ) : (
          <p className="notice">Informasi rekening belum tersedia.</p>
        )}
        <p className="small muted">Tidak perlu mengirim bukti transfer.</p>
      </dialog>
    </div>
  );
}
