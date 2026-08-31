import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container foot-grid">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo/logo-mnh-footer.svg" alt="Fondation MNH" height={92} style={{ height: 92, width: "auto" }} />
        <div style={{ maxWidth: 460 }}>
          <strong>De la recherche aux réalités de chaque métier.</strong>
          <br />
          Base de connaissances issue des travaux de recherche soutenus par la Fondation MNH
          sur la santé des professionnels de santé.
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <Link href="/comprendre">Comprendre les enjeux</Link>
          <Link href="/professions">Explorer par profession</Link>
          <Link href="/recherches">Bibliothèque des travaux</Link>
          <Link href="/admin">Administration</Link>
        </div>
      </div>
    </footer>
  );
}
