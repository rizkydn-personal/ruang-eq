import Link from "next/link";
export default function NotFound() {
  return (
    <div className="narrow page">
      <h1>Halaman tidak ditemukan.</h1>
      <p>Periksa alamat atau kembali ke beranda.</p>
      <Link href="/" className="button primary">
        Ke beranda
      </Link>
    </div>
  );
}
