"use client";
import { useConfirmation } from "@/components/confirmation-provider";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { itemById, responseLabels } from "@/lib/assessment/items";
import { disclaimer } from "@/lib/config/product";
import { score } from "@/lib/assessment/engine";
export default function Test() {
  const confirmAction = useConfirmation();
  const {
    attempt,
    user,
    ready,
    start,
    update,
    clear,
    saveStatus,
    error,
    retry,
  } = useSession();
  const [index, setIndex] = useState(0),
    [review, setReview] = useState(false),
    [consent, setConsent] = useState(false),
    [message, setMessage] = useState("");
  const title = useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  useEffect(() => {
    title.current?.focus();
  }, [index, review, attempt?.id]);
  if (!ready)
    return (
      <div className="narrow page" role="status">
        Memulihkan sesi...
      </div>
    );
  if (!attempt)
    return (
      <div className="narrow page">
        <Link className="back-link" href="/">
          <ArrowLeft size={16} /> Beranda
        </Link>
        <p className="eyebrow">Sebelum mulai</p>
        <h1>
          Luangkan waktu
          <br />
          untuk diri sendiri.
        </h1>
        <p className="lead">
          Jawab berdasarkan pengalaman Anda dalam{" "}
          <strong>empat minggu terakhir</strong>.
        </p>
        <div className="paper intro-paper">
          <h2>Tidak perlu mencari jawaban ideal.</h2>
          <p>
            Pilih seberapa sering setiap pernyataan sesuai dengan pengalaman
            Anda. Jika belum mengalami atau sulit menilai, gunakan “Tidak dapat
            menilai / belum mengalami”.
          </p>
          <ul className="clean-list">
            <li>
              <Check size={18} /> 50 pernyataan dalam 5 tahap; estimasi 10–15
              menit.
            </li>
            <li>
              <Check size={18} /> Tidak ada batas waktu. Anda bisa meninjau
              jawaban.
            </li>
            <li>
              <ShieldCheck size={18} />{" "}
              {user
                ? "Draft dan hasil akan disimpan di akun Google Anda."
                : "Jawaban guest hanya disimpan sementara dalam sesi tab ini. Unduh hasil sebelum menutupnya."}
            </li>
          </ul>
          <p className="notice">
            {disclaimer} Status instrumen: draft refleksi diri
            (draft_self_report). Tidak untuk rekrutmen atau keputusan klinis.
          </p>
          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              Saya berusia 18 tahun atau lebih dan memahami tujuan serta
              penyimpanan data asesmen ini.
            </span>
          </label>
          <button
            className="primary"
            disabled={!consent}
            onClick={() => {
              start();
              setIndex(0);
            }}
          >
            Mulai tes <ArrowRight size={18} />
          </button>
        </div>
        <p className="small muted">
          Beberapa browser dapat memulihkan sesi setelah ditutup. Gunakan Hapus
          sesi untuk membersihkan data aplikasi.{" "}
          <Link href="/privacy">Baca privasi</Link>.
        </p>
      </div>
    );
  if (attempt.status === "completed")
    return (
      <div className="narrow page">
        <p className="eyebrow">Sesi selesai</p>
        <h1>Refleksi Anda sudah tersedia.</h1>
        <div className="actions">
          <Link className="button primary" href="/result">
            Lihat hasil
          </Link>
          <button
            className="secondary"
            onClick={async () => {
              if (
                await confirmAction(
                  "Mulai tes baru akan menggantikan sesi ini. Sudah mengunduh hasil yang ingin disimpan?",
                  { title: "Mulai tes baru?", action: "Mulai tes baru" },
                )
              ) {
                clear();
                setIndex(0);
                setReview(false);
                setConsent(false);
              }
            }}
          >
            Tes baru
          </button>
        </div>
      </div>
    );
  const answered = Object.keys(attempt.responsesByItemId).length;
  const id = attempt.itemOrder[index];
  const item = itemById[id];
  const value = attempt.responsesByItemId[id];
  const missing = attempt.itemOrder.filter(
    (i) => !(i in attempt.responsesByItemId),
  );
  return (
    <div className="narrow page assessment">
      <div className="test-top">
        <Link className="back-link" href="/">
          Simpan jeda di tab ini
        </Link>
        <span className="small">{user ? "Mode akun" : "Mode guest"}</span>
      </div>
      <div className="progress-meta">
        <span>
          {review
            ? "Tinjau jawaban"
            : `Tahap ${Math.floor(index / 10) + 1} dari 5`}
        </span>
        <span>{answered} / 50 terjawab</span>
      </div>
      <progress aria-label="Pernyataan terjawab" value={answered} max={50} />
      <div className="stage-markers" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={n === Math.floor(index / 10) + 1 ? "current" : ""}
          >
            Tahap {n}
          </span>
        ))}
      </div>
      <div className="paper question-paper">
        {review ? (
          <>
            <p className="eyebrow">Sebelum melihat hasil</p>
            <h1 ref={title} tabIndex={-1}>
              Tinjau jawaban Anda.
            </h1>
            <p>
              {missing.length
                ? `${missing.length} pernyataan belum dijawab. Buka nomor bertanda kosong untuk melengkapinya.`
                : "Semua pernyataan sudah direspons. Anda masih bisa mengubah pilihan."}
            </p>
            {score(attempt.responsesByItemId).dimensions.some(
              (d) => d.index === null,
            ) && (
              <div className="notice">
                <strong>Cakupan respons numerik</strong>
                <ul>
                  {score(attempt.responsesByItemId).dimensions.map((d) => (
                    <li key={d.id}>
                      {d.name}: {d.count}/10
                      {d.index === null
                        ? " · jawaban belum cukup (minimal 8)"
                        : ""}
                    </li>
                  ))}
                </ul>
                <p>
                  Anda dapat meninjau kembali nomor soal atau melanjutkan dengan
                  hasil parsial setelah semua pernyataan direspons.
                </p>
              </div>
            )}
            <p className="small muted">
              Tanda ✓ berarti respons angka; tanda — berarti tidak dapat
              menilai. Pilihan ini tidak dihitung sebagai nilai tengah.
            </p>
            <div className="review-grid">
              {attempt.itemOrder.map((itemId, i) => (
                <button
                  key={itemId}
                  className={
                    itemId in attempt.responsesByItemId
                      ? "review-item answered"
                      : "review-item"
                  }
                  aria-label={`Soal ${i + 1}, ${!(itemId in attempt.responsesByItemId) ? "belum dijawab" : attempt.responsesByItemId[itemId] === null ? "tidak dapat menilai" : "terjawab"}`}
                  onClick={() => {
                    setIndex(i);
                    setReview(false);
                    setMessage("");
                  }}
                >
                  {i + 1}
                  <small>
                    {!(itemId in attempt.responsesByItemId)
                      ? "kosong"
                      : attempt.responsesByItemId[itemId] === null
                        ? "—"
                        : "✓"}
                  </small>
                </button>
              ))}
            </div>
            <button
              className="primary"
              disabled={missing.length > 0}
              onClick={() => {
                update({
                  ...attempt,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                });
                router.push("/result");
              }}
            >
              Lihat hasil refleksi <ArrowRight size={18} />
            </button>
          </>
        ) : (
          <>
            <p className="eyebrow">Pernyataan {index + 1} dari 50</p>
            <p className="time-anchor">Dalam empat minggu terakhir...</p>
            <h1 className="question-title" ref={title} tabIndex={-1}>
              {item.text}
            </h1>
            <fieldset>
              <legend>
                Seberapa sering ini sesuai dengan pengalaman Anda?
              </legend>
              <div className="answers">
                {responseLabels.map((label, i) => (
                  <label
                    key={label}
                    className={value === i + 1 ? "answer selected" : "answer"}
                  >
                    <input
                      type="radio"
                      name={id}
                      value={i + 1}
                      checked={value === i + 1}
                      onChange={() => {
                        update({
                          ...attempt,
                          responsesByItemId: {
                            ...attempt.responsesByItemId,
                            [id]: i + 1,
                          },
                        });
                        setMessage("");
                      }}
                    />
                    <span>{label}</span>
                    <span className="answer-number" aria-hidden="true">
                      {i + 1}
                    </span>
                  </label>
                ))}
                <label
                  className={
                    value === null
                      ? "answer missing selected"
                      : "answer missing"
                  }
                >
                  <input
                    type="radio"
                    name={id}
                    checked={value === null}
                    onChange={() => {
                      update({
                        ...attempt,
                        responsesByItemId: {
                          ...attempt.responsesByItemId,
                          [id]: null,
                        },
                      });
                      setMessage("");
                    }}
                  />
                  <span>Tidak dapat menilai / belum mengalami</span>
                </label>
              </div>
            </fieldset>
            {message && (
              <p role="alert" className="error">
                {message}
              </p>
            )}
            <div className="question-nav">
              <button
                className="secondary"
                disabled={index === 0}
                onClick={() => {
                  setIndex(index - 1);
                  setMessage("");
                }}
              >
                <ArrowLeft size={17} /> Sebelumnya
              </button>
              <button
                className="primary"
                onClick={() => {
                  if (value === undefined) {
                    setMessage(
                      "Pilih satu jawaban atau Tidak dapat menilai untuk melanjutkan.",
                    );
                    return;
                  }
                  if (index === 49) setReview(true);
                  else setIndex(index + 1);
                }}
              >
                {index === 49 ? "Tinjau jawaban" : "Berikutnya"}
                <ArrowRight size={17} />
              </button>
            </div>
          </>
        )}
      </div>
      <div className="test-bottom">
        <button className="text-button" onClick={() => setReview(!review)}>
          {review ? "Kembali ke pernyataan" : "Tinjau semua jawaban"}
        </button>
        <button
          className="text-button danger"
          onClick={async () => {
            if (
              await confirmAction(
                "Hapus seluruh jawaban dari sesi browser ini? Data yang sudah tersimpan di akun tetap tersedia di Riwayat.",
                {
                  title: "Hapus sesi ini?",
                  action: "Hapus sesi",
                  destructive: true,
                },
              )
            ) {
              clear();
              setIndex(0);
              setReview(false);
              setConsent(false);
            }
          }}
        >
          Hapus sesi
        </button>
      </div>
      <p className="small muted" role="status">
        {user ? saveStatus : "Jawaban disimpan sementara di sesi tab ini."}
      </p>
      {error && (
        <div className="notice" role="alert">
          {error}{" "}
          {user && (
            <button className="text-button" onClick={retry}>
              Coba simpan lagi
            </button>
          )}
        </div>
      )}
    </div>
  );
}
