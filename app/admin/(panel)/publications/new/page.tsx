import { createPublication } from "../../../actions";

export const dynamic = "force-dynamic";

export default function NewPublication() {
  return (
    <>
      <h1>Ajouter une publication</h1>
      <p style={{ color: "var(--gris)", maxWidth: 700 }}>
        Collez un lien, un DOI, importez un PDF ou saisissez le texte. L&apos;analyse IA produira ensuite
        une fiche structurée (brouillon) et des propositions d&apos;intégration au site — rien n&apos;est publié sans validation.
      </p>
      <form action={createPublication} className="form" style={{ marginTop: 18 }}>
        <div><label>Titre (optionnel — sera complété par l&apos;analyse)</label><input type="text" name="title" /></div>
        <div>
          <label>Type de source</label>
          <select name="source_type" defaultValue="pdf">
            <option value="pdf">Import PDF</option>
            <option value="lien">Lien (URL)</option>
            <option value="doi">DOI</option>
            <option value="manuel">Saisie manuelle</option>
          </select>
        </div>
        <div><label>Lien / DOI</label><input type="text" name="source_ref" placeholder="https://… ou 10.1234/…" /></div>
        <div><label>Fichier PDF</label><input type="file" name="pdf" accept="application/pdf" /></div>
        <div><label>Texte de la publication (optionnel si PDF ou lien)</label><textarea name="raw_text" style={{ minHeight: 180 }} placeholder="Collez ici le texte ou l'abstract…" /></div>
        <button type="submit" className="btn btn-primary">Enregistrer la publication</button>
      </form>
    </>
  );
}
