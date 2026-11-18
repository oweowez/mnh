import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { register } from "../actions";

export const metadata = { title: "Demande d'accès à l'administration" };

const MESSAGES: Record<string, string> = {
  champs: "Merci de renseigner un nom et un e-mail valide.",
  motdepasse: "Le mot de passe doit contenir au moins 8 caractères.",
  existe: "Un compte existe déjà avec cet e-mail.",
};

export default async function InscriptionPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <AuthShell>
      <h1>Demande d&apos;accès</h1>
      <p className="sub">
        Votre inscription sera soumise à la validation d&apos;un super-administrateur
        avant de pouvoir accéder au tableau de bord.
      </p>
      {error && <p className="alert alert-error" role="alert">{MESSAGES[error] ?? "Erreur."}</p>}
      <form action={register} className="form">
        <div>
          <label htmlFor="name">Nom complet</label>
          <input id="name" name="name" type="text" autoFocus required autoComplete="name" />
        </div>
        <div>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
          <p className="hint">8 caractères minimum.</p>
        </div>
        <button type="submit" className="btn btn-primary btn-block">Envoyer ma demande</button>
        <p className="auth-alt">
          Déjà un compte ? <Link href="/admin/login">Se connecter</Link>
        </p>
      </form>
    </AuthShell>
  );
}
