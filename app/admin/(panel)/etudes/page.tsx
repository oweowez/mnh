import Link from "next/link";
import AdminHead from "@/components/AdminHead";
import { listStudies } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default function AdminStudies() {
  const studies = listStudies(false);
  return (
    <>
      <AdminHead title="Études & projets" sub="La bibliothèque des travaux : chaque étude est un objet indépendant, relié aux professions et thématiques via les contenus.">
        <Link href="/admin/etudes/new" className="btn btn-primary">+ Nouvelle étude</Link>
      </AdminHead>
      <table className="data">
        <thead><tr><th style={{ width: 60 }}>Réf.</th><th>Nom</th><th>Type</th><th>Date</th><th>Statut</th><th style={{ width: 100 }}></th></tr></thead>
        <tbody>
          {studies.map((s) => (
            <tr key={s.id}>
              <td>{s.ref_num ? `[${s.ref_num}]` : "—"}</td>
              <td>
                <Link href={`/admin/etudes/${s.id}`}>{s.name}</Link>
                <div className="cell-muted">{s.full_title.slice(0, 90)}{s.full_title.length > 90 ? "…" : ""}</div>
              </td>
              <td>{s.type}</td>
              <td className="cell-muted">{s.date_label}</td>
              <td><span className={`badge ${s.statut === "publie" ? "badge-ok" : s.statut === "archive" ? "badge-refus" : "badge-attente"}`}>{s.statut}</span></td>
              <td><Link href={`/admin/etudes/${s.id}`}>Modifier</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
