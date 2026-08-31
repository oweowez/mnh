import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudy, professionsForStudy, themesForStudy } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function StudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await getStudy(slug);
  if (!study) notFound();
  const professions = await professionsForStudy(study.id);
  const themes = await themesForStudy(study.id);
  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Accueil</Link> / <Link href="/recherches">Recherches &amp; projets</Link> / {study.name}
          </div>
          <h1>{study.ref_num ? `[${study.ref_num}] ` : ""}{study.name}</h1>
          <p>{study.full_title}</p>
        </div>
      </div>
      <div className="container section narrow">
        <div className="study-meta">
          <span className="pill theme-pill">{study.type}</span>
          {study.date_label && <span className="pill">{study.date_label}</span>}
        </div>
        <article className="doc">
          <h2>Résumé</h2>
          <div className="body">{study.resume}</div>
          {study.team && (
            <p style={{ marginTop: 18, color: "var(--gris)", fontSize: 14 }}>
              <strong>Équipe / organisme :</strong> {study.team}
            </p>
          )}
          {study.url && (
            <p><a href={study.url} target="_blank" rel="noopener noreferrer">Accéder au projet / à la publication ↗</a></p>
          )}
        </article>
        {professions.length > 0 && (
          <article className="doc">
            <h2>Professions concernées</h2>
            <div className="refs">
              {professions.map((p) => (
                <Link key={p.id} href={`/professions/${p.slug}`} className="ref-badge">{p.name}</Link>
              ))}
            </div>
          </article>
        )}
        {themes.length > 0 && (
          <article className="doc">
            <h2>Thématiques concernées</h2>
            <div className="refs">
              {themes.map((t) => (
                <Link key={t.id} href={`/thematiques/${t.slug}`} className="ref-badge">{t.name}</Link>
              ))}
            </div>
          </article>
        )}
      </div>
    </>
  );
}
