import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { pendingUsersCount } from "@/lib/repo";
import { logout } from "../actions";

export const metadata = { title: "Administration — Fondation MNH" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  const pending = user.role === "superadmin" ? pendingUsersCount() : 0;
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo/logo-mnh.svg" alt="Fondation MNH" style={{ height: 40, width: "auto", display: "block", marginBottom: 6 }} />
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
          {user.role === "superadmin" && (
            <Link href="/admin/utilisateurs">
              Utilisateurs{pending > 0 && <span className="badge badge-attente" style={{ marginLeft: 8 }}>{pending}</span>}
            </Link>
          )}
        </nav>
        <nav style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,.14)", paddingTop: 12 }}>
          <Link href="/" target="_blank">↗ Voir le site public</Link>
          <div style={{ padding: "10px 22px 2px", fontSize: 12, color: "#9fb4d0" }}>
            Connecté : {user.name || user.email}
            {user.role === "superadmin" && " · super-admin"}
          </div>
          <form action={logout}>
            <button type="submit" style={{ background: "none", border: 0, color: "#cdd9ea", padding: "6px 22px", fontSize: 14, cursor: "pointer" }}>
              Se déconnecter
            </button>
          </form>
        </nav>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
