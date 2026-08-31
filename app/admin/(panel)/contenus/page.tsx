import Link from "next/link";
import { listContents } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default function AdminContents() {
  const contents = listContents();
  return (
    <>
      <h1>Contenus profession × thématique</h1>
      <table className="data">
        <thead>
          <tr><th>Profession</th><th>Thématique</th><th>Titre</th><th>Statut</th><th></th></tr>
        </thead>
        <tbody>
          {contents.map((c) => (
            <tr key={c.id}>
              <td>{c.profession_name}</td>
              <td>{c.display_theme_label || c.theme_name}</td>
              <td>{c.titre}</td>
              <td><span className={`badge ${c.statut === "publie" ? "badge-ok" : "badge-attente"}`}>{c.statut}</span></td>
              <td><Link href={`/admin/contenus/${c.id}`}>Modifier</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
