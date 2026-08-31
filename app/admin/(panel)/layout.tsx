import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { pendingUsersCount } from "@/lib/supabase";
import AdminNav from "@/components/AdminNav";
import { logout } from "../actions";

export const metadata = { title: "Administration — Fondation MNH" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  const pending = user.role === "superadmin" ? await pendingUsersCount() : 0;
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo/logo-mnh.svg" alt="Fondation MNH" style={{ height: 40, width: "auto", display: "block", marginBottom: 6 }} />
          <small style={{ display: "block", fontWeight: 400, fontSize: 11, color: "#9fb4d0" }}>Administration</small>
        </div>
        <AdminNav role={user.role} pending={pending} />
        <div className="admin-foot">
          <nav>
            <Link href="/" target="_blank">↗ Voir le site public</Link>
          </nav>
          <div style={{ padding: "10px 22px 2px", fontSize: 12, color: "#9fb4d0" }}>
            {user.name || user.email}
            {user.role === "superadmin" && " · super-admin"}
          </div>
          <form action={logout}>
            <button type="submit" style={{ background: "none", border: 0, color: "#cdd9ea", padding: "6px 22px", fontSize: 14, cursor: "pointer" }}>
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-inner">{children}</div>
      </main>
    </div>
  );
}
