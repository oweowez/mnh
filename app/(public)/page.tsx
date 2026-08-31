import Link from "next/link";
import Chain from "@/components/Chain";
import { listProfessions, listStudies, getPage } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const professions = listProfessions();
  const studies = listStudies();
  const intro = getPage("accueil");
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="kicker">Fondation MNH — Santé des professionnels de santé</div>
          <h1>De la recherche aux réalités de chaque métier</h1>
          <p>
            Comprendre ce que la recherche nous apprend aujourd&apos;hui sur la santé des
            professionnels de santé — et ce que cela change pour les établissements.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3">
          <Link href="/professions" className="card entry-card">
            <h3>Explorer par profession</h3>
            <p>{professions.length} groupes professionnels : enjeux, chiffres utiles, nuances et points de vigilance pour chaque métier.</p>
            <span className="arrow">Découvrir →</span>
          </Link>
          <Link href="/comprendre" className="card entry-card">
            <h3>Comprendre les grands enjeux</h3>
            <p>Enjeu humain, organisationnel et pour le système de soins : la lecture transversale des travaux soutenus.</p>
            <span className="arrow">Comprendre →</span>
          </Link>
          <Link href="/recherches" className="card entry-card">
            <h3>Découvrir les recherches et projets</h3>
            <p>{studies.length} travaux soutenus ou valorisés par la Fondation MNH : cohortes, études qualitatives, revues de littérature…</p>
            <span className="arrow">Parcourir →</span>
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="eyebrow" style={{ textAlign: "center" }}>Pourquoi c&apos;est un enjeu collectif</div>
          <h2 className="section-title" style={{ textAlign: "center" }}>Une chaîne d&apos;effets à prendre en compte</h2>
          <p className="section-sub" style={{ margin: "0 auto 28px", textAlign: "center" }}>
            La santé des professionnels dépasse l&apos;enjeu individuel : elle affecte les équipes,
            l&apos;organisation et le fonctionnement du système de soins.
          </p>
          <Chain />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Explorer par profession</h2>
          <p className="section-sub">Chaque fiche restitue les principaux résultats disponibles, leurs nuances scientifiques et ce que le décideur doit regarder.</p>
          <div className="grid grid-3">
            {professions.map((p) => (
              <Link key={p.id} href={`/professions/${p.slug}`} className="card">
                <h3>{p.name}</h3>
                <p>{p.short_desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {intro && (
        <section className="section">
          <div className="container narrow">
            <article className="doc">
              <h2>{intro.title}</h2>
              <div className="body">{intro.body}</div>
            </article>
          </div>
        </section>
      )}
    </>
  );
}
