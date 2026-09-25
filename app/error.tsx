"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="narrow page">
      <h1>Halaman belum dapat dimuat.</h1>
      <p>Coba lagi. Sesi yang tersimpan di tab ini dapat dipulihkan.</p>
      <button className="primary" onClick={reset}>
        Coba lagi
      </button>
    </div>
  );
}
