import Link from "next/link";
import { notFound } from "next/navigation";
import DiffView from "@/components/DiffView";
import { getPublication, proposalsForPublication, getContent } from "@/lib/repo";
import type { Analysis } from "@/lib/ai";
import { runAnalysis, decideProposal } from "../../../actions";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<string, { label: string; icon: string }> = {
  deja_couvert: { label: "Déjà couvert", icon: "✅" },
  enrichissement: { label: "Enrichissement recommandé", icon: "🟠" },
  nouvelle_information: { label: "Information nouvelle", icon: "🟡" },
  nouvelle_thematique: { label: "Nouvelle thématique potentielle", icon: "🆕" },
};

export default async function PublicationDetail({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const pub = getPublication(Number(id));
  if (!pub) notFound();
  const proposals = proposalsForPublication(pub.id);
  const analysis: Analysis | null = pub.analysis ? JSON.parse(pub.analysis) : null;

  return (
    <>
      <div className="breadcrumb"><Link href="/admin/publications">Publications</Link> / #{pub.id}</div>
      <h1>{pub.title}</h1>
      <div className="study-meta">
        <span className="pill">{pub.source_type}</span>
        {pub.file_path && <span className="pill">PDF importé</span>}
        {pub.source_ref && <span className="pill">{pub.source_ref}</span>}
        <span className={`badge ${pub.statut === "integree" ? "badge-ok" : pub.statut === "analysee" ? "badge-info" : "badge-attente"}`}>{pub.statut}</span>
      </div>

      {error && <div className="suggestion" style={{ borderLeftColor: "var(--rouge)" }}><strong>Erreur :</strong> {error}</div>}

      {!analysis && (
        <form action={runAnalysis} style={{ marginTop: 18 }}>
          <input type="hidden" name="id" value={pub.id} />
          <button type="submit" className="btn btn-primary">Lancer l&apos;analyse IA</button>
          <p style={{ color: "var(--gris)", fontSize: 13, marginTop: 10 }}>
            L&apos;analyse peut prendre une à trois minutes : fiche structurée puis comparaison
            avec les fiches existantes et propositions de modifications. Rien n&apos;est publié automatiquement.
          </p>
        </form>
      )}

      {analysis && (
        <>
          <h2 style={{ fontSize: 18, marginTop: 26 }}>Fiche d&apos;analyse (brouillon IA)</h2>
          <div className="proposal">
            <table className="data" style={{ border: 0 }}>
              <tbody>
                <tr><th style={{ width: 200 }}>Titre</th><td>{analysis.titre}</td></tr>
                <tr><th>Auteurs</th><td>{analysis.auteurs}</td></tr>
                <tr><th>Organisme</th><td>{analysis.organisme}</td></tr>
                <tr><th>Date</th><td>{analysis.date}</td></tr>
                <tr><th>Type d&apos;étude</th><td>{analysis.type_etude}</td></tr>
                <tr><th>Population</th><td>{analysis.population}</td></tr>
                <tr><th>Pays / contexte</th><td>{analysis.pays_contexte}</td></tr>
                <tr><th>Méthodologie</th><td>{analysis.methodologie}</td></tr>
                <tr><th>Résumé court</th><td>{analysis.resume_court}</td></tr>
                <tr><th>Résumé détaillé</th><td>{analysis.resume_detaille}</td></tr>
                <tr><th>Principaux résultats</th><td><ul style={{ margin: 0, paddingLeft: 18 }}>{analysis.principaux_resultats.map((r, i) => <li key={i}>{r}</li>)}</ul></td></tr>
                <tr><th>Chiffres importants</th><td><ul style={{ margin: 0, paddingLeft: 18 }}>{analysis.chiffres_importants.map((r, i) => <li key={i}>{r}</li>)}</ul></td></tr>
                <tr><th>Limites</th><td><ul style={{ margin: 0, paddingLeft: 18 }}>{analysis.limites.map((r, i) => <li key={i}>{r}</li>)}</ul></td></tr>
                <tr><th>Niveau de généralisation</th><td>{analysis.niveau_generalisation}</td></tr>
                <tr><th>Résultat transversal ?</th><td>{analysis.resultat_transversal ? "Oui — transversal aux professionnels de santé" : "Non — résultats spécifiques par profession"}</td></tr>
                <tr><th>Professions concernées</th><td>{analysis.professions_concernees.join(", ") || "—"}</td></tr>
                <tr><th>Thématiques concernées</th><td>{analysis.themes_concernes.join(", ") || "—"}</td></tr>
                {analysis.professions_nouvelles.length > 0 && <tr><th>Professions absentes du site</th><td>{analysis.professions_nouvelles.join(", ")}</td></tr>}
                {analysis.themes_nouveaux.length > 0 && <tr><th>Thématiques absentes du site</th><td>{analysis.themes_nouveaux.join(", ")}</td></tr>}
              </tbody>
            </table>
          </div>

          <h2 style={{ fontSize: 18, marginTop: 26 }}>Impact potentiel sur le site — {proposals.length} proposition(s)</h2>
          {proposals.length === 0 && (
            <p style={{ color: "var(--gris)" }}>Aucune proposition : la publication n&apos;apporte pas d&apos;élément nouveau rattachable aux fiches existantes.</p>
          )}
          {proposals.map((p) => {
            const kind = KIND_LABELS[p.kind] ?? { label: p.kind, icon: "•" };
            const content = p.content_id ? getContent(p.content_id) : null;
            return (
              <div key={p.id} className="proposal" id={`prop-${p.id}`}>
                <div className="proposal-head">
                  <span style={{ fontSize: 18 }}>{kind.icon}</span>
                  <strong>{kind.label}</strong>
                  {content && (
                    <span className="pill theme-pill">{content.profession_name} → {content.display_theme_label || content.theme_name}</span>
                  )}
                  {p.titre && !content && <span className="pill theme-pill">{p.titre}</span>}
                  <span className={`badge ${p.statut === "en_attente" ? "badge-attente" : p.statut === "refuse" ? "badge-refus" : "badge-ok"}`}>
                    {p.statut === "en_attente" ? "En attente" : p.statut === "accepte" ? "Acceptée" : p.statut === "modifie" ? "Acceptée (modifiée)" : "Refusée"}
                  </span>
                </div>

                <p style={{ margin: "6px 0" }}><strong>Pourquoi ?</strong> {p.rationale}</p>
                {p.source_excerpt && (
                  <div className="quote">Extrait source : « {p.source_excerpt} »</div>
                )}

                {p.kind === "enrichissement" && p.current_text && (
                  <>
                    <p style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--gris)", margin: "16px 0 6px" }}>
                      Contenu actuel → modification proposée
                    </p>
                    <DiffView before={p.current_text} after={p.proposed_text} />
                  </>
                )}
                {p.kind !== "enrichissement" && p.proposed_text && (
                  <>
                    <p style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--gris)", margin: "16px 0 6px" }}>
                      Texte proposé
                    </p>
                    <div className="diff">{p.proposed_text}</div>
                  </>
                )}

                {p.statut === "en_attente" && p.kind !== "deja_couvert" && (
                  <form action={decideProposal}>
                    <input type="hidden" name="proposal_id" value={p.id} />
                    <details style={{ marginTop: 14 }}>
                      <summary style={{ cursor: "pointer", fontSize: 14, color: "var(--turquoise-fonce)" }}>Modifier le texte avant acceptation</summary>
                      <textarea name="edited_text" defaultValue={p.proposed_text} style={{ width: "100%", minHeight: 160, marginTop: 10, padding: 10, border: "1px solid var(--bord)", borderRadius: 8, fontFamily: "inherit", fontSize: 14 }} />
                    </details>
                    <div className="actions-row">
                      <button type="submit" name="decision" value="accepter" className="btn btn-success">Accepter</button>
                      <button type="submit" name="decision" value="refuser" className="btn btn-danger">Refuser</button>
                    </div>
                  </form>
                )}
                {p.statut === "en_attente" && p.kind === "deja_couvert" && (
                  <form action={decideProposal}>
                    <input type="hidden" name="proposal_id" value={p.id} />
                    <div className="actions-row">
                      <button type="submit" name="decision" value="refuser" className="btn btn-light">Marquer comme traité</button>
                    </div>
                  </form>
                )}
                {p.decided_at && (
                  <p style={{ color: "var(--gris)", fontSize: 12.5, marginTop: 10 }}>
                    Décision : {p.decided_by}, le {p.decided_at}
                  </p>
                )}
              </div>
            );
          })}

          <form action={runAnalysis} style={{ marginTop: 10 }}>
            <input type="hidden" name="id" value={pub.id} />
            <button type="submit" className="btn btn-ghost">Relancer l&apos;analyse IA</button>
          </form>
        </>
      )}
    </>
  );
}
