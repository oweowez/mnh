import Link from "next/link";
import { login } from "../actions";

export const metadata = { title: "Connexion — Administration MNH" };

const MESSAGES: Record<string, { text: string; ok?: boolean }> = {
  identifiants: { text: "E-mail ou mot de passe incorrect." },
  attente: { text: "Votre compte est en attente de validation par un super-administrateur." },
  refuse: { text: "Votre inscription n'a pas été validée. Contactez un administrateur." },
};

export default async function LoginPage({
  searchParams,
}: { searchParams: Promise<{ error?: string; registered?: string }> }) {
  const { error, registered } = await searchParams;
  const msg = error ? MESSAGES[error] ?? { text: "Erreur de connexion." } : null;
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--marine)" }}>
      <form action={login} className="form" style={{ background: "#fff", borderRadius: 8, padding: "36px 40px", width: 400 }}>
        <div style={{ textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo/logoFondationMnh.png" alt="Fondation MNH" style={{ height: 54, width: "auto" }} />
          <h1 style={{ margin: "10px 0 0", fontSize: 21 }}>Administration</h1>
          <p style={{ color: "var(--gris)", margin: "6px 0 0", fontSize: 13.5 }}>Base de connaissances — Fondation MNH</p>
        </div>
        {registered && (
          <p className="badge badge-ok" style={{ textAlign: "center" }}>
            Inscription enregistrée : votre compte doit maintenant être validé par un super-administrateur.
          </p>
        )}
        {msg && <p style={{ color: "var(--rouge)", margin: 0, fontSize: 14 }}>{msg.text}</p>}
        <div>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="text" autoFocus required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <button type="submit" className="btn btn-primary">Se connecter</button>
        <p style={{ fontSize: 13.5, textAlign: "center", margin: 0, color: "var(--gris)" }}>
          Pas encore de compte ? <Link href="/admin/inscription">Demander un accès</Link>
        </p>
      </form>
    </div>
  );
}
