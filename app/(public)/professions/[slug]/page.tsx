import Link from "next/link";
import { notFound } from "next/navigation";
import ContentBlock from "@/components/ContentBlock";
import RefBadges from "@/components/RefBadges";
import { getProfession, contentsForProfession, refsMapForContents, studiesForProfession } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function ProfessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profession = await getProfession(slug);
  if (!profession || !profession.visible || profession.archived) notFound();
  const contents = await contentsForProfession(profession.id);
  const refsMap = await refsMapForContents(contents.map((c) => c.id));
  const studies = await studiesForProfession(profession.id);
  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Accueil</Link> / <Link href="/professions">Professions</Link> / {profession.name}
          </div>
          <h1>{profession.name}</h1>
          <p>{profession.short_desc}</p>
        </div>
      </div>
      <div className="container section narrow">
        <p className="section-sub">
          {contents.length} thématiques documentées. Cliquez sur chaque bloc pour lire le contenu détaillé,
          la nuance scientifique et les points de vigilance pour l&apos;établissement.
        </p>
        {contents.map((c, i) => (
          <ContentBlock key={c.id} content={c} refs={refsMap[c.id] ?? []} open={i === 0} />
        ))}
        <div style={{ marginTop: 36 }}>
          <RefBadges studies={studies} label="Travaux mobilisés pour cette profession" />
        </div>
      </div>
    </>
  );
}
