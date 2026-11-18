import Link from "next/link";
import AdminHead from "@/components/AdminHead";
import Icon from "@/components/Icon";
import { listProfessions, contentCountByProfession } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Professions" };

export default async function AdminProfessions() {
  const professions = await listProfessions(true);
  const counts = await contentCountByProfession();
  return (
    <>
      <AdminHead title="Professions" sub="Les groupes professionnels du site public. L'ordre détermine leur position d'affichage.">
        <Link href="/admin/professions/new" className="btn btn-primary"><Icon name="plus" />Nouvelle profession</Link>
      </AdminHead>
      <table className="data">
        <thead>
          <tr><th style={{ width: 60 }}>Ordre</th><th>Nom</th><th>Contenus</th><th>Statut</th><th style={{ width: 100 }}></th></tr>
        </thead>
        <tbody>
          {professions.map((p) => (
            <tr key={p.id}>
              <td>{p.ordre}</td>
              <td>
                <Link href={`/admin/professions/${p.id}`}>{p.name}</Link>
                <div className="cell-muted">/{p.slug}</div>
              </td>
              <td>{counts[p.id] ?? 0}</td>
              <td>
                {p.archived ? <span className="badge badge-refus">Archivée</span>
                  : p.visible ? <span className="badge badge-ok">Visible</span>
                  : <span className="badge badge-attente">Masquée</span>}
              </td>
              <td><Link href={`/admin/professions/${p.id}`}>Modifier</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
