import Link from "next/link";
import Chain from "@/components/Chain";
import { getPage, listThemes } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comprendre les enjeux — Fondation MNH" };

export default function ComprendrePage() {
  const intro = getPage("comprendre-intro");
  const enjeux = [getPage("enjeu-humain"), getPage("enjeu-organisationnel"), getPage("enjeu-systeme")].filter(Boolean);
  const expositions = getPage("expositions-multiples");
  const prudence = getPage("prudence");
  const themes = listThemes();
  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Accueil</Link> / Comprendre les enjeux</div>
          <h1>Comprendre les grands enjeux</h1>
          <p>{intro?.title}</p>
        </div>
      </div>
      <div className="container section">
        {intro && (
          <article className="doc">
            <div className="body">{intro.body}</div>
          </article>
        )}

        <h2 className="section-title" style={{ marginTop: 40 }}>Trois niveaux d&apos;enjeu</h2>
        <div className="grid grid-3" style={{ marginTop: 18 }}>
          {enjeux.map((e) => (
            <div key={e!.slug} className="card entry-card">
              <h3>{e!.title}</h3>
              <p style={{ whiteSpace: "pre-line" }}>{e!.body}</p>
            </div>
          ))}
        </div>

        <h2 className="section-title" style={{ marginTop: 48, textAlign: "center" }}>Une chaîne d&apos;effets</h2>
        <div style={{ marginTop: 20 }}>
          <Chain />
        </div>

        {expositions && (
          <>
            <h2 className="section-title" style={{ marginTop: 48 }}>Qu&apos;est-ce qui façonne la santé des professionnels ?</h2>
            <article className="doc" style={{ marginTop: 18 }}>
              <div className="body">{expositions.body.replace(/\*\*/g, "")}</div>
            </article>
          </>
        )}

        <h2 className="section-title" style={{ marginTop: 48 }}>Explorer par thématique</h2>
        <div className="grid grid-3" style={{ marginTop: 18 }}>
          {themes.map((t) => (
            <Link key={t.id} href={`/thematiques/${t.slug}`} className="card">
              <h3>{t.name}</h3>
              <p>{t.description}</p>
            </Link>
          ))}
        </div>

        {prudence && (
          <article className="doc" style={{ marginTop: 48, borderLeft: "4px solid var(--ambre)" }}>
            <h2>{prudence.title}</h2>
            <div className="body">{prudence.body}</div>
          </article>
        )}
      </div>
    </>
  );
}
