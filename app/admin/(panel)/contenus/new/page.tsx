import AdminHead from "@/components/AdminHead";
import { listProfessions, listThemes } from "@/lib/repo";
import { createContent } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function NewContent({ searchParams }: { searchParams: Promise<{ error?: string; profession?: string }> }) {
  const { error, profession } = await searchParams;
  const professions = await listProfessions(true);
  const themes = await listThemes(true);
  const preselected = professions.find((p) => p.slug === profession);
  return (
    <>
      <AdminHead
        title="Nouveau contenu"
        back={{ href: "/admin/contenus", label: "Contenus" }}
        sub="Créez le bloc profession × thématique, puis complétez le texte sur la page d'édition. Il est créé en brouillon par défaut : il n'apparaît sur le site qu'une fois publié."
      />
      {error && <p className="alert alert-error" role="alert">Choisissez une profession et une thématique.</p>}
      <form action={createContent} className="form form-card">
        <div className="form-grid-2">
          <div>
            <label>Profession</label>
            <select name="profession_id" defaultValue={preselected?.id ?? ""} required>
              <option value="" disabled>— Choisir —</option>
              {professions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label>Thématique canonique</label>
            <select name="theme_id" defaultValue="" required>
              <option value="" disabled>— Choisir —</option>
              {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <div><label>Libellé affiché (optionnel — sinon le nom de la thématique)</label><input type="text" name="display_theme_label" placeholder="ex : Sommeil / récupération / accès aux soins" /></div>
        <div><label>Titre / message principal</label><input type="text" name="titre" required autoFocus /></div>
        <div>
          <label>Statut</label>
          <select name="statut" defaultValue="brouillon">
            <option value="brouillon">Brouillon (masqué)</option>
            <option value="publie">Publié</option>
          </select>
        </div>
        <div><button type="submit" className="btn btn-primary">Créer puis rédiger</button></div>
      </form>
    </>
  );
}
