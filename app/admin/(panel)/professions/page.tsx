import { listProfessions } from "@/lib/repo";
import { saveProfession } from "../../actions";

export const dynamic = "force-dynamic";

export default function AdminProfessions() {
  const professions = listProfessions(true);
  return (
    <>
      <h1>Professions</h1>
      <table className="data">
        <thead>
          <tr><th>Ordre</th><th>Nom</th><th>Slug</th><th>Visible</th><th style={{ width: 340 }}>Description courte</th><th></th></tr>
        </thead>
        <tbody>
          {professions.map((p) => (
            <tr key={p.id}>
              <td colSpan={6} style={{ padding: 0 }}>
                <form action={saveProfession} style={{ display: "flex", gap: 8, padding: "8px 12px", alignItems: "center", flexWrap: "wrap" }}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="number" name="ordre" defaultValue={p.ordre} style={{ width: 56, padding: 6 }} />
                  <input type="text" name="name" defaultValue={p.name} style={{ width: 200, padding: 6 }} />
                  <input type="text" name="slug" defaultValue={p.slug} style={{ width: 150, padding: 6 }} />
                  <label style={{ fontSize: 13 }}><input type="checkbox" name="visible" defaultChecked={p.visible === 1} /> visible</label>
                  <label style={{ fontSize: 13 }}><input type="checkbox" name="archived" defaultChecked={p.archived === 1} /> archivée</label>
                  <input type="text" name="short_desc" defaultValue={p.short_desc} style={{ flex: 1, minWidth: 220, padding: 6 }} />
                  <button type="submit" className="btn btn-light">Enregistrer</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 style={{ fontSize: 17, marginTop: 30 }}>Ajouter une profession</h2>
      <form action={saveProfession} className="form">
        <div><label>Nom</label><input type="text" name="name" required /></div>
        <div><label>Slug (URL)</label><input type="text" name="slug" required placeholder="ex : cadres-de-sante" /></div>
        <div><label>Description courte</label><input type="text" name="short_desc" /></div>
        <div><label>Ordre</label><input type="number" name="ordre" defaultValue={99} /></div>
        <label><input type="checkbox" name="visible" defaultChecked /> Visible sur le site public</label>
        <button type="submit" className="btn btn-primary">Créer</button>
      </form>
    </>
  );
}
