import Link from "next/link";
import AdminHead from "@/components/AdminHead";
import { listContents, listProfessions } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function AdminContents({ searchParams }: { searchParams: Promise<{ profession?: string }> }) {
  const { profession } = await searchParams;
  const professions = await listProfessions(true);
  const all = await listContents();
  const contents = profession ? all.filter((c) => c.profession_slug === profession) : all;
  return (
    <>
      <AdminHead title="Contenus" sub="Un contenu = un bloc profession × thématique du site public. Filtrez par profession pour naviguer.">
        <Link href={profession ? `/admin/contenus/new?profession=${profession}` : "/admin/contenus/new"} className="btn btn-primary">+ Nouveau contenu</Link>
      </AdminHead>
      <div className="tabs">
        <Link href="/admin/contenus" className={`tab ${!profession ? "active" : ""}`}>Toutes ({all.length})</Link>
        {professions.map((p) => (
          <Link key={p.id} href={`/admin/contenus?profession=${p.slug}`} className={`tab ${profession === p.slug ? "active" : ""}`}>
            {p.name}
          </Link>
        ))}
      </div>
      <table className="data">
        <thead>
          <tr>{!profession && <th>Profession</th>}<th>Thématique</th><th>Titre</th><th>Statut</th><th style={{ width: 100 }}></th></tr>
        </thead>
        <tbody>
          {contents.map((c) => (
            <tr key={c.id}>
              {!profession && <td>{c.profession_name}</td>}
              <td><span className="pill theme-pill">{c.display_theme_label || c.theme_name}</span></td>
              <td><Link href={`/admin/contenus/${c.id}`}>{c.titre}</Link></td>
              <td>{c.statut === "publie" ? <span className="badge badge-ok">Publié</span> : <span className="badge badge-attente">Brouillon</span>}</td>
              <td><Link href={`/admin/contenus/${c.id}`}>Modifier</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
