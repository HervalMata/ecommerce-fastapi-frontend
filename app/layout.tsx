import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/footer";
import {Suspense} from "react";

export const metadata: Metadata = {
  title: "Cris Laços - Sua Loja Premium",
  description: "Compre os melhores produtos com preços oncrivéis e entrega grátis",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`h-full antialiased`}
    >
      <body>
        <Suspense fallback={<div>A carregar menu...</div>}>
          <Navbar />
        </Suspense>
        <main className="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
