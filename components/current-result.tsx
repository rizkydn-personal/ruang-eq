"use client";
import { useConfirmation } from "@/components/confirmation-provider";
import Link from "next/link";
import { useSession } from "./session-provider";
import { Results, type Donation } from "./results";
export function CurrentResult({ donation }: { donation: Donation }) {
  const confirmAction = useConfirmation();
  const { attempt, clear, ready, user, saveStatus, error, retry } =
    useSession();
  if (!ready)
    return (
      <div className="narrow page" role="status">
        Memuat hasil...
      </div>
    );
  if (!attempt || attempt.status !== "completed")
    return (
      <div className="narrow page">
        <h1>Hasil belum tersedia.</h1>
        <p>Selesaikan asesmen untuk melihat profil lima dimensi Anda.</p>
        <Link className="button primary" href="/test">
          {attempt ? "Lanjutkan tes" : "Mulai tes"}
        </Link>
      </div>
    );
  return (
    <>
      {user && (
        <div className="container">
          <p className="small" role="status">
            {saveStatus}
          </p>
          {error && (
            <p role="alert">
              {error}{" "}
              <button className="text-button" onClick={retry}>
                Coba simpan lagi
              </button>
            </p>
          )}
        </div>
      )}
      <Results
        attempt={attempt}
        donation={donation}
        onClear={async () => {
          if (
            await confirmAction(
              "Hapus sesi browser ini? Unduh hasil terlebih dahulu jika ingin menyimpannya.",
              {
                title: "Hapus sesi ini?",
                action: "Hapus sesi",
                destructive: true,
              },
            )
          )
            clear();
        }}
      />
    </>
  );
}
