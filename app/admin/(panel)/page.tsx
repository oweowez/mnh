import Link from "next/link";
import AdminHead from "@/components/AdminHead";
import Icon from "@/components/Icon";
import { dashboardStats, coverageGaps, weaklySourcedContents, listPublications, recentVersions } from "@/lib/repo";
import { formatDateTime } from "@/lib/labels";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tableau de bord" };

export default async function AdminDashboard() {
  const [stats, gaps, weak, publications, versions] = await Promise.all([
    dashboardStats(), coverageGaps(), weaklySourcedContents(), listPublications(), recentVersions(6),
  ]);
  const toAnalyze = publications.filter((p) => p.statut === "nouvelle");
  const nothingToDo = stats.pendingProposals === 0 && toAnalyze.length === 0 && gaps.length === 0 && weak.length === 0;
  return (
    <>
      <AdminHead title="Tableau de bord" sub="Vue d'ensemble de la base de connaissances.">
        <Link href="/admin/publications/new" className="btn btn-primary"><Icon name="plus" />Ajouter une publication</Link>
      </AdminHead>

      <div className="stat-row">
        <Link href="/admin/professions" className="stat"><b>{stats.professions}</b><span>Professions</span></Link>
        <Link href="/admin/thematiques" className="stat"><b>{stats.themes}</b><span>Thématiques</span></Link>
        <Link href="/admin/contenus" className="stat"><b>{stats.contents}</b><span>Contenus</span></Link>
        <Link href="/admin/etudes" className="stat"><b>{stats.studies}</b><span>Études</span></Link>
        <Link href="/admin/publications" className="stat"><b>{stats.publications}</b><span>Publications</span></Link>
        <Link href="/admin/publications" className={`stat${stats.pendingProposals > 0 ? " stat--alert" : ""}`}>
          <b>{stats.pendingProposals}</b><span>Propositions IA</span>
        </Link>
      </div>

      <div className="admin-cols">
        <section>
          <h2>À traiter</h2>
          {stats.pendingProposals > 0 && (
            <div className="suggestion">
              <strong>{stats.pendingProposals} proposition{stats.pendingProposals > 1 ? "s" : ""} IA en attente</strong> —{" "}
              <Link href="/admin/publications">valider</Link>
            </div>
          )}
          {toAnalyze.length > 0 && (
            <div className="suggestion">
              <strong>{toAnalyze.length} publication{toAnalyze.length > 1 ? "s" : ""} à analyser</strong>
              <ul>
                {toAnalyze.slice(0, 3).map((p) => (
                  <li key={p.id}><Link href={`/admin/publications/${p.id}`}>{p.title}</Link></li>
                ))}
              </ul>
            </div>
          )}
          {gaps.length > 0 && (
            <div className="suggestion">
              <strong>{gaps.length} couple{gaps.length > 1 ? "s" : ""} profession × thématique non documenté{gaps.length > 1 ? "s" : ""}</strong>
              <ul>
                {gaps.slice(0, 5).map((g, i) => <li key={i}>{g.profession} → {g.theme}</li>)}
              </ul>
            </div>
          )}
          {weak.length > 0 && (
            <div className="suggestion">
              <strong>{weak.length} contenu{weak.length > 1 ? "s" : ""} faiblement sourcé{weak.length > 1 ? "s" : ""}</strong> (0 ou 1 référence) —{" "}
              <Link href="/admin/contenus">voir les contenus</Link>
            </div>
          )}
          {nothingToDo && (
            <div className="empty">Rien à traiter. Ajoutez une publication pour lancer le workflow IA.</div>
          )}
        </section>

        <section>
          <h2>Dernières modifications</h2>
          {versions.length === 0 && <div className="empty">Aucune modification pour le moment.</div>}
          {versions.length > 0 && (
            <table className="data">
              <tbody>
                {versions.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link href={`/admin/contenus/${v.content_id}`}>{v.profession_name} → {v.theme_label}</Link>
                      <div className="cell-muted">{v.reason}</div>
                    </td>
                    <td className="cell-muted" style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                      {v.changed_by}<br />{formatDateTime(v.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}
