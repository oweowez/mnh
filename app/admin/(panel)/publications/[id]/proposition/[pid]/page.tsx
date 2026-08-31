import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHead from "@/components/AdminHead";
import DiffView from "@/components/DiffView";
import { getPublication, getProposal, getContent } from "@/lib/repo";
import { decideProposal } from "../../../../../actions";
import { KIND_LABELS } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ProposalPage({ params }: { params: Promise<{ id: string; pid: string }> }) {
  const { id, pid } = await params;
  const pub = getPublication(Number(id));
  const proposal = getProposal(Number(pid));
  if (!pub || !proposal || proposal.publication_id !== pub.id) notFound();
  const kind = KIND_LABELS[proposal.kind] ?? { label: proposal.kind, icon: "•" };
  const content = proposal.content_id ? getContent(proposal.content_id) : null;
  const decided = proposal.statut !== "en_attente";

  return (
    <>
      <AdminHead
        title={<>{kind.icon} {kind.label}{content && <> — {content.profession_name} → {content.display_theme_label || content.theme_name}</>}{!content && proposal.titre && <> — {proposal.titre}</>}</>}
        back={{ href: `/admin/publications/${pub.id}`, label: pub.title }}
        sub={
          <span className={`badge ${proposal.statut === "en_attente" ? "badge-attente" : proposal.statut === "refuse" ? "badge-refus" : "badge-ok"}`}>
            {proposal.statut === "en_attente" ? "En attente de décision" : proposal.statut === "accepte" ? "Acceptée" : proposal.statut === "modifie" ? "Acceptée (modifiée)" : "Refusée"}
          </span>
        }
      >
        {content && (
          <Link href={`/admin/contenus/${content.id}`} className="btn btn-ghost">Ouvrir le contenu</Link>
        )}
      </AdminHead>

      <div className="form-card" style={{ marginBottom: 20 }}>
        <p style={{ margin: "0 0 8px" }}><strong>Pourquoi ?</strong> {proposal.rationale}</p>
        {proposal.source_excerpt && (
          <div className="quote" style={{ margin: "12px 0 0" }}>Extrait source : « {proposal.source_excerpt} »</div>
        )}
      </div>

      {proposal.kind === "enrichissement" && proposal.current_text && (
        <>
          <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--gris)", margin: "0 0 10px" }}>
            Contenu actuel → modification proposée
          </h2>
          <DiffView before={proposal.current_text} after={proposal.proposed_text} />
        </>
      )}
      {proposal.kind !== "enrichissement" && proposal.proposed_text && (
        <>
          <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--gris)", margin: "0 0 10px" }}>
            Texte proposé
          </h2>
          <div className="diff">{proposal.proposed_text}</div>
        </>
      )}

      {!decided && proposal.kind !== "deja_couvert" && (
        <form action={decideProposal} style={{ marginTop: 22 }}>
          <input type="hidden" name="proposal_id" value={proposal.id} />
          <details>
            <summary style={{ cursor: "pointer", fontSize: 14, color: "var(--turquoise-fonce)", fontWeight: 600 }}>
              Modifier le texte avant acceptation
            </summary>
            <textarea
              name="edited_text"
              defaultValue={proposal.proposed_text}
              style={{ width: "100%", minHeight: 180, marginTop: 10, padding: 12, border: "1px solid var(--bord)", fontFamily: "inherit", fontSize: 14 }}
            />
          </details>
          <div className="actions-row">
            <button type="submit" name="decision" value="accepter" className="btn btn-success">Accepter</button>
            <button type="submit" name="decision" value="refuser" className="btn btn-danger">Refuser</button>
          </div>
        </form>
      )}
      {!decided && proposal.kind === "deja_couvert" && (
        <form action={decideProposal} style={{ marginTop: 22 }}>
          <input type="hidden" name="proposal_id" value={proposal.id} />
          <div className="actions-row">
            <button type="submit" name="decision" value="refuser" className="btn btn-light">Marquer comme traité</button>
          </div>
        </form>
      )}
      {proposal.decided_at && (
        <p style={{ color: "var(--gris)", fontSize: 13, marginTop: 18 }}>
          Décision : {proposal.decided_by}, le {proposal.decided_at}
        </p>
      )}
    </>
  );
}
