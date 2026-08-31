import Link from "next/link";
import Image from "next/image";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="brand" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
          <Image src="/assets/logo/logoFondationMnh.png" alt="Fondation MNH" width={44} height={44} style={{ objectFit: "contain" }} />
          <span>
            Fondation MNH
            <small>Santé des professionnels de santé</small>
          </span>
        </Link>
        <nav className="site-nav">
          <Link href="/comprendre">Comprendre les enjeux</Link>
          <Link href="/professions">Explorer par profession</Link>
          <Link href="/recherches">Recherches &amp; projets</Link>
          <Link href="/recherche">🔍 Rechercher</Link>
        </nav>
      </div>
    </header>
  );
}
