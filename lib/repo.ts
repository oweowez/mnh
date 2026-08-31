import { supabaseAdmin } from "./supabase";

/** Client Postgres serveur (service_role — les tables sont verrouillées par RLS). */
function db() {
  return supabaseAdmin();
}

function must<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(`Supabase : ${error.message}`);
  return data as T;
}

export interface Profession {
  id: number; slug: string; name: string; short_desc: string;
  ordre: number; visible: number; archived: number;
}
export interface Theme {
  id: number; slug: string; name: string; description: string; ordre: number; visible: number;
}
export interface Study {
  id: number; slug: string; ref_num: number | null; name: string; full_title: string;
  team: string; type: string; date_label: string; resume: string; url: string; statut: string;
}
export interface Content {
  id: number; profession_id: number; theme_id: number; ordre: number;
  display_theme_label: string; titre: string; message_cle: string; dev_court: string;
  corps_web: string; nuance: string; decideur: string; priorite: string; statut: string; updated_at: string;
}
export interface ContentFull extends Content {
  profession_slug: string; profession_name: string; profession_ordre: number;
  profession_visible: number; profession_archived: number;
  theme_slug: string; theme_name: string;
}
export interface Publication {
  id: number; title: string; source_type: string; source_ref: string; raw_text: string;
  file_path: string; statut: string; analysis: string; created_at: string;
}
export interface Proposal {
  id: number; publication_id: number; content_id: number | null; profession_id: number | null;
  theme_id: number | null; kind: string; titre: string; current_text: string; proposed_text: string;
  rationale: string; source_excerpt: string; statut: string; decided_by: string; decided_at: string; created_at: string;
}
export interface Page { id: number; slug: string; title: string; body: string; }
export interface ContentVersion {
  id: number; content_id: number; snapshot: string; reason: string;
  changed_by: string; publication_id: number | null; created_at: string;
}

// ---------- Professions & thématiques ----------
export async function listProfessions(includeHidden = false): Promise<Profession[]> {
  let q = db().from("professions").select("*").eq("archived", 0).order("ordre");
  if (!includeHidden) q = q.eq("visible", 1);
  return must<Profession[]>(await q);
}
export async function getProfession(slug: string): Promise<Profession | undefined> {
  return must<Profession[]>(await db().from("professions").select("*").eq("slug", slug))[0];
}
export async function getProfessionById(id: number): Promise<Profession | undefined> {
  return must<Profession[]>(await db().from("professions").select("*").eq("id", id))[0];
}
export async function listThemes(includeHidden = false): Promise<Theme[]> {
  let q = db().from("themes").select("*").order("ordre");
  if (!includeHidden) q = q.eq("visible", 1);
  return must<Theme[]>(await q);
}
export async function getTheme(slug: string): Promise<Theme | undefined> {
  return must<Theme[]>(await db().from("themes").select("*").eq("slug", slug))[0];
}
export async function getThemeById(id: number): Promise<Theme | undefined> {
  return must<Theme[]>(await db().from("themes").select("*").eq("id", id))[0];
}

// ---------- Contenus ----------
export async function contentsForProfession(professionId: number, publishedOnly = true): Promise<ContentFull[]> {
  let q = db().from("v_contents_full").select("*").eq("profession_id", professionId).order("ordre");
  if (publishedOnly) q = q.eq("statut", "publie");
  return must<ContentFull[]>(await q);
}
export async function contentsForTheme(themeId: number): Promise<ContentFull[]> {
  return must<ContentFull[]>(
    await db().from("v_contents_full").select("*")
      .eq("theme_id", themeId).eq("statut", "publie")
      .eq("profession_visible", 1).eq("profession_archived", 0)
      .order("profession_ordre")
  );
}
export async function getContent(id: number): Promise<ContentFull | undefined> {
  return must<ContentFull[]>(await db().from("v_contents_full").select("*").eq("id", id))[0];
}
export async function listContents(): Promise<ContentFull[]> {
  return must<ContentFull[]>(
    await db().from("v_contents_full").select("*").order("profession_ordre").order("ordre")
  );
}

// ---------- Références contenu ↔ étude ----------
interface RefRow { content_id: number; study: Study }
export async function refsForContent(contentId: number): Promise<Study[]> {
  const rows = must<RefRow[]>(
    await db().from("content_refs").select("content_id, study:studies(*)").eq("content_id", contentId) as never
  );
  return rows.map((r) => r.study).sort((a, b) => (a.ref_num ?? 99) - (b.ref_num ?? 99));
}
/** Toutes les références d'un lot de contenus en une requête (pages profession / thématique). */
export async function refsMapForContents(contentIds: number[]): Promise<Record<number, Study[]>> {
  if (contentIds.length === 0) return {};
  const rows = must<RefRow[]>(
    await db().from("content_refs").select("content_id, study:studies(*)").in("content_id", contentIds) as never
  );
  const map: Record<number, Study[]> = {};
  for (const r of rows) (map[r.content_id] ??= []).push(r.study);
  for (const list of Object.values(map)) list.sort((a, b) => (a.ref_num ?? 99) - (b.ref_num ?? 99));
  return map;
}

// ---------- Études ----------
export async function listStudies(publishedOnly = true): Promise<Study[]> {
  let q = db().from("studies").select("*").order("ref_num", { nullsFirst: false }).order("name");
  if (publishedOnly) q = q.neq("statut", "archive");
  return must<Study[]>(await q);
}
export async function getStudy(slug: string): Promise<Study | undefined> {
  return must<Study[]>(await db().from("studies").select("*").eq("slug", slug))[0];
}
export async function getStudyById(id: number): Promise<Study | undefined> {
  return must<Study[]>(await db().from("studies").select("*").eq("id", id))[0];
}
export async function professionsForStudy(studyId: number): Promise<Profession[]> {
  const rows = must<Array<{ profession: Profession }>>(
    await db().from("study_professions").select("profession:professions(*)").eq("study_id", studyId) as never
  );
  return rows.map((r) => r.profession).filter((p) => p.visible === 1).sort((a, b) => a.ordre - b.ordre);
}
export async function themesForStudy(studyId: number): Promise<Theme[]> {
  const rows = must<Array<{ theme: Theme }>>(
    await db().from("study_themes").select("theme:themes(*)").eq("study_id", studyId) as never
  );
  return rows.map((r) => r.theme).sort((a, b) => a.ordre - b.ordre);
}
export async function studiesForProfession(professionId: number): Promise<Study[]> {
  const rows = must<Array<{ study: Study }>>(
    await db().from("study_professions").select("study:studies(*)").eq("profession_id", professionId) as never
  );
  return rows.map((r) => r.study).sort((a, b) => (a.ref_num ?? 99) - (b.ref_num ?? 99));
}
export async function studiesForTheme(themeId: number): Promise<Study[]> {
  const rows = must<Array<{ study: Study }>>(
    await db().from("study_themes").select("study:studies(*)").eq("theme_id", themeId) as never
  );
  return rows.map((r) => r.study).sort((a, b) => (a.ref_num ?? 99) - (b.ref_num ?? 99));
}

// ---------- Pages générales ----------
export async function getPage(slug: string): Promise<Page | undefined> {
  return must<Page[]>(await db().from("pages").select("*").eq("slug", slug))[0];
}
export async function listPages(): Promise<Page[]> {
  return must<Page[]>(await db().from("pages").select("*").order("id"));
}
export async function getPageById(id: number): Promise<Page | undefined> {
  return must<Page[]>(await db().from("pages").select("*").eq("id", id))[0];
}

// ---------- Recherche ----------
export interface SearchResults {
  contents: ContentFull[];
  studies: Study[];
  professions: Profession[];
  themes: Theme[];
}
export async function search(q: string): Promise<SearchResults> {
  const safe = q.replace(/[,%()]/g, " ").trim();
  const like = `%${safe}%`;
  const [contents, studies, professions, themes] = await Promise.all([
    db().from("v_contents_full").select("*").eq("statut", "publie")
      .or(`titre.ilike.${like},corps_web.ilike.${like},message_cle.ilike.${like},decideur.ilike.${like}`)
      .order("profession_ordre").order("ordre").limit(30),
    db().from("studies").select("*")
      .or(`name.ilike.${like},full_title.ilike.${like},resume.ilike.${like},team.ilike.${like}`).limit(20),
    db().from("professions").select("*").eq("visible", 1).ilike("name", like).limit(10),
    db().from("themes").select("*").or(`name.ilike.${like},description.ilike.${like}`).limit(10),
  ]);
  return {
    contents: must<ContentFull[]>(contents),
    studies: must<Study[]>(studies),
    professions: must<Profession[]>(professions),
    themes: must<Theme[]>(themes),
  };
}

// ---------- Publications & propositions ----------
export async function listPublications(): Promise<Publication[]> {
  return must<Publication[]>(await db().from("publications").select("*").order("id", { ascending: false }));
}
export async function getPublication(id: number): Promise<Publication | undefined> {
  return must<Publication[]>(await db().from("publications").select("*").eq("id", id))[0];
}
export async function listProposals(): Promise<Proposal[]> {
  return must<Proposal[]>(await db().from("proposals").select("*").order("id"));
}
export async function proposalsForPublication(pubId: number): Promise<Proposal[]> {
  return must<Proposal[]>(await db().from("proposals").select("*").eq("publication_id", pubId).order("id"));
}
export async function getProposal(id: number): Promise<Proposal | undefined> {
  return must<Proposal[]>(await db().from("proposals").select("*").eq("id", id))[0];
}
export async function pendingProposalsCount(): Promise<number> {
  const { count, error } = await db().from("proposals").select("*", { count: "exact", head: true }).eq("statut", "en_attente");
  if (error) throw new Error(error.message);
  return count ?? 0;
}
export async function listVersions(contentId: number): Promise<ContentVersion[]> {
  return must<ContentVersion[]>(
    await db().from("content_versions").select("*").eq("content_id", contentId).order("id", { ascending: false })
  );
}

// ---------- Tableau de bord ----------
export async function dashboardStats() {
  const count = async (table: string, filter?: [string, string]) => {
    let q = db().from(table).select("*", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    const { count: n, error } = await q;
    if (error) throw new Error(error.message);
    return n ?? 0;
  };
  const [professions, themes, contents, studies, publications, pendingProposals, unanalyzedPublications] =
    await Promise.all([
      db().from("professions").select("*", { count: "exact", head: true }).eq("archived", 0).then(({ count: n }) => n ?? 0),
      count("themes"),
      count("contents"),
      count("studies"),
      count("publications"),
      count("proposals", ["statut", "en_attente"]),
      count("publications", ["statut", "nouvelle"]),
    ]);
  return { professions, themes, contents, studies, publications, pendingProposals, unanalyzedPublications };
}

/** Détection des « trous » : couples profession × thématique sans contenu (thématique répandue ailleurs). */
export async function coverageGaps(): Promise<Array<{ profession: string; theme: string }>> {
  const [professions, themes, contents] = await Promise.all([
    listProfessions(), listThemes(),
    must<Array<{ profession_id: number; theme_id: number }>>(await db().from("contents").select("profession_id, theme_id")),
  ]);
  const covered = new Set(contents.map((c) => `${c.profession_id}|${c.theme_id}`));
  const spread: Record<number, Set<number>> = {};
  for (const c of contents) (spread[c.theme_id] ??= new Set()).add(c.profession_id);
  const gaps: Array<{ profession: string; theme: string }> = [];
  for (const p of professions) {
    for (const t of themes) {
      if (!covered.has(`${p.id}|${t.id}`) && (spread[t.id]?.size ?? 0) >= 4) {
        gaps.push({ profession: p.name, theme: t.name });
      }
    }
  }
  return gaps;
}

/** Contenus faiblement sourcés (0 ou 1 référence). */
export async function weaklySourcedContents(): Promise<ContentFull[]> {
  const [contents, refs] = await Promise.all([
    listContents(),
    must<Array<{ content_id: number }>>(await db().from("content_refs").select("content_id")),
  ]);
  const counts: Record<number, number> = {};
  for (const r of refs) counts[r.content_id] = (counts[r.content_id] ?? 0) + 1;
  return contents.filter((c) => (counts[c.id] ?? 0) <= 1);
}

export async function contentCountByProfession(): Promise<Record<number, number>> {
  const rows = must<Array<{ profession_id: number }>>(await db().from("contents").select("profession_id"));
  const out: Record<number, number> = {};
  for (const r of rows) out[r.profession_id] = (out[r.profession_id] ?? 0) + 1;
  return out;
}
export async function contentCountByTheme(): Promise<Record<number, number>> {
  const rows = must<Array<{ theme_id: number }>>(await db().from("contents").select("theme_id"));
  const out: Record<number, number> = {};
  for (const r of rows) out[r.theme_id] = (out[r.theme_id] ?? 0) + 1;
  return out;
}

export interface RecentVersion {
  id: number; created_at: string; reason: string; changed_by: string; publication_id: number | null;
  content_id: number; titre: string; profession_name: string; theme_label: string;
}
export async function recentVersions(limit = 8): Promise<RecentVersion[]> {
  return must<RecentVersion[]>(
    await db().from("v_recent_versions").select("*").order("id", { ascending: false }).limit(limit)
  );
}
