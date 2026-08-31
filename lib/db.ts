import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "mnh.db");
const SEED_PATH = path.join(process.cwd(), "data", "seed.json");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS professions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_desc TEXT DEFAULT '',
  ordre INTEGER DEFAULT 0,
  visible INTEGER DEFAULT 1,
  archived INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS themes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  ordre INTEGER DEFAULT 0,
  visible INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS studies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  ref_num INTEGER,
  name TEXT NOT NULL,
  full_title TEXT DEFAULT '',
  team TEXT DEFAULT '',
  type TEXT DEFAULT '',
  date_label TEXT DEFAULT '',
  resume TEXT DEFAULT '',
  url TEXT DEFAULT '',
  statut TEXT DEFAULT 'publie'
);
CREATE TABLE IF NOT EXISTS contents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profession_id INTEGER NOT NULL REFERENCES professions(id),
  theme_id INTEGER NOT NULL REFERENCES themes(id),
  ordre INTEGER DEFAULT 0,
  display_theme_label TEXT DEFAULT '',
  titre TEXT DEFAULT '',
  message_cle TEXT DEFAULT '',
  dev_court TEXT DEFAULT '',
  corps_web TEXT DEFAULT '',
  nuance TEXT DEFAULT '',
  decideur TEXT DEFAULT '',
  priorite TEXT DEFAULT '',
  statut TEXT DEFAULT 'publie',
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS content_refs (
  content_id INTEGER NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  study_id INTEGER NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, study_id)
);
CREATE TABLE IF NOT EXISTS study_professions (
  study_id INTEGER NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  profession_id INTEGER NOT NULL REFERENCES professions(id) ON DELETE CASCADE,
  PRIMARY KEY (study_id, profession_id)
);
CREATE TABLE IF NOT EXISTS study_themes (
  study_id INTEGER NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  theme_id INTEGER NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  PRIMARY KEY (study_id, theme_id)
);
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT DEFAULT '',
  body TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT DEFAULT '',
  source_type TEXT DEFAULT 'manuel',
  source_ref TEXT DEFAULT '',
  raw_text TEXT DEFAULT '',
  file_path TEXT DEFAULT '',
  statut TEXT DEFAULT 'nouvelle',
  analysis TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS proposals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  content_id INTEGER REFERENCES contents(id),
  profession_id INTEGER REFERENCES professions(id),
  theme_id INTEGER REFERENCES themes(id),
  kind TEXT NOT NULL,
  titre TEXT DEFAULT '',
  current_text TEXT DEFAULT '',
  proposed_text TEXT DEFAULT '',
  rationale TEXT DEFAULT '',
  source_excerpt TEXT DEFAULT '',
  statut TEXT DEFAULT 'en_attente',
  decided_by TEXT DEFAULT '',
  decided_at TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS content_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id INTEGER NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  snapshot TEXT NOT NULL,
  reason TEXT DEFAULT '',
  changed_by TEXT DEFAULT '',
  publication_id INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
`;

function seedIfEmpty(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) AS n FROM professions").get() as { n: number }).n;
  if (count > 0) return;
  if (!fs.existsSync(SEED_PATH)) return;
  const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"));

  const insertProf = db.prepare(
    "INSERT INTO professions (slug, name, short_desc, ordre) VALUES (@slug, @name, @short_desc, @ordre)"
  );
  const insertTheme = db.prepare(
    "INSERT INTO themes (slug, name, description, ordre) VALUES (@slug, @name, @description, @ordre)"
  );
  const insertStudy = db.prepare(
    "INSERT INTO studies (slug, ref_num, name, full_title, team, type, date_label, resume) VALUES (@slug, @ref_num, @name, @full_title, @team, @type, @date_label, @resume)"
  );
  const insertContent = db.prepare(
    `INSERT INTO contents (profession_id, theme_id, ordre, display_theme_label, titre, message_cle, dev_court, corps_web, nuance, decideur, priorite)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertRef = db.prepare("INSERT OR IGNORE INTO content_refs (content_id, study_id) VALUES (?, ?)");
  const insertSP = db.prepare("INSERT OR IGNORE INTO study_professions (study_id, profession_id) VALUES (?, ?)");
  const insertST = db.prepare("INSERT OR IGNORE INTO study_themes (study_id, theme_id) VALUES (?, ?)");
  const insertPage = db.prepare("INSERT INTO pages (slug, title, body) VALUES (@slug, @title, @body)");

  const tx = db.transaction(() => {
    const profIds: Record<string, number> = {};
    const themeIds: Record<string, number> = {};
    const studyIds: Record<number, number> = {};
    for (const p of seed.professions) profIds[p.slug] = Number(insertProf.run(p).lastInsertRowid);
    for (const t of seed.themes) themeIds[t.slug] = Number(insertTheme.run(t).lastInsertRowid);
    for (const s of seed.studies) studyIds[s.ref_num] = Number(insertStudy.run(s).lastInsertRowid);
    for (const c of seed.contents) {
      const pid = profIds[c.profession];
      const tid = themeIds[c.theme];
      const cid = Number(
        insertContent.run(pid, tid, c.ordre, c.display_theme_label, c.titre, c.message_cle,
          c.dev_court, c.corps_web, c.nuance, c.decideur, c.priorite).lastInsertRowid
      );
      for (const refNum of c.refs) {
        const sid = studyIds[refNum];
        if (!sid) continue;
        insertRef.run(cid, sid);
        insertSP.run(sid, pid);
        insertST.run(sid, tid);
      }
    }
    for (const pg of seed.pages) insertPage.run(pg);
  });
  tx();
}

declare global {
  // eslint-disable-next-line no-var
  var __mnhDb: Database.Database | undefined;
}

export function getDb(): Database.Database {
  if (globalThis.__mnhDb) return globalThis.__mnhDb;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  seedIfEmpty(db);
  globalThis.__mnhDb = db;
  return db;
}
