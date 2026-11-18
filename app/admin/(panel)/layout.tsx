import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { pendingUsersCount } from "@/lib/supabase";
import AdminNav from "@/components/AdminNav";
import Icon from "@/components/Icon";
import { logout } from "../actions";

export const metadata = { title: { default: "Administration", template: "%s — Administration MNH" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  const pending = user.role === "superadmin" ? await pendingUsersCount() : 0;
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link href="/admin" className="brand" aria-label="Administration — tableau de bord">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo/logo-mnh.svg" alt="Fondation MNH" width={161} height={38} />
          <small>Administration</small>
        </Link>
        <AdminNav role={user.role} pending={pending} />
        <div className="admin-foot">
          <nav>
            <Link href="/" target="_blank">Voir le site public<Icon name="external" /></Link>
          </nav>
          <div className="admin-user">
            <strong>{user.name || user.email}</strong>
            {user.role === "superadmin" ? "Super-administrateur" : "Administrateur"}
          </div>
          <form action={logout}>
            <button type="submit" className="admin-logout">Se déconnecter</button>
          </form>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-inner">{children}</div>
      </main>
    </div>
  );
}
