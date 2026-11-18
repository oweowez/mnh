import Link from "next/link";
import AdminHead from "@/components/AdminHead";
import Icon from "@/components/Icon";
import { listPublications, listProposals } from "@/lib/repo";
import { formatDateTime } from "@/lib/labels";

export const dynamic = "force-dynamic";
export const metadata = { title: "Publications & IA" };

const STATUT: Record<string, { label: string; cls: string }> = {
  nouvelle: { label: "À analyser", cls: "badge-attente" },
  analysee: { label: "Propositions à valider", cls: "badge-info" },
  integree: { label: "Intégrée", cls: "badge-ok" },
};

export default async function AdminPublications() {
  const publications = await listPublications();
  const allProposals = await listProposals();
  return (
    <>
      <AdminHead
        title="Publications & IA"
        sub="Workflow : nouvelle publication → analyse IA → propositions d'intégration → validation humaine. L'IA ne modifie jamais directement le site public."
      >
        <Link href="/admin/publications/new" className="btn btn-primary"><Icon name="plus" />Ajouter une publication</Link>
      </AdminHead>
      {publications.length === 0 && (
        <div className="empty">
          Aucune publication importée. Commencez par <Link href="/admin/publications/new">ajouter une publication</Link> —
          lien, DOI, PDF ou texte — puis lancez l&apos;analyse IA.
        </div>
      )}
      {publications.length > 0 && (
        <table className="data">
          <thead><tr><th>Titre</th><th>Source</th><th>Statut</th><th>Propositions</th><th className="cell-muted">Ajoutée le</th></tr></thead>
          <tbody>
            {publications.map((p) => {
              const props = allProposals.filter((x) => x.publication_id === p.id);
              const pending = props.filter((x) => x.statut === "en_attente").length;
              const st = STATUT[p.statut] ?? { label: p.statut, cls: "badge-info" };
              return (
                <tr key={p.id}>
                  <td><Link href={`/admin/publications/${p.id}`}>{p.title}</Link></td>
                  <td className="cell-muted">{p.source_type}{p.file_path ? " · PDF" : ""}</td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                  <td>{props.length > 0 ? <>{props.length}{pending > 0 && <span className="badge badge-attente" style={{ marginLeft: 8 }}>{pending} en attente</span>}</> : "—"}</td>
                  <td className="cell-muted">{formatDateTime(p.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
