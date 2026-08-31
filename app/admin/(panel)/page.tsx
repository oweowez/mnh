import Link from "next/link";
import AdminHead from "@/components/AdminHead";
import { dashboardStats, coverageGaps, weaklySourcedContents, listPublications, recentVersions } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const stats = dashboardStats();
  const gaps = coverageGaps();
  const weak = weaklySourcedContents();
  const toAnalyze = listPublications().filter((p) => p.statut === "nouvelle");
  const versions = recentVersions(6);
  return (
    <>
      <AdminHead title="Tableau de bord" sub="Vue d'ensemble de la base de connaissances.">
        <Link href="/admin/publications/new" className="btn btn-primary">+ Ajouter une publication</Link>
      </AdminHead>

      <div className="stat-row">
        <Link href="/admin/professions" className="stat"><b>{stats.professions}</b><span>Professions</span></Link>
        <Link href="/admin/thematiques" className="stat"><b>{stats.themes}</b><span>Thématiques</span></Link>
        <Link href="/admin/contenus" className="stat"><b>{stats.contents}</b><span>Contenus</span></Link>
        <Link href="/admin/etudes" className="stat"><b>{stats.studies}</b><span>Études</span></Link>
        <Link href="/admin/publications" className="stat"><b>{stats.publications}</b><span>Publications</span></Link>
        <Link href="/admin/publications" className="stat"><b>{stats.pendingProposals}</b><span>Propositions IA</span></Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
        <section>
          <h2 style={{ fontSize: 16, margin: "0 0 14px" }}>À traiter</h2>
          {stats.pendingProposals > 0 && (
            <div className="suggestion">
              <span className="badge badge-attente" style={{ marginRight: 10 }}>{stats.pendingProposals}</span>
              proposition(s) IA en attente — <Link href="/admin/publications">valider</Link>
            </div>
          )}
          {toAnalyze.length > 0 && (
            <div className="suggestion">
              <span className="badge badge-info" style={{ marginRight: 10 }}>{toAnalyze.length}</span>
              publication(s) à analyser —{" "}
              {toAnalyze.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/admin/publications/${p.id}`} style={{ marginRight: 10 }}>{p.title}</Link>
              ))}
            </div>
          )}
          {gaps.length > 0 && (
            <div className="suggestion">
              <strong>{gaps.length} couple(s) profession × thématique non documenté(s)</strong>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18, color: "var(--gris)" }}>
                {gaps.slice(0, 5).map((g, i) => <li key={i}>{g.profession} → {g.theme}</li>)}
              </ul>
            </div>
          )}
          {weak.length > 0 && (
            <div className="suggestion">
              <strong>{weak.length} contenu(s) faiblement sourcé(s)</strong> (0 ou 1 référence) —{" "}
              <Link href="/admin/contenus">voir les contenus</Link>
            </div>
          )}
          {stats.pendingProposals === 0 && toAnalyze.length === 0 && gaps.length === 0 && weak.length === 0 && (
            <div className="empty">Rien à traiter. Ajoutez une publication pour lancer le workflow IA.</div>
          )}
        </section>

        <section>
          <h2 style={{ fontSize: 16, margin: "0 0 14px" }}>Dernières modifications</h2>
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
                      {v.changed_by}<br />{v.created_at.slice(0, 16)}
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
