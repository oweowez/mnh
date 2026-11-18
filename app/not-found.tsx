import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="contenu">
        <div className="container state">
          <div className="state-inner">
            <p className="state-code">Erreur 404</p>
            <h1>Cette page est introuvable</h1>
            <p>Le contenu a peut-être été déplacé ou n&apos;est plus publié. La recherche permet de le retrouver.</p>
            <div className="actions-row">
              <Link href="/" className="btn btn-primary">Retour à l&apos;accueil</Link>
              <Link href="/recherche" className="btn btn-ghost">Rechercher</Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
