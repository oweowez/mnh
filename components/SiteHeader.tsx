import Link from "next/link";
import SiteNav from "./SiteNav";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <a href="#contenu" className="skip-link">Aller au contenu</a>
      <div className="container inner">
        <Link href="/" className="brand" aria-label="Fondation MNH — Accueil">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo/logoFondationMnh.png" alt="Fondation MNH" width={148} height={42} />
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
