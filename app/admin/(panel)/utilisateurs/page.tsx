import Link from "next/link";
import AdminHead from "@/components/AdminHead";
import { requireSuperAdmin } from "@/lib/auth";
import { listUsers } from "@/lib/supabase";
import { validateUser, refuseUser, promoteUser, demoteUser, deleteUser } from "../../actions";

export const dynamic = "force-dynamic";

export default async function UtilisateursPage({ searchParams }: { searchParams: Promise<{ error?: string; filtre?: string }> }) {
  const me = await requireSuperAdmin();
  const { error, filtre } = await searchParams;
  const users = await listUsers();
  const pending = users.filter((u) => u.role === "pending");
  const actifs = users.filter((u) => u.role === "admin" || u.role === "superadmin");
  const refuses = users.filter((u) => u.role === "refuse");
  const tab = filtre ?? (pending.length > 0 ? "attente" : "actifs");

  const UserBtn = ({ action, userId, label, cls }: { action: (fd: FormData) => Promise<void>; userId: string; label: string; cls: string }) => (
    <form action={action} style={{ display: "inline" }}>
      <input type="hidden" name="user_id" value={userId} />
      <button type="submit" className={`btn ${cls}`} style={{ padding: "7px 14px", fontSize: 11.5 }}>{label}</button>
    </form>
  );

  return (
    <>
      <AdminHead
        title="Utilisateurs"
        sub="Les inscriptions doivent être validées pour donner accès au tableau de bord. Un super-admin peut promouvoir un administrateur pour lui donner accès à cette page."
      />
      {error === "soimeme" && <p className="badge badge-refus" style={{ marginBottom: 14 }}>Vous ne pouvez pas modifier votre propre compte.</p>}

      <div className="tabs">
        <Link href="/admin/utilisateurs?filtre=attente" className={`tab ${tab === "attente" ? "active" : ""}`}>
          En attente{pending.length > 0 && <span className="badge badge-attente">{pending.length}</span>}
        </Link>
        <Link href="/admin/utilisateurs?filtre=actifs" className={`tab ${tab === "actifs" ? "active" : ""}`}>
          Actifs<span className="badge badge-info">{actifs.length}</span>
        </Link>
        <Link href="/admin/utilisateurs?filtre=refuses" className={`tab ${tab === "refuses" ? "active" : ""}`}>
          Refusés{refuses.length > 0 && <span className="badge badge-refus">{refuses.length}</span>}
        </Link>
      </div>

      {tab === "attente" && (
        pending.length === 0 ? <div className="empty">Aucune demande en attente.</div> : (
          <table className="data">
            <thead><tr><th>Nom</th><th>E-mail</th><th>Demandé le</th><th style={{ width: 210 }}>Décision</th></tr></thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td className="cell-muted">{u.created_at.slice(0, 16).replace("T", " ")}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <UserBtn action={validateUser} userId={u.id} label="Valider" cls="btn-success" />
                    <UserBtn action={refuseUser} userId={u.id} label="Refuser" cls="btn-danger" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {tab === "actifs" && (
        <table className="data">
          <thead><tr><th>Nom</th><th>E-mail</th><th>Rôle</th><th>Validé par</th><th style={{ width: 280 }}>Actions</th></tr></thead>
          <tbody>
            {actifs.map((u) => {
              const isMe = u.id === me.id;
              return (
                <tr key={u.id}>
                  <td>{u.name}{isMe && <span className="cell-muted"> (vous)</span>}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.role === "superadmin"
                      ? <span className="badge badge-ok">Super-admin</span>
                      : <span className="badge badge-info">Administrateur</span>}
                  </td>
                  <td className="cell-muted">{u.validated_by ?? "—"}</td>
                  <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {!isMe && u.role === "admin" && <UserBtn action={promoteUser} userId={u.id} label="Passer super-admin" cls="btn-primary" />}
                    {!isMe && u.role === "superadmin" && <UserBtn action={demoteUser} userId={u.id} label="Rétrograder" cls="btn-light" />}
                    {!isMe && <UserBtn action={deleteUser} userId={u.id} label="Supprimer" cls="btn-danger" />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {tab === "refuses" && (
        refuses.length === 0 ? <div className="empty">Aucune inscription refusée.</div> : (
          <table className="data">
            <thead><tr><th>Nom</th><th>E-mail</th><th>Refusé par</th><th style={{ width: 140 }}></th></tr></thead>
            <tbody>
              {refuses.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td className="cell-muted">{u.validated_by ?? "—"}</td>
                  <td><UserBtn action={deleteUser} userId={u.id} label="Supprimer" cls="btn-light" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </>
  );
}
