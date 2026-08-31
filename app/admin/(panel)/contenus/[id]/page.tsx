import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent, listThemes, listVersions, refsForContent } from "@/lib/repo";
import { saveContent } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function AdminContentEdit({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const content = getContent(Number(id));
  if (!content) notFound();
  const themes = listThemes(true);
  const versions = listVersions(content.id);
  const refs = refsForContent(content.id);
  return (
    <>
      <div className="breadcrumb"><Link href="/admin/contenus">Contenus</Link> / {content.profession_name}</div>
      <h1>{content.profession_name} → {content.display_theme_label || content.theme_name}</h1>
      {saved && <p className="badge badge-ok">Modifications enregistrées (version précédente archivée)</p>}
      <form action={saveContent} className="form" style={{ marginTop: 18 }}>
        <input type="hidden" name="id" value={content.id} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 14 }}>
          <div>
            <label>Thématique canonique</label>
            <select name="theme_id" defaultValue={content.theme_id}>
              {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div><label>Libellé affiché</label><input type="text" name="display_theme_label" defaultValue={content.display_theme_label} /></div>
          <div><label>Ordre</label><input type="number" name="ordre" defaultValue={content.ordre} /></div>
        </div>
        <div><label>Titre / message principal</label><input type="text" name="titre" defaultValue={content.titre} /></div>
        <div><label>Message clé (résumé très court)</label><textarea name="message_cle" defaultValue={content.message_cle} /></div>
        <div><label>Développement court (fiche A4)</label><textarea name="dev_court" defaultValue={content.dev_court} /></div>
        <div><label>Corps de texte — site web</label><textarea name="corps_web" defaultValue={content.corps_web} style={{ minHeight: 220 }} /></div>
        <div><label>Nuance scientifique</label><textarea name="nuance" defaultValue={content.nuance} /></div>
        <div><label>Ce que le décideur doit regarder</label><textarea name="decideur" defaultValue={content.decideur} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div><label>Priorité A4</label><input type="text" name="priorite" defaultValue={content.priorite} /></div>
          <div>
            <label>Statut</label>
            <select name="statut" defaultValue={content.statut}>
              <option value="publie">Publié</option>
              <option value="brouillon">Brouillon (masqué)</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Enregistrer</button>
      </form>

      {refs.length > 0 && (
        <p style={{ marginTop: 24, color: "var(--gris)", fontSize: 14 }}>
          <strong>Références :</strong> {refs.map((r) => `[${r.ref_num}] ${r.name}`).join(" · ")}
        </p>
      )}

      <h2 style={{ fontSize: 17, marginTop: 36 }}>Historique des versions</h2>
      {versions.length === 0 && <p style={{ color: "var(--gris)" }}>Aucune version antérieure.</p>}
      {versions.length > 0 && (
        <table className="data">
          <thead><tr><th>Date</th><th>Motif</th><th>Par</th><th>Publication liée</th></tr></thead>
          <tbody>
            {versions.map((v) => (
              <tr key={v.id}>
                <td>{v.created_at}</td>
                <td>{v.reason}</td>
                <td>{v.changed_by}</td>
                <td>{v.publication_id ? <Link href={`/admin/publications/${v.publication_id}`}>#{v.publication_id}</Link> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
