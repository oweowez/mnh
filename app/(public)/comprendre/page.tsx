import Link from "next/link";
import Chain from "@/components/Chain";
import Icon from "@/components/Icon";
import PageHead from "@/components/PageHead";
import RichText, { normalizeText, renderInline } from "@/components/RichText";
import { getPage, listThemes, studyRefIndex } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comprendre les enjeux" };

/** Découpe le corps « expositions multiples » : intro + dimensions « **Titre.** texte ». */
function splitDimensions(body: string): { intro: string[]; dimensions: Array<{ title: string; text: string }> } {
  const intro: string[] = [];
  const dimensions: Array<{ title: string; text: string }> = [];
  for (const para of normalizeText(body).split(/\n\n+/)) {
    const m = para.match(/^\*\*(.+?)\.?\*\*\s*(.*)$/s);
    if (m) dimensions.push({ title: m[1], text: m[2] });
    else intro.push(para);
  }
  return { intro, dimensions };
}

export default async function ComprendrePage() {
  const [intro, humain, organisationnel, systeme, expositions, prudence, themes, refIndex] = await Promise.all([
    getPage("comprendre-intro"), getPage("enjeu-humain"), getPage("enjeu-organisationnel"), getPage("enjeu-systeme"),
    getPage("expositions-multiples"), getPage("prudence"), listThemes(), studyRefIndex(),
  ]);
  const enjeux = [humain, organisationnel, systeme].filter((e) => e !== undefined);
  const dims = expositions ? splitDimensions(expositions.body) : null;
  return (
    <>
      <PageHead
        crumbs={[{ label: "Comprendre les enjeux" }]}
        title="Comprendre les grands enjeux"
        lead={intro?.title ?? "Prendre soin des soignants : un enjeu de santé publique et de fonctionnement du système de soins."}
      />

      {intro && (
        <section className="section">
          <div className="container">
            <RichText text={intro.body} refs={refIndex} className="prose--lg" />
          </div>
        </section>
      )}

      {enjeux.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Ce que montrent les travaux</p>
              <h2 className="section-title">Trois niveaux d&apos;enjeu</h2>
            </div>
            <div className="grid grid-3 numbered">
              {enjeux.map((e) => (
                <article key={e.slug} className="card">
                  <h3>{e.title}</h3>
                  <RichText text={e.body} refs={refIndex} />
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section--teal">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">Pourquoi c&apos;est un enjeu collectif</p>
            <h2 className="section-title">Une chaîne d&apos;effets</h2>
            <p className="section-sub">
              Des expositions professionnelles jusqu&apos;à la qualité et la continuité des soins.
            </p>
          </div>
          <Chain />
        </div>
      </section>

      {dims && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">L&apos;exposome professionnel</p>
              <h2 className="section-title">{expositions!.title}</h2>
              {dims.intro.map((p, i) => (
                <p key={i} className="section-sub">{renderInline(p, refIndex)}</p>
              ))}
            </div>
            <div className="grid grid-3">
              {dims.dimensions.map((d) => (
                <article key={d.title} className="card">
                  <h3>{d.title}</h3>
                  <p>{renderInline(d.text, refIndex)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {prudence && (
        <section className="section section--yellow">
          <div className="container split">
            <div>
              <p className="eyebrow">À garder en tête</p>
              <h2 className="section-title">{prudence.title}</h2>
            </div>
            <RichText text={prudence.body} refs={refIndex} />
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="section-head row">
            <div>
              <p className="eyebrow">Approfondir</p>
              <h2 className="section-title">Explorer par thématique</h2>
            </div>
            <Link href="/thematiques" className="link-arrow">Toutes les thématiques<Icon name="arrow" /></Link>
          </div>
          <ul className="chips">
            {themes.map((t) => (
              <li key={t.id}><Link href={`/thematiques/${t.slug}`} className="chip">{t.name}</Link></li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
