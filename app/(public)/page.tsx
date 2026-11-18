import Link from "next/link";
import Arcs from "@/components/Arcs";
import Chain from "@/components/Chain";
import Icon from "@/components/Icon";
import ProfessionCard from "@/components/ProfessionCard";
import RichText, { normalizeText } from "@/components/RichText";
import { listProfessions, listStudies, listThemes, getPage, publishedCounts, studyRefIndex } from "@/lib/repo";

export const dynamic = "force-dynamic";

const HERO_LEAD =
  "Comprendre ce que la recherche nous apprend aujourd'hui sur la santé des professionnels de santé — et ce que cela change pour les établissements.";

/** Le premier paragraphe de la page « accueil » reprend le chapô du hero : on ne l'affiche pas deux fois. */
function withoutHeroLead(body: string): string {
  const paras = normalizeText(body).split(/\n{2,}/);
  const first = (paras[0] ?? "").trim().replace(/\.$/, "");
  return paras.length > 1 && first && HERO_LEAD.startsWith(first) ? paras.slice(1).join("\n\n") : body;
}

export default async function HomePage() {
  const [professions, themes, studies, intro, counts, refIndex] = await Promise.all([
    listProfessions(), listThemes(), listStudies(), getPage("accueil"), publishedCounts(), studyRefIndex(),
  ]);
  return (
    <>
      <section className="hero">
        <Arcs />
        <div className="container">
          <div className="hero-body">
            <p className="kicker">Santé des professionnels de santé</p>
            <h1>
              De la recherche aux <em>réalités</em> de chaque métier
            </h1>
            <p className="hero-lead">{HERO_LEAD}</p>
            <form className="search" action="/recherche" method="get" role="search">
              <Icon name="search" />
              <input
                type="search" name="q"
                placeholder="TMS, violences, sommeil, aides-soignants…"
                aria-label="Rechercher dans la base de connaissances"
              />
              <button type="submit" className="btn btn-accent">Rechercher</button>
            </form>
            {themes.length > 0 && (
              <div className="hero-quick">
                <span>Accès rapide :</span>
                {themes.slice(0, 4).map((t) => (
                  <Link key={t.id} href={`/thematiques/${t.slug}`}>{t.name}</Link>
                ))}
              </div>
            )}
          </div>
          <dl className="hero-stats">
            <div><dt>groupes professionnels</dt><dd>{professions.length}</dd></div>
            <div><dt>thématiques</dt><dd>{themes.length}</dd></div>
            <div><dt>fiches de synthèse</dt><dd>{counts.total}</dd></div>
            <div><dt>travaux de recherche</dt><dd>{studies.length}</dd></div>
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head row">
            <div>
              <p className="eyebrow">Le cœur de la plateforme</p>
              <h2 className="section-title">Explorer par profession</h2>
              <p className="section-sub">
                Chaque fiche restitue les principaux résultats disponibles, leurs nuances scientifiques
                et ce que le décideur doit regarder dans son organisation.
              </p>
            </div>
            <Link href="/professions" className="link-arrow">Toutes les professions<Icon name="arrow" /></Link>
          </div>
          <div className="grid grid-4">
            {professions.map((p) => (
              <ProfessionCard key={p.id} profession={p} count={counts.byProfession[p.id]} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-head row">
            <div>
              <p className="eyebrow">Lecture croisée</p>
              <h2 className="section-title">Explorer par thématique</h2>
              <p className="section-sub">
                Ce que la recherche apprend sur un même sujet, d&apos;une profession à l&apos;autre.
              </p>
            </div>
            <Link href="/thematiques" className="link-arrow">Toutes les thématiques<Icon name="arrow" /></Link>
          </div>
          <ul className="chips">
            {themes.map((t) => (
              <li key={t.id}>
                <Link href={`/thematiques/${t.slug}`} className="chip">{t.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--teal">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">Pourquoi c&apos;est un enjeu collectif</p>
            <h2 className="section-title">Une chaîne d&apos;effets à prendre en compte</h2>
            <p className="section-sub">
              La santé des professionnels dépasse l&apos;enjeu individuel : elle affecte les équipes,
              l&apos;organisation et le fonctionnement du système de soins.
            </p>
          </div>
          <Chain />
        </div>
      </section>

      <section className="section">
        <div className="container duo">
          <div>
            <p className="eyebrow">La démarche</p>
            <h2 className="section-title">Rendre la recherche lisible et utile</h2>
            {intro && <RichText text={withoutHeroLead(intro.body)} refs={refIndex} className="prose--lg duo-text" />}
          </div>
          <div className="grid">
            <Link href="/comprendre" className="feature feature--yellow">
              <h3>Comprendre les grands enjeux</h3>
              <p>Enjeu humain, organisationnel et pour le système de soins : la lecture transversale des travaux soutenus.</p>
              <span className="card-foot"><span className="go"><Icon name="arrow" /></span>Lire la synthèse</span>
            </Link>
            <Link href="/recherches" className="feature feature--blue">
              <h3>Découvrir les recherches</h3>
              <p>{studies.length} travaux soutenus ou valorisés par la Fondation MNH : cohortes, études qualitatives, revues de littérature…</p>
              <span className="card-foot"><span className="go"><Icon name="arrow" /></span>Parcourir la bibliothèque</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
