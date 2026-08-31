import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <strong style={{ color: "#fff" }}>Fondation MNH</strong> — De la recherche aux réalités de chaque métier.
          <br />
          Base de connaissances issue des travaux de recherche soutenus par la Fondation MNH.
        </div>
        <div>
          <Link href="/recherches">Bibliothèque des travaux</Link> · <Link href="/admin">Administration</Link>
        </div>
      </div>
    </footer>
  );
}
