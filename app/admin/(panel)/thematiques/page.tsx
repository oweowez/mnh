import Link from "next/link";
import AdminHead from "@/components/AdminHead";
import Icon from "@/components/Icon";
import { listThemes, contentCountByTheme } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Thématiques" };

export default async function AdminThemes() {
  const themes = await listThemes(true);
  const counts = await contentCountByTheme();
  return (
    <>
      <AdminHead
        title="Thématiques"
        sub="Taxonomie transversale : chaque contenu associe une profession à une thématique, avec un libellé d'affichage propre à la fiche si besoin."
      >
        <Link href="/admin/thematiques/new" className="btn btn-primary"><Icon name="plus" />Nouvelle thématique</Link>
      </AdminHead>
      <table className="data">
        <thead>
          <tr><th style={{ width: 60 }}>Ordre</th><th>Nom</th><th>Contenus</th><th>Statut</th><th style={{ width: 100 }}></th></tr>
        </thead>
        <tbody>
          {themes.map((t) => (
            <tr key={t.id}>
              <td>{t.ordre}</td>
              <td>
                <Link href={`/admin/thematiques/${t.id}`}>{t.name}</Link>
                <div className="cell-muted">{t.description}</div>
              </td>
              <td>{counts[t.id] ?? 0}</td>
              <td>{t.visible ? <span className="badge badge-ok">Visible</span> : <span className="badge badge-attente">Masquée</span>}</td>
              <td><Link href={`/admin/thematiques/${t.id}`}>Modifier</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
