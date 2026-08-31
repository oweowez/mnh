import { requireSuperAdmin } from "@/lib/auth";
import { listUsers } from "@/lib/supabase";
import { validateUser, refuseUser, promoteUser, demoteUser, deleteUser } from "../../actions";

export const dynamic = "force-dynamic";

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "badge-attente" },
  admin: { label: "Administrateur", cls: "badge-info" },
  superadmin: { label: "Super-admin", cls: "badge-ok" },
  refuse: { label: "Refusé", cls: "badge-refus" },
};

export default async function UtilisateursPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const me = await requireSuperAdmin();
  const { error } = await searchParams;
  const users = await listUsers();
  const pending = users.filter((u) => u.role === "pending");
  const actifs = users.filter((u) => u.role === "admin" || u.role === "superadmin");
  const refuses = users.filter((u) => u.role === "refuse");

  const UserBtn = ({ action, userId, label, cls }: { action: (fd: FormData) => Promise<void>; userId: string; label: string; cls: string }) => (
    <form action={action} style={{ display: "inline" }}>
      <input type="hidden" name="user_id" value={userId} />
      <button type="submit" className={`btn ${cls}`} style={{ padding: "7px 14px", fontSize: 11.5 }}>{label}</button>
    </form>
  );

  return (
    <>
      <h1>Utilisateurs &amp; inscriptions</h1>
      {error === "soimeme" && (
        <p className="badge badge-refus">Vous ne pouvez pas modifier ou supprimer votre propre compte.</p>
      )}
      <p style={{ color: "var(--gris)", maxWidth: 720 }}>
        Les nouvelles inscriptions doivent être validées pour donner accès au tableau de bord.
        Un super-administrateur peut également promouvoir un administrateur pour lui donner accès à cette page.
      </p>

      <h2 style={{ fontSize: 18, marginTop: 28 }}>Demandes en attente {pending.length > 0 && <span className="badge badge-attente">{pending.length}</span>}</h2>
      {pending.length === 0 && <p style={{ color: "var(--gris)" }}>Aucune demande en attente.</p>}
      {pending.length > 0 && (
        <table className="data">
          <thead><tr><th>Nom</th><th>E-mail</th><th>Demandé le</th><th style={{ width: 220 }}>Actions</th></tr></thead>
          <tbody>
            {pending.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.created_at.slice(0, 16).replace("T", " ")}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <UserBtn action={validateUser} userId={u.id} label="Valider" cls="btn-success" />
                  <UserBtn action={refuseUser} userId={u.id} label="Refuser" cls="btn-danger" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ fontSize: 18, marginTop: 32 }}>Comptes actifs</h2>
      <table className="data">
        <thead><tr><th>Nom</th><th>E-mail</th><th>Rôle</th><th>Validé par</th><th style={{ width: 300 }}>Actions</th></tr></thead>
        <tbody>
          {actifs.map((u) => {
            const badge = ROLE_BADGE[u.role];
            const isMe = u.id === me.id;
            return (
              <tr key={u.id}>
                <td>{u.name}{isMe && <span style={{ color: "var(--gris)", fontSize: 12 }}> (vous)</span>}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                <td style={{ color: "var(--gris)", fontSize: 13 }}>{u.validated_by ?? "—"}</td>
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

      {refuses.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, marginTop: 32 }}>Inscriptions refusées</h2>
          <table className="data">
            <thead><tr><th>Nom</th><th>E-mail</th><th>Refusé par</th><th style={{ width: 140 }}></th></tr></thead>
            <tbody>
              {refuses.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ color: "var(--gris)", fontSize: 13 }}>{u.validated_by ?? "—"}</td>
                  <td><UserBtn action={deleteUser} userId={u.id} label="Supprimer" cls="btn-light" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
