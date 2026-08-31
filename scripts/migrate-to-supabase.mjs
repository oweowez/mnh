#!/usr/bin/env node
/**
 * Migre le contenu éditorial vers Supabase Postgres.
 * Prérequis : supabase/schema.sql exécuté dans le projet.
 * Source : data/mnh.db (SQLite) si présent, sinon data/seed.json.
 *   node scripts/migrate-to-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
for (const line of fs.readFileSync(path.join(root, ".env"), "utf-8").split("\n")) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const must = ({ data, error }) => { if (error) { console.error("Erreur Supabase :", error.message); process.exit(1); } return data; };

// La cible doit être vide
{
  const { count, error } = await supa.from("professions").select("*", { count: "exact", head: true });
  if (error) { console.error("Schéma absent ? Exécutez d'abord supabase/schema.sql —", error.message); process.exit(1); }
  if (count > 0) { console.error(`La base Supabase contient déjà ${count} profession(s). Videz les tables avant de migrer.`); process.exit(1); }
}

async function insertAll(table, rows) {
  for (let i = 0; i < rows.length; i += 200) must(await supa.from(table).insert(rows.slice(i, i + 200)).select("*"));
  console.log(`  ${table} : ${rows.length}`);
}

const dbPath = path.join(root, "data", "mnh.db");
if (fs.existsSync(dbPath)) {
  console.log("Source : data/mnh.db (SQLite)");
  const { default: Database } = await import("better-sqlite3");
  const db = new Database(dbPath, { readonly: true });
  const all = (sql) => db.prepare(sql).all();
  await insertAll("professions", all("SELECT * FROM professions"));
  await insertAll("themes", all("SELECT * FROM themes"));
  await insertAll("studies", all("SELECT * FROM studies"));
  await insertAll("contents", all("SELECT * FROM contents"));
  await insertAll("content_refs", all("SELECT * FROM content_refs"));
  await insertAll("study_professions", all("SELECT * FROM study_professions"));
  await insertAll("study_themes", all("SELECT * FROM study_themes"));
  await insertAll("pages", all("SELECT * FROM pages"));
  await insertAll("publications", all("SELECT * FROM publications"));
  await insertAll("proposals", all("SELECT * FROM proposals"));
  await insertAll("content_versions", all("SELECT * FROM content_versions"));
} else {
  console.log("Source : data/seed.json (installation neuve)");
  const seed = JSON.parse(fs.readFileSync(path.join(root, "data", "seed.json"), "utf-8"));
  const professions = must(await supa.from("professions").insert(seed.professions).select("*"));
  const themes = must(await supa.from("themes").insert(seed.themes).select("*"));
  const studies = must(await supa.from("studies").insert(seed.studies.map(({ ref_num, ...s }) => ({ ref_num, ...s }))).select("*"));
  console.log(`  professions : ${professions.length} | themes : ${themes.length} | studies : ${studies.length}`);
  const profIds = Object.fromEntries(professions.map((p) => [p.slug, p.id]));
  const themeIds = Object.fromEntries(themes.map((t) => [t.slug, t.id]));
  const studyIds = Object.fromEntries(studies.map((s) => [s.ref_num, s.id]));
  const refs = [], sp = new Set(), st = new Set();
  for (const c of seed.contents) {
    const pid = profIds[c.profession], tid = themeIds[c.theme];
    const inserted = must(await supa.from("contents").insert({
      profession_id: pid, theme_id: tid, ordre: c.ordre, display_theme_label: c.display_theme_label,
      titre: c.titre, message_cle: c.message_cle, dev_court: c.dev_court, corps_web: c.corps_web,
      nuance: c.nuance, decideur: c.decideur, priorite: c.priorite,
    }).select("*").single());
    for (const n of c.refs) {
      if (!studyIds[n]) continue;
      refs.push({ content_id: inserted.id, study_id: studyIds[n] });
      sp.add(`${studyIds[n]}|${pid}`); st.add(`${studyIds[n]}|${tid}`);
    }
  }
  await insertAll("content_refs", refs);
  await insertAll("study_professions", [...sp].map((k) => { const [study_id, profession_id] = k.split("|").map(Number); return { study_id, profession_id }; }));
  await insertAll("study_themes", [...st].map((k) => { const [study_id, theme_id] = k.split("|").map(Number); return { study_id, theme_id }; }));
  await insertAll("pages", seed.pages);
}

must(await supa.rpc("fix_sequences"));
console.log("Séquences resynchronisées.");
const { count } = await supa.from("contents").select("*", { count: "exact", head: true });
console.log(`✔ Migration terminée — ${count} contenus dans Supabase.`);
