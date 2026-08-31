import AdminHead from "@/components/AdminHead";
import { createPublication } from "../../../actions";

export const dynamic = "force-dynamic";

export default function NewPublication() {
  return (
    <>
      <AdminHead
        title="Ajouter une publication"
        back={{ href: "/admin/publications", label: "Publications & IA" }}
        sub="Collez un lien, un DOI, importez un PDF ou saisissez le texte. L'analyse IA produira une fiche structurée (brouillon) et des propositions d'intégration — rien n'est publié sans validation."
      />
      <form action={createPublication} className="form form-card">
        <div className="form-grid-2">
          <div><label>Titre (optionnel — complété par l&apos;analyse)</label><input type="text" name="title" autoFocus /></div>
          <div>
            <label>Type de source</label>
            <select name="source_type" defaultValue="pdf">
              <option value="pdf">Import PDF</option>
              <option value="lien">Lien (URL)</option>
              <option value="doi">DOI</option>
              <option value="manuel">Saisie manuelle</option>
            </select>
          </div>
        </div>
        <div><label>Lien / DOI</label><input type="text" name="source_ref" placeholder="https://… ou 10.1234/…" /></div>
        <div><label>Fichier PDF</label><input type="file" name="pdf" accept="application/pdf" /></div>
        <div><label>Texte de la publication (optionnel si PDF ou lien)</label><textarea name="raw_text" style={{ minHeight: 160 }} placeholder="Collez ici le texte ou l'abstract…" /></div>
        <div><button type="submit" className="btn btn-primary">Enregistrer la publication</button></div>
      </form>
    </>
  );
}
