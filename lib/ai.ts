import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const MODEL = "claude-opus-5";

// ---------- Schémas de sortie structurée ----------
export const AnalysisSchema = z.object({
  titre: z.string(),
  auteurs: z.string(),
  organisme: z.string(),
  date: z.string(),
  type_etude: z.string(),
  population: z.string(),
  pays_contexte: z.string(),
  methodologie: z.string(),
  resume_court: z.string(),
  resume_detaille: z.string(),
  chiffres_importants: z.array(z.string()),
  principaux_resultats: z.array(z.string()),
  limites: z.array(z.string()),
  niveau_generalisation: z.string(),
  resultat_transversal: z.boolean(),
  professions_concernees: z.array(z.string()),
  themes_concernes: z.array(z.string()),
  professions_nouvelles: z.array(z.string()),
  themes_nouveaux: z.array(z.string()),
});
export type Analysis = z.infer<typeof AnalysisSchema>;

const ProposalItemSchema = z.object({
  kind: z.enum(["deja_couvert", "enrichissement", "nouvelle_information", "nouvelle_thematique"]),
  content_id: z.number().nullable(),
  profession_slug: z.string().nullable(),
  theme_slug: z.string().nullable(),
  titre: z.string(),
  proposed_text: z.string(),
  rationale: z.string(),
  source_excerpt: z.string(),
});
export const ProposalsSchema = z.object({ propositions: z.array(ProposalItemSchema) });
export type ProposalItem = z.infer<typeof ProposalItemSchema>;

// ---------- Prudence scientifique (brief §18) ----------
const SCIENTIFIC_GUARDRAILS = `Règles de prudence scientifique — impératives :
- Si la publication concerne globalement « les professionnels de santé » sans isoler une profession, tu NE DOIS PAS attribuer le résultat à une profession précise. Indique alors resultat_transversal = true et écris « Résultat transversal aux professionnels de santé, pas de résultat spécifique disponible pour cette profession » plutôt que d'inventer une spécificité.
- Distingue toujours association et causalité ; ne transforme jamais une association en lien causal.
- Précise systématiquement : étude française ou internationale, données quantitatives ou qualitatives, taille d'échantillon, catégorie professionnelle agrégée, caractère exploratoire.
- Si une information demandée n'est pas présente dans le document, écris « non précisé » — n'invente rien.`;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY manquante : renseignez-la dans .env pour activer l'analyse IA.");
  }
  return new Anthropic();
}

export interface SiteStructure {
  professions: Array<{ slug: string; name: string }>;
  themes: Array<{ slug: string; name: string; description: string }>;
}

type UserBlock =
  | { type: "text"; text: string }
  | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } };

function publicationBlocks(input: { rawText?: string; pdfBase64?: string; sourceRef?: string }): UserBlock[] {
  const blocks: UserBlock[] = [];
  if (input.pdfBase64) {
    blocks.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: input.pdfBase64 } });
  }
  if (input.rawText) blocks.push({ type: "text", text: `Texte de la publication :\n\n${input.rawText}` });
  if (input.sourceRef) blocks.push({ type: "text", text: `Référence / lien source : ${input.sourceRef}` });
  return blocks;
}

/** Étape 1 (brief §11) — analyse automatique : fiche structurée de la publication. */
export async function analyzePublication(
  input: { rawText?: string; pdfBase64?: string; sourceRef?: string },
  structure: SiteStructure
): Promise<Analysis> {
  const client = getClient();
  const system = `Tu es l'assistant éditorial de la Fondation MNH pour sa base de connaissances sur la santé des professionnels de santé.
Tu analyses une nouvelle publication scientifique et tu produis une fiche structurée en français.

${SCIENTIFIC_GUARDRAILS}

Structure actuelle du site :
Professions (slug — nom) : ${structure.professions.map((p) => `${p.slug} — ${p.name}`).join(" ; ")}
Thématiques (slug — nom) : ${structure.themes.map((t) => `${t.slug} — ${t.name}`).join(" ; ")}

Pour professions_concernees et themes_concernes, utilise UNIQUEMENT les slugs existants ci-dessus.
Si la publication concerne une profession ou une thématique absente de la structure, mets son nom en clair dans professions_nouvelles / themes_nouveaux.`;

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system,
    messages: [
      {
        role: "user",
        content: [
          ...publicationBlocks(input),
          { type: "text", text: "Analyse cette publication et produis la fiche structurée." },
        ],
      },
    ],
    output_config: { format: zodOutputFormat(AnalysisSchema) },
  });
  if (!response.parsed_output) throw new Error("L'analyse IA n'a pas produit de fiche structurée exploitable.");
  return response.parsed_output;
}

/** Étapes 2–3 (brief §12–13) — comparaison avec l'existant et propositions de diff éditorial. */
export async function generateProposals(
  input: { rawText?: string; pdfBase64?: string; sourceRef?: string },
  analysis: Analysis,
  existingContents: Array<{
    id: number; profession_slug: string; profession_name: string;
    theme_slug: string; theme_name: string; titre: string; corps_web: string; nuance: string;
  }>
): Promise<ProposalItem[]> {
  const client = getClient();
  const fiches = existingContents
    .map(
      (c) => `### Fiche content_id=${c.id} — ${c.profession_name} → ${c.theme_name} (profession_slug=${c.profession_slug}, theme_slug=${c.theme_slug})
Titre : ${c.titre}
Corps actuel : ${c.corps_web}
Nuance scientifique actuelle : ${c.nuance}`
    )
    .join("\n\n");

  const system = `Tu es l'assistant éditorial de la Fondation MNH. Une publication vient d'être analysée.
Tu compares ses apports avec les fiches existantes du site et tu produis des propositions d'intégration.

${SCIENTIFIC_GUARDRAILS}

Pour chaque fiche existante réellement concernée, choisis UN kind :
- "deja_couvert" : la publication confirme la fiche sans rien apporter de neuf → proposed_text vide, explique dans rationale.
- "enrichissement" : elle apporte un élément nouveau → proposed_text = le corps de texte COMPLET réécrit en intégrant l'apport, en modifiant le moins possible le texte existant (le diff doit rester lisible).
- "nouvelle_information" : information absente de toute fiche mais rattachable à un couple profession × thématique existant sans fiche → content_id = null, renseigne profession_slug et theme_slug, proposed_text = paragraphe proposé.
- "nouvelle_thematique" : plusieurs résultats importants ne correspondent à aucune thématique → content_id = null, theme_slug = null, titre = nom de thématique proposé.

Règles :
- source_excerpt : cite l'extrait exact de la publication qui justifie la proposition (traçabilité).
- rationale : explique en 1 à 3 phrases pourquoi (« Pourquoi ? » du diff éditorial).
- Ne propose RIEN pour les fiches non concernées. Mieux vaut peu de propositions justes que beaucoup de propositions faibles.
- Jamais de spécificité professionnelle inventée à partir d'un résultat transversal.`;

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 32000,
    system,
    messages: [
      {
        role: "user",
        content: [
          ...publicationBlocks(input),
          {
            type: "text",
            text: `Fiche d'analyse de la publication :\n${JSON.stringify(analysis, null, 2)}\n\nFiches existantes du site :\n\n${fiches}\n\nProduis les propositions d'intégration.`,
          },
        ],
      },
    ],
    output_config: { format: zodOutputFormat(ProposalsSchema) },
  });
  if (!response.parsed_output) throw new Error("L'IA n'a pas produit de propositions exploitables.");
  return response.parsed_output.propositions;
}
