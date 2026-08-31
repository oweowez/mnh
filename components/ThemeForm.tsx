import type { Theme } from "@/lib/repo";
import { saveTheme } from "@/app/admin/actions";

export default function ThemeForm({ theme }: { theme?: Theme }) {
  return (
    <form action={saveTheme} className="form form-card">
      {theme && <input type="hidden" name="id" value={theme.id} />}
      <div className="form-grid-2">
        <div><label>Nom</label><input type="text" name="name" defaultValue={theme?.name} required autoFocus /></div>
        <div><label>Slug (URL)</label><input type="text" name="slug" defaultValue={theme?.slug} required /></div>
      </div>
      <div><label>Description</label><input type="text" name="description" defaultValue={theme?.description} /></div>
      <div className="form-grid-3">
        <div><label>Ordre</label><input type="number" name="ordre" defaultValue={theme?.ordre ?? 99} /></div>
        <label className="check" style={{ marginTop: 26 }}>
          <input type="checkbox" name="visible" defaultChecked={theme ? theme.visible === 1 : true} /> Visible sur le site
        </label>
      </div>
      <div><button type="submit" className="btn btn-primary">{theme ? "Enregistrer" : "Créer la thématique"}</button></div>
    </form>
  );
}
