import { login } from "../actions";

export const metadata = { title: "Connexion — Administration MNH" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bleu-fonce)" }}>
      <form action={login} className="form" style={{ background: "#fff", borderRadius: 14, padding: "36px 40px", width: 380 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>Administration</h1>
          <p style={{ color: "var(--gris)", margin: "6px 0 0", fontSize: 14 }}>Fondation MNH — Base de connaissances</p>
        </div>
        {error && <p style={{ color: "var(--rouge)", margin: 0, fontSize: 14 }}>Mot de passe incorrect.</p>}
        <div>
          <label htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" autoFocus required />
        </div>
        <button type="submit" className="btn btn-primary">Se connecter</button>
      </form>
    </div>
  );
}
