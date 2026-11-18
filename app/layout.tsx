import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/** Texte courant : Inter (police du site fondation-mnh.fr). Les titres restent en ITC Avant Garde (globals.css). */
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Fondation MNH — Santé des professionnels de santé",
    template: "%s — Fondation MNH",
  },
  description:
    "Base de connaissances sur la santé des professionnels de santé : comprendre ce que la recherche nous apprend aujourd'hui, profession par profession.",
};

export const viewport: Viewport = {
  themeColor: "#083264",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
