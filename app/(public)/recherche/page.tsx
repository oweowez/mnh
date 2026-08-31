import Link from "next/link";
import { search } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rechercher — Fondation MNH" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const results = q && q.trim().length >= 2 ? await search(q.trim()) : null;
  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Accueil</Link> / Recherche</div>
          <h1>Rechercher dans la base de connaissances</h1>
        </div>
      </div>
      <div className="container section narrow">
        <form className="searchbox" action="/recherche" method="get">
          <input type="text" name="q" defaultValue={q ?? ""} placeholder="Ex. : TMS, violences, sommeil, aides-soignants…" autoFocus />
          <button type="submit">Rechercher</button>
        </form>

        {results && (
          <div style={{ marginTop: 36 }}>
            {results.professions.length + results.themes.length + results.contents.length + results.studies.length === 0 && (
              <p>Aucun résultat pour « {q} ».</p>
            )}
            {results.professions.length > 0 && (
              <>
                <h2 className="section-title">Professions</h2>
                <div className="refs" style={{ marginBottom: 24 }}>
                  {results.professions.map((p) => (
                    <Link key={p.id} href={`/professions/${p.slug}`} className="ref-badge">{p.name}</Link>
                  ))}
                </div>
              </>
            )}
            {results.themes.length > 0 && (
              <>
                <h2 className="section-title">Thématiques</h2>
                <div className="refs" style={{ marginBottom: 24 }}>
                  {results.themes.map((t) => (
                    <Link key={t.id} href={`/thematiques/${t.slug}`} className="ref-badge">{t.name}</Link>
                  ))}
                </div>
              </>
            )}
            {results.contents.length > 0 && (
              <>
                <h2 className="section-title">Contenus</h2>
                {results.contents.map((c) => (
                  <Link key={c.id} href={`/professions/${c.profession_slug}#contenu-${c.id}`} className="card" style={{ marginBottom: 12 }}>
                    <div className="study-meta">
                      <span className="pill">{c.profession_name}</span>
                      <span className="pill theme-pill">{c.theme_name}</span>
                    </div>
                    <h3>{c.titre}</h3>
                    <p>{c.message_cle}</p>
                  </Link>
                ))}
              </>
            )}
            {results.studies.length > 0 && (
              <>
                <h2 className="section-title" style={{ marginTop: 24 }}>Recherches &amp; projets</h2>
                {results.studies.map((s) => (
                  <Link key={s.id} href={`/recherches/${s.slug}`} className="card" style={{ marginBottom: 12 }}>
                    <h3>{s.ref_num ? `[${s.ref_num}] ` : ""}{s.name}</h3>
                    <p>{s.full_title}</p>
                  </Link>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
