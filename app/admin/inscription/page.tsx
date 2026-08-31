import Link from "next/link";
import { register } from "../actions";

export const metadata = { title: "Demande d'accès — Administration MNH" };

const MESSAGES: Record<string, string> = {
  champs: "Merci de renseigner un nom et un e-mail valide.",
  motdepasse: "Le mot de passe doit contenir au moins 8 caractères.",
  existe: "Un compte existe déjà avec cet e-mail.",
};

export default async function InscriptionPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--marine)" }}>
      <form action={register} className="form" style={{ background: "#fff", borderRadius: 8, padding: "36px 40px", width: 420 }}>
        <div style={{ textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo/logoFondationMnh.png" alt="Fondation MNH" style={{ height: 54, width: "auto" }} />
          <h1 style={{ margin: "10px 0 0", fontSize: 21 }}>Demande d&apos;accès</h1>
          <p style={{ color: "var(--gris)", margin: "6px 0 0", fontSize: 13.5 }}>
            Votre inscription sera soumise à la validation d&apos;un super-administrateur
            avant de pouvoir accéder au tableau de bord.
          </p>
        </div>
        {error && <p style={{ color: "var(--rouge)", margin: 0, fontSize: 14 }}>{MESSAGES[error] ?? "Erreur."}</p>}
        <div>
          <label htmlFor="name">Nom complet</label>
          <input id="name" name="name" type="text" autoFocus required autoComplete="name" />
        </div>
        <div>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="text" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password">Mot de passe (8 caractères min.)</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <button type="submit" className="btn btn-primary">Envoyer ma demande</button>
        <p style={{ fontSize: 13.5, textAlign: "center", margin: 0, color: "var(--gris)" }}>
          Déjà un compte ? <Link href="/admin/login">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
