import { getDb } from "./db";

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
  profession_slug: string; profession_name: string; theme_slug: string; theme_name: string;
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

// ---------- Public ----------
export function listProfessions(includeHidden = false): Profession[] {
  const where = includeHidden ? "archived = 0" : "visible = 1 AND archived = 0";
  return getDb().prepare(`SELECT * FROM professions WHERE ${where} ORDER BY ordre`).all() as Profession[];
}
export function getProfession(slug: string): Profession | undefined {
  return getDb().prepare("SELECT * FROM professions WHERE slug = ?").get(slug) as Profession | undefined;
}
export function listThemes(includeHidden = false): Theme[] {
  const where = includeHidden ? "1=1" : "visible = 1";
  return getDb().prepare(`SELECT * FROM themes WHERE ${where} ORDER BY ordre`).all() as Theme[];
}
export function getTheme(slug: string): Theme | undefined {
  return getDb().prepare("SELECT * FROM themes WHERE slug = ?").get(slug) as Theme | undefined;
}
export function contentsForProfession(professionId: number, publishedOnly = true): ContentFull[] {
  return getDb().prepare(
    `SELECT c.*, p.slug AS profession_slug, p.name AS profession_name, t.slug AS theme_slug, t.name AS theme_name
     FROM contents c JOIN professions p ON p.id = c.profession_id JOIN themes t ON t.id = c.theme_id
     WHERE c.profession_id = ? ${publishedOnly ? "AND c.statut = 'publie'" : ""} ORDER BY c.ordre`
  ).all(professionId) as ContentFull[];
}
export function contentsForTheme(themeId: number): ContentFull[] {
  return getDb().prepare(
    `SELECT c.*, p.slug AS profession_slug, p.name AS profession_name, t.slug AS theme_slug, t.name AS theme_name
     FROM contents c JOIN professions p ON p.id = c.profession_id JOIN themes t ON t.id = c.theme_id
     WHERE c.theme_id = ? AND c.statut = 'publie' AND p.visible = 1 AND p.archived = 0 ORDER BY p.ordre`
  ).all(themeId) as ContentFull[];
}
export function getContent(id: number): ContentFull | undefined {
  return getDb().prepare(
    `SELECT c.*, p.slug AS profession_slug, p.name AS profession_name, t.slug AS theme_slug, t.name AS theme_name
     FROM contents c JOIN professions p ON p.id = c.profession_id JOIN themes t ON t.id = c.theme_id WHERE c.id = ?`
  ).get(id) as ContentFull | undefined;
}
export function listContents(): ContentFull[] {
  return getDb().prepare(
    `SELECT c.*, p.slug AS profession_slug, p.name AS profession_name, t.slug AS theme_slug, t.name AS theme_name
     FROM contents c JOIN professions p ON p.id = c.profession_id JOIN themes t ON t.id = c.theme_id
     ORDER BY p.ordre, c.ordre`
  ).all() as ContentFull[];
}
export function refsForContent(contentId: number): Study[] {
  return getDb().prepare(
    `SELECT s.* FROM studies s JOIN content_refs r ON r.study_id = s.id WHERE r.content_id = ? ORDER BY s.ref_num`
  ).all(contentId) as Study[];
}
export function listStudies(publishedOnly = true): Study[] {
  return getDb().prepare(
    `SELECT * FROM studies ${publishedOnly ? "WHERE statut != 'archive'" : ""} ORDER BY ref_num, name`
  ).all() as Study[];
}
export function getStudy(slug: string): Study | undefined {
  return getDb().prepare("SELECT * FROM studies WHERE slug = ?").get(slug) as Study | undefined;
}
export function getStudyById(id: number): Study | undefined {
  return getDb().prepare("SELECT * FROM studies WHERE id = ?").get(id) as Study | undefined;
}
export function professionsForStudy(studyId: number): Profession[] {
  return getDb().prepare(
    `SELECT p.* FROM professions p JOIN study_professions sp ON sp.profession_id = p.id
     WHERE sp.study_id = ? AND p.visible = 1 ORDER BY p.ordre`
  ).all(studyId) as Profession[];
}
export function themesForStudy(studyId: number): Theme[] {
  return getDb().prepare(
    `SELECT t.* FROM themes t JOIN study_themes st ON st.theme_id = t.id
     WHERE st.study_id = ? ORDER BY t.ordre`
  ).all(studyId) as Theme[];
}
export function studiesForProfession(professionId: number): Study[] {
  return getDb().prepare(
    `SELECT s.* FROM studies s JOIN study_professions sp ON sp.study_id = s.id
     WHERE sp.profession_id = ? ORDER BY s.ref_num`
  ).all(professionId) as Study[];
}
export function studiesForTheme(themeId: number): Study[] {
  return getDb().prepare(
    `SELECT s.* FROM studies s JOIN study_themes st ON st.study_id = s.id
     WHERE st.theme_id = ? ORDER BY s.ref_num`
  ).all(themeId) as Study[];
}
export function getPage(slug: string): Page | undefined {
  return getDb().prepare("SELECT * FROM pages WHERE slug = ?").get(slug) as Page | undefined;
}
export function listPages(): Page[] {
  return getDb().prepare("SELECT * FROM pages ORDER BY id").all() as Page[];
}

export interface SearchResults {
  contents: ContentFull[];
  studies: Study[];
  professions: Profession[];
  themes: Theme[];
}
export function search(q: string): SearchResults {
  const like = `%${q}%`;
  const db = getDb();
  return {
    contents: db.prepare(
      `SELECT c.*, p.slug AS profession_slug, p.name AS profession_name, t.slug AS theme_slug, t.name AS theme_name
       FROM contents c JOIN professions p ON p.id = c.profession_id JOIN themes t ON t.id = c.theme_id
       WHERE c.statut = 'publie' AND (c.titre LIKE ? OR c.corps_web LIKE ? OR c.message_cle LIKE ? OR c.decideur LIKE ?)
       ORDER BY p.ordre, c.ordre LIMIT 30`
    ).all(like, like, like, like) as ContentFull[],
    studies: db.prepare(
      `SELECT * FROM studies WHERE name LIKE ? OR full_title LIKE ? OR resume LIKE ? OR team LIKE ? LIMIT 20`
    ).all(like, like, like, like) as Study[],
    professions: db.prepare(`SELECT * FROM professions WHERE name LIKE ? AND visible = 1 LIMIT 10`).all(like) as Profession[],
    themes: db.prepare(`SELECT * FROM themes WHERE name LIKE ? OR description LIKE ? LIMIT 10`).all(like, like) as Theme[],
  };
}

// ---------- Admin : publications & propositions ----------
export function listPublications(): Publication[] {
  return getDb().prepare("SELECT * FROM publications ORDER BY id DESC").all() as Publication[];
}
export function getPublication(id: number): Publication | undefined {
  return getDb().prepare("SELECT * FROM publications WHERE id = ?").get(id) as Publication | undefined;
}
export function proposalsForPublication(pubId: number): Proposal[] {
  return getDb().prepare("SELECT * FROM proposals WHERE publication_id = ? ORDER BY id").all(pubId) as Proposal[];
}
export function getProposal(id: number): Proposal | undefined {
  return getDb().prepare("SELECT * FROM proposals WHERE id = ?").get(id) as Proposal | undefined;
}
export function pendingProposalsCount(): number {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM proposals WHERE statut = 'en_attente'").get() as { n: number }).n;
}
export function listVersions(contentId: number) {
  return getDb().prepare(
    "SELECT * FROM content_versions WHERE content_id = ? ORDER BY id DESC"
  ).all(contentId) as Array<{ id: number; content_id: number; snapshot: string; reason: string; changed_by: string; publication_id: number | null; created_at: string }>;
}

// ---------- Dashboard : statistiques & suggestions ----------
export function dashboardStats() {
  const db = getDb();
  const n = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  return {
    professions: n("SELECT COUNT(*) AS n FROM professions WHERE archived = 0"),
    themes: n("SELECT COUNT(*) AS n FROM themes"),
    contents: n("SELECT COUNT(*) AS n FROM contents"),
    studies: n("SELECT COUNT(*) AS n FROM studies"),
    publications: n("SELECT COUNT(*) AS n FROM publications"),
    pendingProposals: n("SELECT COUNT(*) AS n FROM proposals WHERE statut = 'en_attente'"),
    unanalyzedPublications: n("SELECT COUNT(*) AS n FROM publications WHERE statut = 'nouvelle'"),
  };
}

/** Détection des « trous » éditoriaux : couples profession × thématique sans contenu. */
export function coverageGaps(): Array<{ profession: string; theme: string; covered: number }> {
  const db = getDb();
  const rows = db.prepare(
    `SELECT p.name AS profession, t.name AS theme,
       (SELECT COUNT(*) FROM contents c WHERE c.profession_id = p.id AND c.theme_id = t.id) AS covered,
       (SELECT COUNT(DISTINCT c2.profession_id) FROM contents c2 WHERE c2.theme_id = t.id) AS spread
     FROM professions p CROSS JOIN themes t
     WHERE p.archived = 0 AND p.visible = 1 AND t.visible = 1`
  ).all() as Array<{ profession: string; theme: string; covered: number; spread: number }>;
  return rows.filter((r) => r.covered === 0 && r.spread >= 4).map(({ profession, theme, covered }) => ({ profession, theme, covered }));
}

/** Contenus faiblement sourcés (0 ou 1 référence). */
export function weaklySourcedContents(): ContentFull[] {
  return getDb().prepare(
    `SELECT c.*, p.slug AS profession_slug, p.name AS profession_name, t.slug AS theme_slug, t.name AS theme_name
     FROM contents c JOIN professions p ON p.id = c.profession_id JOIN themes t ON t.id = c.theme_id
     WHERE (SELECT COUNT(*) FROM content_refs r WHERE r.content_id = c.id) <= 1
     ORDER BY p.ordre, c.ordre`
  ).all() as ContentFull[];
}

// ---------- Utilisateurs ----------
export interface User {
  id: number; email: string; name: string; role: string;
  created_at: string; validated_by: number | null; validated_at: string | null;
}
export function listUsers(): Array<User & { validated_by_email: string | null }> {
  return getDb().prepare(
    `SELECT u.id, u.email, u.name, u.role, u.created_at, u.validated_by, u.validated_at,
            v.email AS validated_by_email
     FROM users u LEFT JOIN users v ON v.id = u.validated_by
     ORDER BY CASE u.role WHEN 'pending' THEN 0 WHEN 'superadmin' THEN 1 WHEN 'admin' THEN 2 ELSE 3 END, u.created_at DESC`
  ).all() as Array<User & { validated_by_email: string | null }>;
}
export function pendingUsersCount(): number {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'pending'").get() as { n: number }).n;
}
