import type { Profession } from "@/lib/repo";
import { saveProfession } from "@/app/admin/actions";

export default function ProfessionForm({ profession }: { profession?: Profession }) {
  return (
    <form action={saveProfession} className="form form-card">
      {profession && <input type="hidden" name="id" value={profession.id} />}
      <div className="form-grid-2">
        <div><label>Nom</label><input type="text" name="name" defaultValue={profession?.name} required autoFocus /></div>
        <div><label>Slug (URL)</label><input type="text" name="slug" defaultValue={profession?.slug} required placeholder="ex : cadres-de-sante" /></div>
      </div>
      <div><label>Description courte</label><input type="text" name="short_desc" defaultValue={profession?.short_desc} /></div>
      <div className="form-grid-3">
        <div><label>Ordre</label><input type="number" name="ordre" defaultValue={profession?.ordre ?? 99} /></div>
        <label className="check" style={{ marginTop: 26 }}>
          <input type="checkbox" name="visible" defaultChecked={profession ? profession.visible === 1 : true} /> Visible sur le site
        </label>
        <label className="check" style={{ marginTop: 26 }}>
          <input type="checkbox" name="archived" defaultChecked={profession?.archived === 1} /> Archivée
        </label>
      </div>
      <div><button type="submit" className="btn btn-primary">{profession ? "Enregistrer" : "Créer la profession"}</button></div>
    </form>
  );
}
