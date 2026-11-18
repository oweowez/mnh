import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { login } from "../actions";

export const metadata = { title: "Connexion à l'administration" };

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
    <AuthShell>
      <h1>Connexion</h1>
      <p className="sub">Accédez à l&apos;administration de la base de connaissances.</p>
      {registered && (
        <p className="alert alert-ok" role="status">
          Inscription enregistrée : votre compte doit maintenant être validé par un super-administrateur.
        </p>
      )}
      {msg && <p className="alert alert-error" role="alert">{msg.text}</p>}
      <form action={login} className="form">
        <div>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoFocus required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <button type="submit" className="btn btn-primary btn-block">Se connecter</button>
        <p className="auth-alt">
          Pas encore de compte ? <Link href="/admin/inscription">Demander un accès</Link>
        </p>
      </form>
    </AuthShell>
  );
}
