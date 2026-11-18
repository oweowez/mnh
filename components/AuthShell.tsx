import Link from "next/link";
import Arcs from "./Arcs";
import Icon from "./Icon";

/** Gabarit des pages de connexion et de demande d'accès au back-office. */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth-aside">
        <Arcs />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo/logo-mnh.svg" alt="Fondation MNH" width={195} height={46} />
        <div>
          <h2>De la recherche aux <em>réalités</em> de chaque métier</h2>
          <p>Espace d&apos;administration de la base de connaissances sur la santé des professionnels de santé.</p>
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="auth-logo-mobile" src="/assets/logo/logoFondationMnh.png" alt="Fondation MNH" />
          <Link href="/" className="auth-back"><Icon name="back" />Retour au site</Link>
          {children}
        </div>
      </main>
    </div>
  );
}
