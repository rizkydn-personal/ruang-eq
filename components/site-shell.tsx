"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { product } from "@/lib/config/product";
import { useSession } from "./session-provider";
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link
          className="brand"
          href="/"
          aria-label={`${product.name}, beranda`}
        >
          <span className="brand-symbol" aria-hidden="true">
            <span />
            <span />
          </span>
          {product.name}
          <span className="brand-period">.</span>
        </Link>
        <button
          className="menu-button secondary"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={18} /> : <Menu size={18} />} Menu
        </button>
        <nav
          id="main-nav"
          className={open ? "nav open" : "nav"}
          aria-label="Navigasi utama"
        >
          {[
            ["/", "Beranda"],
            ["/methodology", "Tentang asesmen"],
            ["/history", user ? "Riwayat saya" : "Riwayat"],
          ].map(([url, label]) => (
            <Link
              key={url}
              href={url}
              aria-current={path === url ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            className="nav-start"
            href="/test"
            onClick={() => setOpen(false)}
          >
            Mulai tes
          </Link>
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <span>{product.name} · Ruang untuk memahami diri.</span>
      <div>
        <Link href="/methodology">Metodologi</Link>
        <Link href="/privacy">Privasi & data</Link>
      </div>
    </footer>
  );
}
