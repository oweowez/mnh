import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentBlock from "@/components/ContentBlock";
import FicheNav from "@/components/FicheNav";
import PageHead from "@/components/PageHead";
import RefBadges from "@/components/RefBadges";
import { getProfession, contentsForProfession, refsMapForContents, studiesForProfession, studyRefIndex } from "@/lib/repo";

export const dynamic = "force-dynamic";

const loadProfession = cache(getProfession);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const profession = await loadProfession(slug);
  return profession ? { title: profession.name, description: profession.short_desc } : {};
}

export default async function ProfessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profession = await loadProfession(slug);
  if (!profession || !profession.visible || profession.archived) notFound();
  const [contents, studies, refIndex] = await Promise.all([
    contentsForProfession(profession.id), studiesForProfession(profession.id), studyRefIndex(),
  ]);
  const refsMap = await refsMapForContents(contents.map((c) => c.id));
  return (
    <>
      <PageHead
        crumbs={[{ href: "/professions", label: "Professions" }, { label: profession.name }]}
        title={profession.name}
        lead={profession.short_desc}
      >
        <div className="page-meta">
          <span className="tag tag--white">{contents.length} thématique{contents.length > 1 ? "s" : ""} documentée{contents.length > 1 ? "s" : ""}</span>
          {studies.length > 0 && <span className="tag tag--white">{studies.length > 1 ? `${studies.length} travaux mobilisés` : "1 travail mobilisé"}</span>}
        </div>
      </PageHead>
      <section className="section">
        <div className="container layout-aside">
          <aside className="aside-sticky">
            <FicheNav
              title="Dans cette fiche"
              items={contents.map((c) => ({ id: `contenu-${c.id}`, label: c.display_theme_label || c.theme_name }))}
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
                <h2>Fiche en cours de rédaction</h2>
                <p>Aucun contenu n&apos;est encore publié pour cette profession.</p>
              </div>
            ) : (
              <>
                <p className="fiches-intro">
                  L&apos;essentiel de chaque thématique est visible d&apos;un coup d&apos;œil. Dépliez un bloc pour lire le détail,
                  la nuance scientifique et les points de vigilance pour l&apos;établissement.
                </p>
                {contents.map((c, i) => (
                  <ContentBlock key={c.id} content={c} refs={refsMap[c.id] ?? []} refIndex={refIndex} open={i === 0} />
                ))}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
