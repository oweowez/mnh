import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHead from "@/components/AdminHead";
import { getPublication, proposalsForPublication, getContent } from "@/lib/repo";
import type { Analysis } from "@/lib/ai";
import { runAnalysis } from "../../../actions";
import { KIND_LABELS } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function PublicationDetail({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const pub = await getPublication(Number(id));
  if (!pub) notFound();
  const proposals = await proposalsForPublication(pub.id);
  const contentIds = [...new Set(proposals.map((p) => p.content_id).filter((x): x is number => x !== null))];
  const contentsById = new Map(
    (await Promise.all(contentIds.map((cid) => getContent(cid)))).filter(Boolean).map((c) => [c!.id, c!])
  );
  const pending = proposals.filter((p) => p.statut === "en_attente").length;
  const analysis: Analysis | null = pub.analysis ? JSON.parse(pub.analysis) : null;

  return (
    <>
      <AdminHead
        title={pub.title}
        back={{ href: "/admin/publications", label: "Publications & IA" }}
        sub={
          <>
            <span className="pill">{pub.source_type}</span>{" "}
            {pub.file_path && <span className="pill">PDF importé</span>}{" "}
            {pub.source_ref && <span className="pill">{pub.source_ref}</span>}{" "}
            <span className={`badge ${pub.statut === "integree" ? "badge-ok" : pub.statut === "analysee" ? "badge-info" : "badge-attente"}`}>
              {pub.statut === "integree" ? "Intégrée" : pub.statut === "analysee" ? "Analysée" : "À analyser"}
            </span>
          </>
        }
      >
        <form action={runAnalysis}>
          <input type="hidden" name="id" value={pub.id} />
          <button type="submit" className={`btn ${analysis ? "btn-ghost" : "btn-primary"}`}>
            {analysis ? "Relancer l'analyse" : "Lancer l'analyse IA"}
          </button>
        </form>
      </AdminHead>

      {error && <p className="alert alert-error" role="alert"><strong>Erreur :</strong> {error}</p>}

      {!analysis && (
        <div className="empty">
          Cette publication n&apos;a pas encore été analysée. L&apos;analyse prend une à trois minutes :
          fiche structurée, comparaison avec les fiches existantes puis propositions de modifications.
          Rien n&apos;est publié automatiquement.
        </div>
      )}

      {analysis && (
        <>
          <h2>Synthèse de l&apos;analyse</h2>
          <dl className="kv">
            <dt>Type d&apos;étude</dt><dd>{analysis.type_etude}</dd>
            <dt>Population</dt><dd>{analysis.population}</dd>
            <dt>Résumé</dt><dd>{analysis.resume_court}</dd>
            <dt>Généralisation</dt><dd>{analysis.niveau_generalisation}</dd>
            <dt>Portée</dt>
            <dd>{analysis.resultat_transversal ? "Résultat transversal aux professionnels de santé" : "Résultats spécifiques par profession"}</dd>
            <dt>Professions</dt><dd>{analysis.professions_concernees.join(", ") || "—"}</dd>
            <dt>Thématiques</dt><dd>{analysis.themes_concernes.join(", ") || "—"}</dd>
          </dl>

          <details className="disclosure">
            <summary>Fiche complète</summary>
            <dl className="kv" style={{ marginTop: 12 }}>
              <dt>Titre</dt><dd>{analysis.titre}</dd>
              <dt>Auteurs</dt><dd>{analysis.auteurs}</dd>
              <dt>Organisme</dt><dd>{analysis.organisme}</dd>
              <dt>Date</dt><dd>{analysis.date}</dd>
              <dt>Pays / contexte</dt><dd>{analysis.pays_contexte}</dd>
              <dt>Méthodologie</dt><dd>{analysis.methodologie}</dd>
              <dt>Résumé détaillé</dt><dd>{analysis.resume_detaille}</dd>
              <dt>Principaux résultats</dt><dd><ul>{analysis.principaux_resultats.map((r, i) => <li key={i}>{r}</li>)}</ul></dd>
              <dt>Chiffres importants</dt><dd><ul>{analysis.chiffres_importants.map((r, i) => <li key={i}>{r}</li>)}</ul></dd>
              <dt>Limites</dt><dd><ul>{analysis.limites.map((r, i) => <li key={i}>{r}</li>)}</ul></dd>
              {analysis.professions_nouvelles.length > 0 && (<><dt>Professions absentes du site</dt><dd>{analysis.professions_nouvelles.join(", ")}</dd></>)}
              {analysis.themes_nouveaux.length > 0 && (<><dt>Thématiques absentes du site</dt><dd>{analysis.themes_nouveaux.join(", ")}</dd></>)}
            </dl>
          </details>

          <h2>
            Impact sur le site — {proposals.length} proposition(s)
            {pending > 0 && <span className="badge badge-attente" style={{ marginLeft: 10 }}>{pending} en attente</span>}
          </h2>
          {proposals.length === 0 && (
            <div className="empty">Aucune proposition : la publication n&apos;apporte pas d&apos;élément nouveau rattachable aux fiches existantes.</div>
          )}
          {proposals.length > 0 && (
            <table className="data">
              <tbody>
                {proposals.map((p) => {
                  const kind = KIND_LABELS[p.kind] ?? { label: p.kind, tone: "" };
                  const content = p.content_id ? contentsById.get(p.content_id) ?? null : null;
                  return (
                    <tr key={p.id}>
                      <td style={{ width: 210 }}><span className={`kind kind--${kind.tone}`}>{kind.label}</span></td>
                      <td>
                        {content ? `${content.profession_name} → ${content.display_theme_label || content.theme_name}` : p.titre}
                        <div className="cell-muted">{p.rationale.slice(0, 110)}{p.rationale.length > 110 ? "…" : ""}</div>
                      </td>
                      <td style={{ width: 140 }}>
                        <span className={`badge ${p.statut === "en_attente" ? "badge-attente" : p.statut === "refuse" ? "badge-refus" : "badge-ok"}`}>
                          {p.statut === "en_attente" ? "En attente" : p.statut === "accepte" ? "Acceptée" : p.statut === "modifie" ? "Modifiée" : "Refusée"}
                        </span>
                      </td>
                      <td style={{ width: 110 }}>
                        <Link href={`/admin/publications/${pub.id}/proposition/${p.id}`}>Examiner</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </>
  );
}
