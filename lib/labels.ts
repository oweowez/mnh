/** Libellés des types de propositions IA (brief §12). `tone` → pastille colorée `.kind--…` (globals.css). */
export const KIND_LABELS: Record<string, { label: string; tone: string }> = {
  deja_couvert: { label: "Déjà couvert", tone: "ok" },
  enrichissement: { label: "Enrichissement", tone: "enrich" },
  nouvelle_information: { label: "Information nouvelle", tone: "new" },
  nouvelle_thematique: { label: "Nouvelle thématique", tone: "theme" },
};

/** Statuts éditoriaux (études, contenus) → libellé et classe de badge. */
export const STATUT_LABELS: Record<string, { label: string; cls: string }> = {
  publie: { label: "Publié", cls: "badge-ok" },
  valide: { label: "Validé", cls: "badge-info" },
  brouillon: { label: "Brouillon", cls: "badge-attente" },
  archive: { label: "Archivé", cls: "badge-refus" },
};

/** Date ISO → « 18/11/2026 14:05 ». */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : iso;
}
