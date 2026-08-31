import Link from "next/link";
import Chain from "@/components/Chain";
import { getPage, listThemes } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comprendre les enjeux — Fondation MNH" };

/** Découpe le corps « expositions multiples » : intro + dimensions « **Titre.** texte ». */
function splitDimensions(body: string): { intro: string[]; dimensions: Array<{ title: string; text: string }> } {
  const intro: string[] = [];
  const dimensions: Array<{ title: string; text: string }> = [];
  for (const para of body.split(/\n\n+/)) {
    const m = para.match(/^\*\*(.+?)\.?\*\*\s*(.*)$/s);
    if (m) dimensions.push({ title: m[1], text: m[2] });
    else intro.push(para);
  }
  return { intro, dimensions };
}

export default async function ComprendrePage() {
  const intro = await getPage("comprendre-intro");
  const enjeux = (await Promise.all([getPage("enjeu-humain"), getPage("enjeu-organisationnel"), getPage("enjeu-systeme")])).filter(Boolean);
  const expositions = await getPage("expositions-multiples");
  const prudence = await getPage("prudence");
  const themes = await listThemes();
  const dims = expositions ? splitDimensions(expositions.body) : null;
  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Accueil</Link> / Comprendre les enjeux</div>
          <h1>Comprendre les grands enjeux</h1>
          <p>Prendre soin des soignants : un enjeu de santé publique et de fonctionnement du système de soins.</p>
        </div>
      </div>

      {intro && (
        <section className="section">
          <div className="container narrow">
            <div className="prose" style={{ whiteSpace: "pre-line", fontSize: 16.5 }}>{intro.body}</div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="eyebrow">Ce que montrent les travaux</div>
          <h2 className="section-title title-bar">Trois niveaux d&apos;enjeu</h2>
          <div className="grid grid-3" style={{ marginTop: 26 }}>
            {enjeux.map((e) => (
              <div key={e!.slug} className="card entry-card">
                <h3>{e!.title}</h3>
                <p style={{ whiteSpace: "pre-line" }}>{e!.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="band band-teal">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: "center" }}>Une chaîne d&apos;effets</h2>
          <p className="section-sub" style={{ margin: "0 auto 32px", textAlign: "center" }}>
            Des expositions professionnelles jusqu&apos;à la qualité et la continuité des soins.
          </p>
          <Chain />
        </div>
      </div>

      {dims && (
        <section className="section">
          <div className="container">
            <div className="eyebrow">L&apos;exposome professionnel</div>
            <h2 className="section-title title-bar">Qu&apos;est-ce qui façonne la santé des professionnels ?</h2>
            {dims.intro.map((p, i) => (
              <p key={i} className="section-sub" style={{ maxWidth: 780 }}>{p}</p>
            ))}
            <div className="grid grid-3" style={{ marginTop: 10 }}>
              {dims.dimensions.map((d) => (
                <div key={d.title} className="card">
                  <h3 style={{ fontSize: 15.5 }}>{d.title}</h3>
                  <p>{d.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="eyebrow">Approfondir</div>
          <h2 className="section-title title-bar">Explorer par thématique</h2>
          <div className="grid grid-3" style={{ marginTop: 26 }}>
            {themes.map((t) => (
              <Link key={t.id} href={`/thematiques/${t.slug}`} className="card">
                <h3 style={{ fontSize: 15.5 }}>{t.name}</h3>
                <p>{t.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {prudence && (
        <div className="band band-yellow">
          <div className="container narrow">
            <h2 className="section-title title-bar">{prudence.title}</h2>
            <div className="prose" style={{ whiteSpace: "pre-line", marginTop: 16 }}>{prudence.body}</div>
          </div>
        </div>
      )}
    </>
  );
}
