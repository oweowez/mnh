import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentBlock from "@/components/ContentBlock";
import FicheNav from "@/components/FicheNav";
import PageHead from "@/components/PageHead";
import RefBadges from "@/components/RefBadges";
import { getTheme, contentsForTheme, refsMapForContents, studiesForTheme, studyRefIndex } from "@/lib/repo";

export const dynamic = "force-dynamic";

const loadTheme = cache(getTheme);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const theme = await loadTheme(slug);
  return theme ? { title: theme.name, description: theme.description } : {};
}

export default async function ThemePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const theme = await loadTheme(slug);
  if (!theme || !theme.visible) notFound();
  const [contents, studies, refIndex] = await Promise.all([
    contentsForTheme(theme.id), studiesForTheme(theme.id), studyRefIndex(),
  ]);
  const refsMap = await refsMapForContents(contents.map((c) => c.id));
  const nbProfessions = new Set(contents.map((c) => c.profession_id)).size;
  return (
    <>
      <PageHead
        crumbs={[{ href: "/thematiques", label: "Thématiques" }, { label: theme.name }]}
        title={theme.name}
        lead={theme.description}
      >
        <div className="page-meta">
          <span className="tag tag--white">{nbProfessions} profession{nbProfessions > 1 ? "s" : ""} documentée{nbProfessions > 1 ? "s" : ""}</span>
          {studies.length > 0 && <span className="tag tag--white">{studies.length > 1 ? `${studies.length} travaux mobilisés` : "1 travail mobilisé"}</span>}
        </div>
      </PageHead>
      <section className="section">
        <div className="container layout-aside">
          <aside className="aside-sticky">
            <FicheNav
              title="Par profession"
              items={contents.map((c) => ({ id: `contenu-${c.id}`, label: c.profession_name }))}
            />
            {studies.length > 0 && (
              <div className="aside-block">
                <p className="toc-title">Travaux mobilisés</p>
                <RefBadges studies={studies} label={null} />
              </div>
            )}
          </aside>
          <div>
            {contents.length === 0 ? (
              <div className="empty-state">
                <h2>Thématique en cours de rédaction</h2>
                <p>Aucun contenu n&apos;est encore publié sur cette thématique.</p>
              </div>
            ) : (
              <>
                <p className="fiches-intro">
                  Ce que la recherche apprend sur cette thématique, profession par profession.
                </p>
                {contents.map((c, i) => (
                  <ContentBlock
                    key={c.id}
                    content={c}
                    refs={refsMap[c.id] ?? []}
                    refIndex={refIndex}
                    open={i === 0}
                    tag={c.profession_name}
                    more={{ href: `/professions/${c.profession_slug}`, label: `Fiche ${c.profession_name}` }}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
