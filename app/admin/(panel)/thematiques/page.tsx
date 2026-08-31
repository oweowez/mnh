import { listThemes } from "@/lib/repo";
import { saveTheme } from "../../actions";

export const dynamic = "force-dynamic";

export default function AdminThemes() {
  const themes = listThemes(true);
  return (
    <>
      <h1>Thématiques</h1>
      <p style={{ color: "var(--gris)", maxWidth: 700 }}>
        Les thématiques sont transversales : chaque contenu associe une profession à une thématique,
        avec un libellé d&apos;affichage propre à la fiche si besoin.
      </p>
      <table className="data">
        <thead>
          <tr><th>Ordre</th><th>Nom</th><th>Slug</th><th>Visible</th><th style={{ width: 340 }}>Description</th><th></th></tr>
        </thead>
        <tbody>
          {themes.map((t) => (
            <tr key={t.id}>
              <td colSpan={6} style={{ padding: 0 }}>
                <form action={saveTheme} style={{ display: "flex", gap: 8, padding: "8px 12px", alignItems: "center", flexWrap: "wrap" }}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="number" name="ordre" defaultValue={t.ordre} style={{ width: 56, padding: 6 }} />
                  <input type="text" name="name" defaultValue={t.name} style={{ width: 230, padding: 6 }} />
                  <input type="text" name="slug" defaultValue={t.slug} style={{ width: 190, padding: 6 }} />
                  <label style={{ fontSize: 13 }}><input type="checkbox" name="visible" defaultChecked={t.visible === 1} /> visible</label>
                  <input type="text" name="description" defaultValue={t.description} style={{ flex: 1, minWidth: 220, padding: 6 }} />
                  <button type="submit" className="btn btn-light">Enregistrer</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 style={{ fontSize: 17, marginTop: 30 }}>Ajouter une thématique</h2>
      <form action={saveTheme} className="form">
        <div><label>Nom</label><input type="text" name="name" required /></div>
        <div><label>Slug (URL)</label><input type="text" name="slug" required /></div>
        <div><label>Description</label><input type="text" name="description" /></div>
        <div><label>Ordre</label><input type="number" name="ordre" defaultValue={99} /></div>
        <label><input type="checkbox" name="visible" defaultChecked /> Visible</label>
        <button type="submit" className="btn btn-primary">Créer</button>
      </form>
    </>
  );
}
