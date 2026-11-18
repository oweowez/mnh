import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHead from "@/components/AdminHead";
import DiffView from "@/components/DiffView";
import { getPublication, getProposal, getContent } from "@/lib/repo";
import { decideProposal } from "../../../../../actions";
import { KIND_LABELS, formatDateTime } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ProposalPage({ params }: { params: Promise<{ id: string; pid: string }> }) {
  const { id, pid } = await params;
  const pub = await getPublication(Number(id));
  const proposal = await getProposal(Number(pid));
  if (!pub || !proposal || proposal.publication_id !== pub.id) notFound();
  const kind = KIND_LABELS[proposal.kind] ?? { label: proposal.kind, tone: "" };
  const content = proposal.content_id ? await getContent(proposal.content_id) : null;
  const decided = proposal.statut !== "en_attente";

  return (
    <>
      <AdminHead
        title={<>{kind.label}{content && <> — {content.profession_name} → {content.display_theme_label || content.theme_name}</>}{!content && proposal.titre && <> — {proposal.titre}</>}</>}
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
          <p className="label-caps">Contenu actuel → modification proposée</p>
          <DiffView before={proposal.current_text} after={proposal.proposed_text} />
        </>
      )}
      {proposal.kind !== "enrichissement" && proposal.proposed_text && (
        <>
          <p className="label-caps">Texte proposé</p>
          <div className="diff">{proposal.proposed_text}</div>
        </>
      )}

      {!decided && proposal.kind !== "deja_couvert" && (
        <form action={decideProposal} style={{ marginTop: 22 }}>
          <input type="hidden" name="proposal_id" value={proposal.id} />
          <details className="disclosure">
            <summary>Modifier le texte avant acceptation</summary>
            <textarea
              name="edited_text"
              defaultValue={proposal.proposed_text}
              className="field"
              aria-label="Texte modifié"
              style={{ minHeight: 180, marginTop: 10 }}
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
        <p className="hint" style={{ marginTop: 18 }}>
          Décision : {proposal.decided_by}, le {formatDateTime(proposal.decided_at)}
        </p>
      )}
    </>
  );
}
