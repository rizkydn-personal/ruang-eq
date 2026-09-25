"use client";
import { useConfirmation } from "@/components/confirmation-provider";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "./session-provider";
import {
  attemptSchema,
  type Attempt,
  type Result,
} from "@/lib/assessment/engine";
import { Results, type Donation } from "./results";
type CloudAttempt = Attempt & {
  resultSnapshot: Result | null;
  updatedAt: unknown;
  cloudCreatedAt: unknown;
};
export function toAttempt(cloud: CloudAttempt) {
  const { resultSnapshot, updatedAt, cloudCreatedAt, ...attempt } = cloud;
  void resultSnapshot;
  void updatedAt;
  void cloudCreatedAt;
  return attemptSchema.parse(attempt);
}
export function History() {
  const confirmAction = useConfirmation();
  const {
    user,
    ready,
    login,
    redirect,
    logout,
    deleteAccount,
    api,
    load,
    attempt,
    clear,
    error: authError,
  } = useSession();
  const [data, setData] = useState<CloudAttempt[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  const fetchPage = useCallback(
    async (cursor?: string) => {
      setBusy(true);
      setError("");
      try {
        const res = await api<{
          attempts: CloudAttempt[];
          nextCursor: string | null;
        }>(`/api/attempts${cursor ? "?cursor=" + cursor : ""}`);
        setData((prev) =>
          cursor
            ? [
                ...prev,
                ...res.attempts.filter((a) => !prev.some((p) => p.id === a.id)),
              ]
            : res.attempts,
        );
        setCursor(res.nextCursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Riwayat gagal dimuat.");
      } finally {
        setBusy(false);
      }
    },
    [api],
  );
  useEffect(() => {
    if (user) void fetchPage();
    else setData([]);
  }, [user, fetchPage]);
  if (!ready)
    return (
      <div className="narrow page" role="status">
        Memuat akun...
      </div>
    );
  if (!user)
    return (
      <div className="narrow page">
        <p className="eyebrow">Riwayat refleksi</p>
        <h1>
          Simpan perjalanan
          <br />
          refleksi Anda.
        </h1>
        <p>
          Masuk dengan Google untuk membuka draft dan hasil yang disimpan di
          akun. Hasil guest tidak otomatis dipindahkan ke akun.
        </p>
        <div className="actions">
          <button className="primary" onClick={() => void login()}>
            Masuk dengan Google
          </button>
          <Link href="/test" className="button secondary">
            Lanjut sebagai guest
          </Link>
        </div>
        {authError && (
          <div className="notice" role="alert">
            {authError}
            {authError.includes("Popup") && (
              <button className="text-button" onClick={() => void redirect()}>
                Masuk melalui pengalihan
              </button>
            )}
          </div>
        )}
      </div>
    );
  return (
    <div className="narrow page">
      <p className="eyebrow">Akun Anda</p>
      <h1>Riwayat refleksi.</h1>
      <p className="muted">
        Perubahan skor bersifat deskriptif; belum tentu menunjukkan perubahan
        kemampuan.
      </p>
      <div className="actions">
        <Link className="button primary" href="/test">
          Buka sesi / tes baru
        </Link>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => void fetchPage()}
        >
          Muat ulang
        </button>
      </div>
      {busy && <p role="status">Memuat riwayat...</p>}
      {error && (
        <p className="notice" role="alert">
          {error}{" "}
          <button className="text-button" onClick={() => void fetchPage()}>
            Coba lagi
          </button>
        </p>
      )}
      {!busy && !error && !data.length && (
        <div className="empty-state">
          <h2>Belum ada asesmen tersimpan.</h2>
          <p>Mulai satu sesi untuk membuat draft pertama di akun Anda.</p>
        </div>
      )}
      {data.map((a) => (
        <article key={a.id} className="history-row">
          <div>
            <h2>
              {new Date(a.completedAt || a.createdAt).toLocaleDateString(
                "id-ID",
                { dateStyle: "long" },
              )}
            </h2>
            <p>
              {a.status === "completed" ? "Selesai" : "Draft"} ·{" "}
              {Object.keys(a.responsesByItemId).length}/50 respons
            </p>
            <p>{a.instrumentVersion}</p>
          </div>
          <div className="actions">
            {a.status === "completed" ? (
              <Link className="button secondary" href={`/history/${a.id}`}>
                Buka hasil
              </Link>
            ) : (
              <button
                className="secondary"
                onClick={() => {
                  load(toAttempt(a));
                  router.push("/test");
                }}
              >
                Lanjutkan draft
              </button>
            )}
            <button
              className="text-button danger"
              disabled={busy}
              onClick={async () => {
                if (
                  !(await confirmAction(
                    "Hapus hasil atau draft ini dari akun? Tindakan ini tidak dapat dibatalkan.",
                    {
                      title: "Hapus asesmen ini?",
                      action: "Hapus asesmen",
                      destructive: true,
                    },
                  ))
                )
                  return;
                setBusy(true);
                try {
                  await api(`/api/attempts/${a.id}`, "DELETE");
                  if (attempt?.id === a.id) clear();
                  setData((prev) => prev.filter((p) => p.id !== a.id));
                } catch (e) {
                  setError(
                    e instanceof Error ? e.message : "Penghapusan gagal.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              Hapus
            </button>
          </div>
        </article>
      ))}
      {cursor && (
        <button
          className="secondary"
          disabled={busy}
          onClick={() => void fetchPage(cursor)}
        >
          Muat lebih banyak
        </button>
      )}
      <div className="history-account">
        <button
          className="text-button"
          onClick={async () => {
            if (
              await confirmAction(
                "Keluar akan membersihkan sesi browser. Pastikan draft sudah tersimpan.",
                { title: "Keluar dari akun?", action: "Keluar" },
              )
            ) {
              try {
                await logout();
              } catch {
                setError("Gagal keluar. Coba lagi.");
              }
            }
          }}
        >
          Keluar dari akun
        </button>
        <button
          className="text-button danger"
          disabled={busy}
          onClick={async () => {
            if (
              !(await confirmAction(
                "Hapus akun beserta semua draft dan hasil? Anda akan diminta masuk ulang. Tindakan tidak dapat dibatalkan.",
                {
                  title: "Hapus akun dan data?",
                  action: "Hapus akun",
                  destructive: true,
                },
              ))
            )
              return;
            setBusy(true);
            try {
              await deleteAccount();
            } catch (e) {
              setError(
                e instanceof Error
                  ? e.message
                  : "Penghapusan belum selesai. Masuk ulang dan coba lagi.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          Hapus akun dan semua data
        </button>
      </div>
    </div>
  );
}
export function HistoryDetail({
  id,
  donation,
}: {
  id: string;
  donation: Donation;
}) {
  const { user, ready, api } = useSession();
  const [data, setData] = useState<CloudAttempt | null>(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setData(null);
    if (user)
      api<CloudAttempt>(`/api/attempts/${id}`)
        .then((d) => {
          if (active) {
            setData(d);
            setError("");
          }
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [user, id, api, retry]);
  if (!ready)
    return (
      <div className="narrow page" role="status">
        Memuat akun...
      </div>
    );
  if (!user)
    return (
      <div className="narrow page">
        <h1>Masuk untuk membuka hasil.</h1>
        <Link href="/history" className="button primary">
          Buka akun
        </Link>
      </div>
    );
  if (error)
    return (
      <div className="narrow page">
        <p role="alert">{error}</p>
        <button className="secondary" onClick={() => setRetry(retry + 1)}>
          Coba lagi
        </button>
        <Link href="/history">Kembali ke riwayat</Link>
      </div>
    );
  if (!data)
    return (
      <div className="narrow page" role="status">
        Memuat hasil...
      </div>
    );
  if (data.status !== "completed" || !data.resultSnapshot)
    return (
      <div className="narrow page">
        <h1>Asesmen belum selesai.</h1>
        <Link href="/history">Lanjutkan melalui Riwayat</Link>
      </div>
    );
  return (
    <Results
      attempt={toAttempt(data)}
      snapshot={data.resultSnapshot}
      donation={donation}
    />
  );
}
