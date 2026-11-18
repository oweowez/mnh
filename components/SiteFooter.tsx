import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo/logo-mnh.svg" alt="Fondation MNH" width={195} height={46} />
            <p>
              <strong>De la recherche aux réalités de chaque métier.</strong>
              Base de connaissances issue des travaux de recherche soutenus par la Fondation MNH
              sur la santé des professionnels de santé.
            </p>
          </div>
          <nav aria-label="Explorer">
            <p className="foot-title">Explorer</p>
            <ul className="foot-links">
              <li><Link href="/professions">Par profession</Link></li>
              <li><Link href="/thematiques">Par thématique</Link></li>
              <li><Link href="/recherches">Recherches &amp; projets</Link></li>
              <li><Link href="/recherche">Rechercher</Link></li>
            </ul>
          </nav>
          <nav aria-label="À propos">
            <p className="foot-title">À propos</p>
            <ul className="foot-links">
              <li><Link href="/comprendre">Comprendre les enjeux</Link></li>
              <li><a href="https://fondation-mnh.fr" target="_blank" rel="noopener noreferrer">fondation-mnh.fr ↗</a></li>
            </ul>
          </nav>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} Fondation MNH</span>
          <Link href="/admin">Administration</Link>
        </div>
      </div>
    </footer>
  );
}
