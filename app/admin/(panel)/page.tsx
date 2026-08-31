import Link from "next/link";
import { dashboardStats, coverageGaps, weaklySourcedContents, listPublications } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const stats = dashboardStats();
  const gaps = coverageGaps();
  const weak = weaklySourcedContents();
  const toAnalyze = listPublications().filter((p) => p.statut === "nouvelle");
  return (
    <>
      <h1>Tableau de bord</h1>
      <div className="stat-row">
        <div className="stat"><b>{stats.professions}</b><span>Professions</span></div>
        <div className="stat"><b>{stats.themes}</b><span>Thématiques</span></div>
        <div className="stat"><b>{stats.contents}</b><span>Contenus</span></div>
        <div className="stat"><b>{stats.studies}</b><span>Études &amp; projets</span></div>
        <div className="stat"><b>{stats.publications}</b><span>Publications importées</span></div>
        <div className="stat"><b>{stats.pendingProposals}</b><span>Propositions IA en attente</span></div>
      </div>

      <h2 style={{ fontSize: 18 }}>Suggestions d&apos;enrichissement</h2>
      {stats.pendingProposals > 0 && (
        <div className="suggestion">
          <strong>{stats.pendingProposals} proposition(s) IA en attente de validation</strong> —{" "}
          <Link href="/admin/publications">valider dans Publications &amp; IA</Link>
        </div>
      )}
      {toAnalyze.length > 0 && (
        <div className="suggestion">
          <strong>{toAnalyze.length} publication(s) non encore analysée(s)</strong> —{" "}
          {toAnalyze.map((p) => (
            <Link key={p.id} href={`/admin/publications/${p.id}`} style={{ marginRight: 10 }}>{p.title}</Link>
          ))}
        </div>
      )}
      {gaps.length > 0 && (
        <div className="suggestion">
          <strong>Couples profession × thématique non documentés</strong> (thématiques couvertes ailleurs) :
          <ul style={{ margin: "6px 0 0" }}>
            {gaps.slice(0, 10).map((g, i) => (
              <li key={i}>{g.profession} → {g.theme}</li>
            ))}
          </ul>
        </div>
      )}
      {weak.length > 0 && (
        <div className="suggestion">
          <strong>{weak.length} contenu(s) faiblement sourcé(s)</strong> (0 ou 1 référence) — par ex.{" "}
          {weak.slice(0, 3).map((c) => (
            <Link key={c.id} href={`/admin/contenus/${c.id}`} style={{ marginRight: 10 }}>
              {c.profession_name} → {c.display_theme_label}
            </Link>
          ))}
        </div>
      )}
      {stats.pendingProposals === 0 && toAnalyze.length === 0 && gaps.length === 0 && weak.length === 0 && (
        <p style={{ color: "var(--gris)" }}>Aucune suggestion pour le moment. Ajoutez une publication pour lancer le workflow IA.</p>
      )}

      <h2 style={{ fontSize: 18, marginTop: 32 }}>Raccourcis</h2>
      <div className="actions-row">
        <Link href="/admin/publications/new" className="btn btn-primary">+ Ajouter une publication</Link>
        <Link href="/admin/contenus" className="btn btn-ghost">Gérer les contenus</Link>
        <Link href="/admin/etudes" className="btn btn-ghost">Gérer les études</Link>
      </div>
    </>
  );
}
