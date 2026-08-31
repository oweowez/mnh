import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="brand" aria-label="Fondation MNH — Accueil">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo/logo-mnh.svg" alt="Fondation MNH" height={46} style={{ height: 46, width: "auto" }} />
        </Link>
        <nav className="site-nav">
          <Link href="/comprendre">Comprendre les enjeux</Link>
          <Link href="/professions">Professions</Link>
          <Link href="/recherches">Recherches &amp; projets</Link>
          <Link href="/recherche" className="nav-cta">Rechercher</Link>
        </nav>
      </div>
    </header>
  );
}
