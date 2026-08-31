#!/usr/bin/env node
/**
 * Nomme un super-administrateur (bootstrap) — agit sur Supabase Auth.
 *   node scripts/promote.mjs                  → liste les comptes
 *   node scripts/promote.mjs email@exemple.fr → passe ce compte super-admin
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
// Charge .env (sans dépendance)
for (const line of fs.readFileSync(path.join(here, "..", ".env"), "utf-8").split("\n")) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const email = process.argv[2]?.trim().toLowerCase();

const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
if (error) { console.error("Erreur Supabase :", error.message); process.exit(1); }

if (!email) {
  if (data.users.length === 0) {
    console.log("Aucun compte. Créez d'abord une inscription sur /admin/inscription.");
  } else {
    console.table(data.users.map((u) => ({ email: u.email, nom: u.user_metadata?.name ?? "", role: u.app_metadata?.role ?? "pending" })));
    console.log("Usage : node scripts/promote.mjs <email>");
  }
  process.exit(0);
}

const user = data.users.find((u) => u.email?.toLowerCase() === email);
if (!user) { console.error(`Aucun compte trouvé pour ${email}. Inscrivez-vous d'abord sur /admin/inscription.`); process.exit(1); }
const { error: err2 } = await admin.auth.admin.updateUserById(user.id, {
  app_metadata: { role: "superadmin", validated_by: "bootstrap", validated_at: new Date().toISOString() },
});
if (err2) { console.error("Erreur :", err2.message); process.exit(1); }
console.log(`✔ ${email} est maintenant super-administrateur.`);
