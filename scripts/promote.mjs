#!/usr/bin/env node
/**
 * Nomme un super-administrateur directement en base (bootstrap).
 *   node scripts/promote.mjs                  → liste les comptes
 *   node scripts/promote.mjs email@exemple.fr → passe ce compte super-admin
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(here, "..", "data", "mnh.db"));
const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  const users = db.prepare("SELECT id, email, name, role, created_at FROM users ORDER BY id").all();
  if (users.length === 0) {
    console.log("Aucun compte. Créez d'abord une inscription sur /admin/inscription.");
  } else {
    console.table(users);
    console.log("Usage : node scripts/promote.mjs <email>");
  }
  process.exit(0);
}

const result = db.prepare(
  "UPDATE users SET role='superadmin', validated_at=datetime('now') WHERE email=?"
).run(email);
if (result.changes === 0) {
  console.error(`Aucun compte trouvé pour ${email}. Inscrivez-vous d'abord sur /admin/inscription.`);
  process.exit(1);
}
console.log(`✔ ${email} est maintenant super-administrateur.`);
