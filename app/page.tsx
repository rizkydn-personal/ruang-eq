"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  Fingerprint,
  NotebookPen,
  Check,
  ArrowRight,
} from "lucide-react";
import { useSession } from "@/components/session-provider";
import { dimensions } from "@/lib/assessment/items";
export default function Home() {
  const { user, login, error, redirect, attempt } = useSession();
  return (
    <div className="container home">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> Mulai dari mengenali diri
          </p>
          <h1>
            Emosi punya cerita.
            <br />
            <span>
              Beri ruang untuk
              <br className="desktop-break" /> memahaminya.
            </span>
          </h1>
          <p className="lead">
            Kenali cara Anda merasakan, merespons, dan terhubung dengan orang
            lain. Lalu, pilih langkah kecil yang berarti untuk keseharian.
          </p>
          <div className="facts">
            <span>
              <Clock3 size={17} /> Estimasi 10–15 menit
            </span>
            <span>
              <NotebookPen size={17} /> 50 pernyataan
            </span>
          </div>
          <div className="start-options">
            <Link href="/test" className="button primary">
              {attempt
                ? "Lanjutkan sesi"
                : user
                  ? "Mulai dengan akun"
                  : "Mulai sebagai guest"}
              <ArrowRight size={18} />
            </Link>
            {user ? (
              <Link className="button secondary" href="/history">
                Buka akun saya
              </Link>
            ) : (
              <button className="secondary" onClick={() => void login()}>
                <span className="google-letter" aria-hidden="true">
                  G
                </span>{" "}
                Masuk dengan Google
              </button>
            )}
          </div>
          <p className="small muted">
            <Fingerprint size={15} /> Guest tanpa akun. Hasil diproses di
            perangkat Anda.
          </p>
          {error && (
            <div role="alert" className="notice">
              {error}
              {error.includes("Popup") && (
                <button onClick={() => void redirect()}>
                  Masuk melalui pengalihan
                </button>
              )}
            </div>
          )}
        </div>
        <aside className="reflection-panel">
          <div className="panel-caption">
            <span>Ruang refleksi Anda</span>
            <span className="tiny-mark" aria-hidden="true" />
          </div>
          <div className="reflection-art" aria-hidden="true">
            <div className="arc arc-one" />
            <div className="arc arc-two" />
            <div className="arc arc-three" />
            <div className="art-center" />
            <span className="art-line" />
          </div>
          <p className="reflection-quote">
            “Apa yang saya rasakan,
            <br />
            dan apa yang saya butuhkan?”
          </p>
          <p className="small muted">
            Satu pertanyaan sederhana.
            <br />
            Ruang untuk melihat lebih dekat.
          </p>
          <div className="panel-bottom">
            <Check size={17} />
            <span>Tidak ada jawaban yang harus sempurna.</span>
          </div>
        </aside>
      </section>
      <section className="dimensions-intro">
        <div>
          <p className="eyebrow">Lima sudut pandang, satu diri Anda</p>
          <h2>
            Lebih dari <br />
            satu angka.
          </h2>
          <p className="muted">
            Hasil berupa profil kebiasaan emosional, disertai latihan yang bisa
            Anda pilih.
          </p>
          <Link className="text-link" href="/methodology">
            Kenali cara asesmen bekerja <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="dimension-list">
          {dimensions.map((d, i) => (
            <div className="dimension-row" key={d.id}>
              <span className="row-number">0{i + 1}</span>
              <div>
                <h3>{d.name}</h3>
                <p>{d.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="honesty">
        <div className="honesty-label">Refleksi, dengan batas yang jelas.</div>
        <p>
          Instrumen ini masih berstatus draft dan belum tervalidasi. Hasil
          menggambarkan jawaban Anda saat ini, bukan diagnosis atau ukuran EQ
          terstandar. Ditujukan untuk dewasa 18+.
        </p>
      </section>
    </div>
  );
}
