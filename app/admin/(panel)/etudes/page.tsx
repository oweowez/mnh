import { listStudies } from "@/lib/repo";
import { saveStudy } from "../../actions";

export const dynamic = "force-dynamic";

export default function AdminStudies() {
  const studies = listStudies(false);
  return (
    <>
      <h1>Études &amp; projets</h1>
      <table className="data">
        <thead><tr><th>Réf.</th><th>Nom</th><th>Type</th><th>Date</th><th>Statut</th></tr></thead>
        <tbody>
          {studies.map((s) => (
            <tr key={s.id}>
              <td>{s.ref_num ? `[${s.ref_num}]` : "—"}</td>
              <td><details><summary style={{ cursor: "pointer", fontWeight: 600 }}>{s.name}</summary>
                <form action={saveStudy} className="form" style={{ marginTop: 12 }}>
                  <input type="hidden" name="id" value={s.id} />
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
                    <div><label>Nom</label><input type="text" name="name" defaultValue={s.name} /></div>
                    <div><label>Slug</label><input type="text" name="slug" defaultValue={s.slug} /></div>
                    <div><label>N° référence</label><input type="number" name="ref_num" defaultValue={s.ref_num ?? ""} /></div>
                  </div>
                  <div><label>Titre complet</label><input type="text" name="full_title" defaultValue={s.full_title} /></div>
                  <div><label>Équipe / organisme</label><input type="text" name="team" defaultValue={s.team} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div><label>Type</label><input type="text" name="type" defaultValue={s.type} /></div>
                    <div><label>Date</label><input type="text" name="date_label" defaultValue={s.date_label} /></div>
                    <div>
                      <label>Statut</label>
                      <select name="statut" defaultValue={s.statut}>
                        <option value="brouillon">Brouillon</option>
                        <option value="valide">Validé</option>
                        <option value="publie">Publié</option>
                        <option value="archive">Archivé</option>
                      </select>
                    </div>
                  </div>
                  <div><label>Résumé</label><textarea name="resume" defaultValue={s.resume} /></div>
                  <div><label>Lien (URL publication / projet)</label><input type="url" name="url" defaultValue={s.url} /></div>
                  <button type="submit" className="btn btn-primary">Enregistrer</button>
                </form>
              </details></td>
              <td>{s.type}</td>
              <td>{s.date_label}</td>
              <td><span className={`badge ${s.statut === "publie" ? "badge-ok" : "badge-attente"}`}>{s.statut}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 style={{ fontSize: 17, marginTop: 30 }}>Ajouter une étude / un projet</h2>
      <form action={saveStudy} className="form">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
          <div><label>Nom</label><input type="text" name="name" required /></div>
          <div><label>Slug</label><input type="text" name="slug" required /></div>
          <div><label>N° référence</label><input type="number" name="ref_num" /></div>
        </div>
        <div><label>Titre complet</label><input type="text" name="full_title" /></div>
        <div><label>Équipe / organisme</label><input type="text" name="team" /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label>Type</label><input type="text" name="type" placeholder="cohorte, étude qualitative, revue…" /></div>
          <div><label>Date</label><input type="text" name="date_label" /></div>
        </div>
        <div><label>Résumé</label><textarea name="resume" /></div>
        <div><label>Lien</label><input type="url" name="url" /></div>
        <button type="submit" className="btn btn-primary">Créer</button>
      </form>
    </>
  );
}
