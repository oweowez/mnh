import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import PageHead from "@/components/PageHead";
import RichText from "@/components/RichText";
import { getStudy, professionsForStudy, themesForStudy } from "@/lib/repo";

export const dynamic = "force-dynamic";

const loadStudy = cache(getStudy);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const study = await loadStudy(slug);
  return study ? { title: study.name, description: study.full_title } : {};
}

export default async function StudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await loadStudy(slug);
  if (!study) notFound();
  const [professions, themes] = await Promise.all([professionsForStudy(study.id), themesForStudy(study.id)]);
  return (
    <>
      <PageHead
        crumbs={[{ href: "/recherches", label: "Recherches & projets" }, { label: study.name }]}
        title={study.name}
        lead={study.full_title}
      >
        <div className="page-meta">
          {study.ref_num !== null && <span className="tag tag--white">Référence [{study.ref_num}]</span>}
          {study.type && <span className="tag tag--white">{study.type}</span>}
          {study.date_label && <span className="tag tag--white">{study.date_label}</span>}
        </div>
      </PageHead>
      <section className="section">
        <div className="container split split--main">
          <article className="panel">
            <h2>Résumé</h2>
            {study.resume ? <RichText text={study.resume} /> : <p>Résumé à venir.</p>}
            {study.team && (
              <dl className="dl-inline">
                <dt>Équipe / organisme</dt>
                <dd>{study.team}</dd>
              </dl>
            )}
            {study.url && (
              <div className="actions-row">
                <a href={study.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Accéder au projet / à la publication<Icon name="external" />
                </a>
              </div>
            )}
          </article>
          <aside>
            {professions.length > 0 && (
              <div className="panel panel--soft">
                <h2>Professions concernées</h2>
                <ul className="side-list">
                  {professions.map((p) => (
                    <li key={p.id}><Link href={`/professions/${p.slug}`}>{p.name}<Icon name="arrow" /></Link></li>
                  ))}
                </ul>
              </div>
            )}
            {themes.length > 0 && (
              <div className="panel panel--soft">
                <h2>Thématiques concernées</h2>
                <ul className="side-list">
                  {themes.map((t) => (
                    <li key={t.id}><Link href={`/thematiques/${t.slug}`}>{t.name}<Icon name="arrow" /></Link></li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
