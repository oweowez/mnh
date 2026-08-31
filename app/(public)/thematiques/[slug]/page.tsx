import Link from "next/link";
import { notFound } from "next/navigation";
import ContentBlock from "@/components/ContentBlock";
import RefBadges from "@/components/RefBadges";
import { getTheme, contentsForTheme, refsForContent, studiesForTheme } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function ThemePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const theme = getTheme(slug);
  if (!theme || !theme.visible) notFound();
  const contents = contentsForTheme(theme.id);
  const studies = studiesForTheme(theme.id);
  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Accueil</Link> / <Link href="/comprendre">Thématiques</Link> / {theme.name}
          </div>
          <h1>{theme.name}</h1>
          <p>{theme.description}</p>
        </div>
      </div>
      <div className="container section">
        <p className="section-sub">Ce que la recherche apprend sur cette thématique, profession par profession.</p>
        {contents.map((c) => (
          <div key={c.id}>
            <div className="eyebrow" style={{ marginTop: 20 }}>
              <Link href={`/professions/${c.profession_slug}`}>{c.profession_name}</Link>
            </div>
            <ContentBlock content={c} refs={refsForContent(c.id)} />
          </div>
        ))}
        <div style={{ marginTop: 36 }}>
          <RefBadges studies={studies} label="Travaux mobilisés pour cette thématique" />
        </div>
      </div>
    </>
  );
}
