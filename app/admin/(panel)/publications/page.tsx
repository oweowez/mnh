import Link from "next/link";
import { listPublications, proposalsForPublication } from "@/lib/repo";

export const dynamic = "force-dynamic";

const STATUT_LABELS: Record<string, { label: string; cls: string }> = {
  nouvelle: { label: "À analyser", cls: "badge-attente" },
  analysee: { label: "Analysée — propositions à valider", cls: "badge-info" },
  integree: { label: "Intégrée", cls: "badge-ok" },
};

export default function AdminPublications() {
  const publications = listPublications();
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Publications &amp; analyse IA</h1>
        <Link href="/admin/publications/new" className="btn btn-primary">+ Ajouter une publication</Link>
      </div>
      <p style={{ color: "var(--gris)", maxWidth: 720 }}>
        Workflow : nouvelle publication → analyse IA → propositions d&apos;intégration → validation humaine → publication.
        L&apos;IA ne modifie jamais directement le site public.
      </p>
      {publications.length === 0 && <p>Aucune publication importée pour le moment.</p>}
      {publications.length > 0 && (
        <table className="data">
          <thead><tr><th>#</th><th>Titre</th><th>Source</th><th>Statut</th><th>Propositions</th><th>Ajoutée le</th></tr></thead>
          <tbody>
            {publications.map((p) => {
              const props = proposalsForPublication(p.id);
              const pending = props.filter((x) => x.statut === "en_attente").length;
              const st = STATUT_LABELS[p.statut] ?? { label: p.statut, cls: "badge-info" };
              return (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><Link href={`/admin/publications/${p.id}`}>{p.title}</Link></td>
                  <td>{p.source_type}{p.file_path ? " (PDF)" : ""}</td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                  <td>{props.length > 0 ? `${props.length} (${pending} en attente)` : "—"}</td>
                  <td>{p.created_at}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
