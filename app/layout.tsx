import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fondation MNH — Santé des professionnels de santé",
  description:
    "Base de connaissances sur la santé des professionnels de santé : comprendre ce que la recherche nous apprend aujourd'hui, profession par profession.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
