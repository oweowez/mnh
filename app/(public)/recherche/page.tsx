import Link from "next/link";
import Icon from "@/components/Icon";
import PageHead from "@/components/PageHead";
import ProfessionCard from "@/components/ProfessionCard";
import { renderInline } from "@/components/RichText";
import { listProfessions, listThemes, search, studyRefIndex } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rechercher" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const hasQuery = query.length >= 2;
  const [results, professions, themes, refIndex] = await Promise.all([
    hasQuery ? search(query) : null, listProfessions(), listThemes(), studyRefIndex(),
  ]);
  const total = results
    ? results.professions.length + results.themes.length + results.contents.length + results.studies.length
    : 0;
  return (
    <>
      <PageHead crumbs={[{ label: "Recherche" }]} title="Rechercher dans la base de connaissances">
        <form className="search" action="/recherche" method="get" role="search">
          <Icon name="search" />
          <input
            type="search" name="q" defaultValue={query}
            placeholder="TMS, violences, sommeil, aides-soignants…"
            aria-label="Votre recherche" autoFocus={!hasQuery}
          />
          <button type="submit" className="btn btn-primary">Rechercher</button>
        </form>
      </PageHead>

      <section className="section">
        <div className="container results">
          {!results && (
            <>
              {query.length === 1 && <p className="results-summary">Saisissez au moins deux caractères.</p>}
              <div className="results-group">
                <h2>Par profession</h2>
                <ul className="chips">
                  {professions.map((p) => (
                    <li key={p.id}><Link href={`/professions/${p.slug}`} className="chip">{p.name}</Link></li>
                  ))}
                </ul>
              </div>
              <div className="results-group">
                <h2>Par thématique</h2>
                <ul className="chips">
                  {themes.map((t) => (
                    <li key={t.id}><Link href={`/thematiques/${t.slug}`} className="chip">{t.name}</Link></li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {results && total === 0 && (
            <div className="empty-state">
              <h2>Aucun résultat pour « {query} »</h2>
              <p>Essayez un terme plus général, ou parcourez la base par thématique.</p>
              <ul className="chips">
                {themes.map((t) => (
                  <li key={t.id}><Link href={`/thematiques/${t.slug}`} className="chip">{t.name}</Link></li>
                ))}
              </ul>
            </div>
          )}

          {results && total > 0 && (
            <>
              <p className="results-summary">
                {total} résultat{total > 1 ? "s" : ""} pour « {query} »
              </p>

              {results.professions.length > 0 && (
                <div className="results-group">
                  <h2>Professions <span className="count">{results.professions.length}</span></h2>
                  <div className="grid grid-2">
                    {results.professions.map((p) => <ProfessionCard key={p.id} profession={p} />)}
                  </div>
                </div>
              )}

              {results.themes.length > 0 && (
                <div className="results-group">
                  <h2>Thématiques <span className="count">{results.themes.length}</span></h2>
                  <ul className="chips">
                    {results.themes.map((t) => (
                      <li key={t.id}><Link href={`/thematiques/${t.slug}`} className="chip">{t.name}</Link></li>
                    ))}
                  </ul>
                </div>
              )}

              {results.contents.length > 0 && (
                <div className="results-group">
                  <h2>Fiches <span className="count">{results.contents.length}</span></h2>
                  <div className="stack">
                    {results.contents.map((c) => (
                      <Link key={c.id} href={`/professions/${c.profession_slug}#contenu-${c.id}`} className="card">
                        <div className="tags">
                          <span className="tag tag--blue">{c.profession_name}</span>
                          <span className="tag tag--theme">{c.display_theme_label || c.theme_name}</span>
                        </div>
                        <h3>{c.titre}</h3>
                        {/* Pas de liens imbriqués : les renvois [n] restent en texte dans une carte cliquable. */}
                        <p>{renderInline(c.message_cle, {})}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.studies.length > 0 && (
                <div className="results-group">
                  <h2>Recherches &amp; projets <span className="count">{results.studies.length}</span></h2>
                  <div className="stack">
                    {results.studies.map((s) => (
                      <Link key={s.id} href={`/recherches/${s.slug}`} className="card study-card">
                        {s.ref_num !== null && <span className="study-num">{s.ref_num}</span>}
                        <div>
                          <h3>{s.name}</h3>
                          <p>{s.full_title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
