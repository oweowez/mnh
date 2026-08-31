import Link from "next/link";
import { logout } from "../actions";

export const metadata = { title: "Administration — Fondation MNH" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="brand">
          Fondation MNH
          <small style={{ display: "block", fontWeight: 400, fontSize: 11, color: "#9fb4d0" }}>Administration</small>
        </div>
        <nav>
          <Link href="/admin">Tableau de bord</Link>
          <Link href="/admin/publications">Publications &amp; IA</Link>
          <Link href="/admin/contenus">Contenus</Link>
          <Link href="/admin/professions">Professions</Link>
          <Link href="/admin/thematiques">Thématiques</Link>
          <Link href="/admin/etudes">Études &amp; projets</Link>
          <Link href="/admin/pages">Pages générales</Link>
        </nav>
        <nav style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 12 }}>
          <Link href="/" target="_blank">↗ Voir le site public</Link>
          <form action={logout}>
            <button type="submit" style={{ background: "none", border: 0, color: "#cdd9ea", padding: "9px 22px", fontSize: 14, cursor: "pointer" }}>
              Se déconnecter
            </button>
          </form>
        </nav>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
