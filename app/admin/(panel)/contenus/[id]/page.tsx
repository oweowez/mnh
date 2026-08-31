import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHead from "@/components/AdminHead";
import { getContent, listThemes, listVersions, refsForContent } from "@/lib/repo";
import { saveContent } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function AdminContentEdit({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const content = await getContent(Number(id));
  if (!content) notFound();
  const themes = await listThemes(true);
  const versions = await listVersions(content.id);
  const refs = await refsForContent(content.id);
  return (
    <>
      <AdminHead
        title={`${content.profession_name} → ${content.display_theme_label || content.theme_name}`}
        back={{ href: `/admin/contenus?profession=${content.profession_slug}`, label: `Contenus ${content.profession_name}` }}
        sub={refs.length > 0 ? <>Références : {refs.map((r) => `[${r.ref_num}] ${r.name}`).join(" · ")}</> : undefined}
      >
        <Link href={`/professions/${content.profession_slug}#contenu-${content.id}`} target="_blank" className="btn btn-ghost">Voir sur le site ↗</Link>
      </AdminHead>
      {saved && <p className="badge badge-ok" style={{ marginBottom: 16 }}>Modifications enregistrées — version précédente archivée</p>}

      <form action={saveContent} className="form form-card">
        <input type="hidden" name="id" value={content.id} />

        <div className="form-section" style={{ borderTop: 0, paddingTop: 0 }}>
          <p className="form-section-title">Positionnement</p>
          <div className="form-grid-3">
            <div>
              <label>Thématique canonique</label>
              <select name="theme_id" defaultValue={content.theme_id}>
                {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div><label>Libellé affiché</label><input type="text" name="display_theme_label" defaultValue={content.display_theme_label} /></div>
            <div><label>Ordre</label><input type="number" name="ordre" defaultValue={content.ordre} /></div>
          </div>
          <div className="form-grid-2" style={{ marginTop: 14 }}>
            <div><label>Priorité fiche A4</label><input type="text" name="priorite" defaultValue={content.priorite} /></div>
            <div>
              <label>Statut</label>
              <select name="statut" defaultValue={content.statut}>
                <option value="publie">Publié</option>
                <option value="brouillon">Brouillon (masqué)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Contenu</p>
          <div style={{ display: "grid", gap: 14 }}>
            <div><label>Titre / message principal</label><input type="text" name="titre" defaultValue={content.titre} /></div>
            <div><label>Message clé (résumé très court)</label><textarea name="message_cle" defaultValue={content.message_cle} style={{ minHeight: 70 }} /></div>
            <div><label>Développement court (fiche A4)</label><textarea name="dev_court" defaultValue={content.dev_court} /></div>
            <div><label>Corps de texte — site web</label><textarea name="corps_web" defaultValue={content.corps_web} style={{ minHeight: 240 }} /></div>
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Encadrés</p>
          <div style={{ display: "grid", gap: 14 }}>
            <div><label>Nuance scientifique</label><textarea name="nuance" defaultValue={content.nuance} /></div>
            <div><label>Ce que le décideur doit regarder</label><textarea name="decideur" defaultValue={content.decideur} /></div>
          </div>
        </div>

        <div><button type="submit" className="btn btn-primary">Enregistrer</button></div>
      </form>

      <details style={{ marginTop: 28 }}>
        <summary style={{ cursor: "pointer", fontWeight: 700, color: "var(--marine)", fontSize: 15 }}>
          Historique des versions ({versions.length})
        </summary>
        {versions.length === 0 && <p style={{ color: "var(--gris)" }}>Aucune version antérieure.</p>}
        {versions.length > 0 && (
          <table className="data" style={{ marginTop: 12 }}>
            <thead><tr><th>Date</th><th>Motif</th><th>Par</th><th>Publication liée</th></tr></thead>
            <tbody>
              {versions.map((v) => (
                <tr key={v.id}>
                  <td className="cell-muted">{v.created_at.slice(0, 16).replace("T", " ")}</td>
                  <td>{v.reason}</td>
                  <td>{v.changed_by}</td>
                  <td>{v.publication_id ? <Link href={`/admin/publications/${v.publication_id}`}>#{v.publication_id}</Link> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </details>
    </>
  );
}
