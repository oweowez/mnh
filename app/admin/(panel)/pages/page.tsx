import { listPages } from "@/lib/repo";
import { savePage } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminPages({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const pages = listPages();
  return (
    <>
      <h1>Pages générales</h1>
      {saved && <p className="badge badge-ok">Enregistré</p>}
      <p style={{ color: "var(--gris)" }}>Contenus transversaux affichés sur l&apos;accueil et la page « Comprendre les enjeux ».</p>
      {pages.map((p) => (
        <details key={p.id} className="proposal">
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>{p.title || p.slug} <span className="pill">{p.slug}</span></summary>
          <form action={savePage} className="form" style={{ marginTop: 14 }}>
            <input type="hidden" name="id" value={p.id} />
            <div><label>Titre</label><input type="text" name="title" defaultValue={p.title} /></div>
            <div><label>Contenu</label><textarea name="body" defaultValue={p.body} style={{ minHeight: 200 }} /></div>
            <button type="submit" className="btn btn-primary">Enregistrer</button>
          </form>
        </details>
      ))}
    </>
  );
}
