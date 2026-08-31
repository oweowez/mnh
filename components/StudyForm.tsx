import type { Study } from "@/lib/repo";
import { saveStudy } from "@/app/admin/actions";

export default function StudyForm({ study }: { study?: Study }) {
  return (
    <form action={saveStudy} className="form form-card">
      {study && <input type="hidden" name="id" value={study.id} />}
      <div className="form-grid-3">
        <div style={{ gridColumn: "span 2" }}><label>Nom</label><input type="text" name="name" defaultValue={study?.name} required autoFocus /></div>
        <div><label>N° référence</label><input type="number" name="ref_num" defaultValue={study?.ref_num ?? ""} /></div>
      </div>
      <div><label>Slug (URL)</label><input type="text" name="slug" defaultValue={study?.slug} required /></div>
      <div><label>Titre complet</label><input type="text" name="full_title" defaultValue={study?.full_title} /></div>
      <div><label>Équipe / organisme</label><input type="text" name="team" defaultValue={study?.team} /></div>
      <div className="form-grid-3">
        <div><label>Type de travail</label><input type="text" name="type" defaultValue={study?.type} placeholder="cohorte, étude qualitative, revue…" /></div>
        <div><label>Date</label><input type="text" name="date_label" defaultValue={study?.date_label} /></div>
        <div>
          <label>Statut</label>
          <select name="statut" defaultValue={study?.statut ?? "publie"}>
            <option value="brouillon">Brouillon</option>
            <option value="valide">Validé</option>
            <option value="publie">Publié</option>
            <option value="archive">Archivé</option>
          </select>
        </div>
      </div>
      <div><label>Résumé</label><textarea name="resume" defaultValue={study?.resume} style={{ minHeight: 140 }} /></div>
      <div><label>Lien (URL publication / projet)</label><input type="url" name="url" defaultValue={study?.url} /></div>
      <div><button type="submit" className="btn btn-primary">{study ? "Enregistrer" : "Créer l'étude"}</button></div>
    </form>
  );
}
