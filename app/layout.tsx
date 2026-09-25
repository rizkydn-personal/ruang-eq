import type { Metadata } from "next";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { ConfirmationProvider } from "@/components/confirmation-provider";
import { Header, Footer } from "@/components/site-shell";
import { product } from "@/lib/config/product";
export const metadata: Metadata = {
  title: {
    default: `${product.name} | Kenali pola emosi Anda`,
    template: `%s | ${product.name}`,
  },
  description:
    "Asesmen refleksi diri dalam lima dimensi. Kenali pola emosional dan pilih latihan kecil untuk keseharian.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>
        <ConfirmationProvider>
          <SessionProvider>
            <a className="skip-link" href="#main">
              Langsung ke isi
            </a>
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </SessionProvider>
        </ConfirmationProvider>
      </body>
    </html>
  );
}
