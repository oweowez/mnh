"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { getDb } from "@/lib/db";
import { signSession, requireAdmin, requireSuperAdmin, SESSION_COOKIE } from "@/lib/auth";
import { supabaseAdmin, supabasePublic, getUserById as getSupaUser, setUserRole } from "@/lib/supabase";
import { analyzePublication, generateProposals, type Analysis } from "@/lib/ai";
import { getContent, getPublication, getProposal, listContents, listProfessions, listThemes } from "@/lib/repo";

// ---------- Authentification ----------
export async function register(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect("/admin/inscription?error=champs");
  if (password.length < 8) redirect("/admin/inscription?error=motdepasse");
  const { error } = await supabaseAdmin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
    app_metadata: { role: "pending" },
  });
  if (error) {
    if (error.code === "email_exists" || /already|exists/i.test(error.message)) redirect("/admin/inscription?error=existe");
    redirect("/admin/inscription?error=serveur");
  }
  redirect("/admin/login?registered=1");
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const { data, error } = await supabasePublic().auth.signInWithPassword({ email, password });
  if (error || !data.user) redirect("/admin/login?error=identifiants");
  const role = (data.user.app_metadata?.role as string) ?? "pending";
  if (role === "pending") redirect("/admin/login?error=attente");
  if (role !== "admin" && role !== "superadmin") redirect("/admin/login?error=refuse");
  const session = signSession(data.user.id);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, session.value, { httpOnly: true, sameSite: "lax", path: "/", maxAge: session.maxAge });
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/");
}

// ---------- Gestion des inscriptions & des rôles (super-admins) ----------
function targetUserId(formData: FormData): string {
  return String(formData.get("user_id") ?? "");
}

async function changeRole(formData: FormData, from: string[], to: string) {
  const su = await requireSuperAdmin();
  const id = targetUserId(formData);
  if (id === su.id) redirect("/admin/utilisateurs?error=soimeme");
  const target = await getSupaUser(id);
  if (target && from.includes(target.role)) await setUserRole(id, to, su.email);
  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs");
}

export async function validateUser(formData: FormData) {
  await changeRole(formData, ["pending"], "admin");
}

export async function refuseUser(formData: FormData) {
  await changeRole(formData, ["pending"], "refuse");
}

export async function promoteUser(formData: FormData) {
  await changeRole(formData, ["admin"], "superadmin");
}

export async function demoteUser(formData: FormData) {
  await changeRole(formData, ["superadmin"], "admin");
}

export async function deleteUser(formData: FormData) {
  const su = await requireSuperAdmin();
  const id = targetUserId(formData);
  if (id === su.id) redirect("/admin/utilisateurs?error=soimeme");
  await supabaseAdmin().auth.admin.deleteUser(id);
  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs");
}

// ---------- Helpers ----------
function refreshPublic() {
  for (const p of ["/", "/comprendre", "/professions", "/recherches", "/recherche"]) revalidatePath(p);
  revalidatePath("/professions/[slug]", "page");
  revalidatePath("/thematiques/[slug]", "page");
  revalidatePath("/recherches/[slug]", "page");
}

function snapshotContent(contentId: number, reason: string, changedBy: string, publicationId?: number | null) {
  const db = getDb();
  const current = db.prepare("SELECT * FROM contents WHERE id = ?").get(contentId);
  if (!current) return;
  db.prepare(
    "INSERT INTO content_versions (content_id, snapshot, reason, changed_by, publication_id) VALUES (?, ?, ?, ?, ?)"
  ).run(contentId, JSON.stringify(current), reason, changedBy, publicationId ?? null);
}

// ---------- Professions ----------
export async function saveProfession(formData: FormData) {
  await requireAdmin();
  const db = getDb();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const data = {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    short_desc: String(formData.get("short_desc") ?? "").trim(),
    ordre: Number(formData.get("ordre") ?? 0),
    visible: formData.get("visible") ? 1 : 0,
    archived: formData.get("archived") ? 1 : 0,
  };
  if (!data.slug || !data.name) redirect("/admin/professions?error=champs");
  if (id) {
    db.prepare(
      "UPDATE professions SET slug=@slug, name=@name, short_desc=@short_desc, ordre=@ordre, visible=@visible, archived=@archived WHERE id=@id"
    ).run({ ...data, id });
  } else {
    db.prepare(
      "INSERT INTO professions (slug, name, short_desc, ordre, visible, archived) VALUES (@slug, @name, @short_desc, @ordre, @visible, @archived)"
    ).run(data);
  }
  refreshPublic();
  revalidatePath("/admin/professions");
  redirect("/admin/professions");
}

// ---------- Thématiques ----------
export async function saveTheme(formData: FormData) {
  await requireAdmin();
  const db = getDb();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const data = {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    ordre: Number(formData.get("ordre") ?? 0),
    visible: formData.get("visible") ? 1 : 0,
  };
  if (!data.slug || !data.name) redirect("/admin/thematiques?error=champs");
  if (id) {
    db.prepare(
      "UPDATE themes SET slug=@slug, name=@name, description=@description, ordre=@ordre, visible=@visible WHERE id=@id"
    ).run({ ...data, id });
  } else {
    db.prepare(
      "INSERT INTO themes (slug, name, description, ordre, visible) VALUES (@slug, @name, @description, @ordre, @visible)"
    ).run(data);
  }
  refreshPublic();
  revalidatePath("/admin/thematiques");
  redirect("/admin/thematiques");
}

// ---------- Contenus ----------
export async function saveContent(formData: FormData) {
  const user = await requireAdmin();
  const db = getDb();
  const id = Number(formData.get("id"));
  snapshotContent(id, "Modification manuelle", user.email);
  db.prepare(
    `UPDATE contents SET theme_id=@theme_id, ordre=@ordre, display_theme_label=@display_theme_label, titre=@titre,
       message_cle=@message_cle, dev_court=@dev_court, corps_web=@corps_web, nuance=@nuance, decideur=@decideur,
       priorite=@priorite, statut=@statut, updated_at=datetime('now') WHERE id=@id`
  ).run({
    id,
    theme_id: Number(formData.get("theme_id")),
    ordre: Number(formData.get("ordre") ?? 0),
    display_theme_label: String(formData.get("display_theme_label") ?? ""),
    titre: String(formData.get("titre") ?? ""),
    message_cle: String(formData.get("message_cle") ?? ""),
    dev_court: String(formData.get("dev_court") ?? ""),
    corps_web: String(formData.get("corps_web") ?? ""),
    nuance: String(formData.get("nuance") ?? ""),
    decideur: String(formData.get("decideur") ?? ""),
    priorite: String(formData.get("priorite") ?? ""),
    statut: String(formData.get("statut") ?? "publie"),
  });
  refreshPublic();
  revalidatePath(`/admin/contenus/${id}`);
  redirect(`/admin/contenus/${id}?saved=1`);
}

// ---------- Études ----------
export async function saveStudy(formData: FormData) {
  await requireAdmin();
  const db = getDb();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const data = {
    slug: String(formData.get("slug") ?? "").trim(),
    ref_num: formData.get("ref_num") ? Number(formData.get("ref_num")) : null,
    name: String(formData.get("name") ?? "").trim(),
    full_title: String(formData.get("full_title") ?? "").trim(),
    team: String(formData.get("team") ?? "").trim(),
    type: String(formData.get("type") ?? "").trim(),
    date_label: String(formData.get("date_label") ?? "").trim(),
    resume: String(formData.get("resume") ?? "").trim(),
    url: String(formData.get("url") ?? "").trim(),
    statut: String(formData.get("statut") ?? "publie"),
  };
  if (!data.slug || !data.name) redirect("/admin/etudes?error=champs");
  if (id) {
    db.prepare(
      `UPDATE studies SET slug=@slug, ref_num=@ref_num, name=@name, full_title=@full_title, team=@team, type=@type,
       date_label=@date_label, resume=@resume, url=@url, statut=@statut WHERE id=@id`
    ).run({ ...data, id });
  } else {
    db.prepare(
      `INSERT INTO studies (slug, ref_num, name, full_title, team, type, date_label, resume, url, statut)
       VALUES (@slug, @ref_num, @name, @full_title, @team, @type, @date_label, @resume, @url, @statut)`
    ).run(data);
  }
  refreshPublic();
  revalidatePath("/admin/etudes");
  redirect("/admin/etudes");
}

// ---------- Pages générales ----------
export async function savePage(formData: FormData) {
  await requireAdmin();
  const db = getDb();
  const id = Number(formData.get("id"));
  db.prepare("UPDATE pages SET title=@title, body=@body WHERE id=@id").run({
    id,
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
  });
  refreshPublic();
  revalidatePath("/admin/pages");
  redirect("/admin/pages?saved=1");
}

// ---------- Publications ----------
export async function createPublication(formData: FormData) {
  await requireAdmin();
  const db = getDb();
  const title = String(formData.get("title") ?? "").trim();
  const source_type = String(formData.get("source_type") ?? "manuel");
  const source_ref = String(formData.get("source_ref") ?? "").trim();
  const raw_text = String(formData.get("raw_text") ?? "").trim();
  let file_path = "";

  const pdf = formData.get("pdf");
  if (pdf && pdf instanceof File && pdf.size > 0) {
    const uploads = path.join(process.cwd(), "data", "uploads");
    fs.mkdirSync(uploads, { recursive: true });
    const safeName = `${Date.now()}-${pdf.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const buffer = Buffer.from(await pdf.arrayBuffer());
    fs.writeFileSync(path.join(uploads, safeName), buffer);
    file_path = path.join("data", "uploads", safeName);
  }

  const result = db.prepare(
    "INSERT INTO publications (title, source_type, source_ref, raw_text, file_path) VALUES (?, ?, ?, ?, ?)"
  ).run(title || source_ref || "Publication sans titre", source_type, source_ref, raw_text, file_path);
  revalidatePath("/admin/publications");
  redirect(`/admin/publications/${result.lastInsertRowid}`);
}

async function fetchUrlText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "MNH-Plateforme/1.0" } });
  const html = await res.text();
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 200000);
}

/** Workflow IA (brief §11–15) : analyse → extraction → comparaison → propositions. */
export async function runAnalysis(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const pub = getPublication(id);
  if (!pub) redirect("/admin/publications");

  const input: { rawText?: string; pdfBase64?: string; sourceRef?: string } = {};
  if (pub.file_path) {
    const abs = path.join(process.cwd(), pub.file_path);
    if (fs.existsSync(abs)) input.pdfBase64 = fs.readFileSync(abs).toString("base64");
  }
  if (pub.raw_text) input.rawText = pub.raw_text;
  if (pub.source_ref) input.sourceRef = pub.source_ref;
  if (!input.rawText && !input.pdfBase64 && pub.source_type === "lien" && pub.source_ref) {
    try {
      input.rawText = await fetchUrlText(pub.source_ref);
    } catch {
      redirect(`/admin/publications/${id}?error=${encodeURIComponent("Impossible de récupérer le contenu du lien. Collez le texte ou importez le PDF.")}`);
    }
  }
  if (!input.rawText && !input.pdfBase64) {
    redirect(`/admin/publications/${id}?error=${encodeURIComponent("Aucun contenu à analyser : collez le texte ou importez un PDF.")}`);
  }

  const professions = listProfessions(true);
  const themes = listThemes(true);
  const structure = {
    professions: professions.map((p) => ({ slug: p.slug, name: p.name })),
    themes: themes.map((t) => ({ slug: t.slug, name: t.name, description: t.description })),
  };

  let analysis: Analysis;
  try {
    analysis = await analyzePublication(input, structure);
  } catch (e) {
    redirect(`/admin/publications/${id}?error=${encodeURIComponent(e instanceof Error ? e.message : "Erreur d'analyse IA")}`);
    return;
  }

  const db = getDb();
  db.prepare("UPDATE publications SET analysis = ?, title = ?, statut = 'analysee' WHERE id = ?").run(
    JSON.stringify(analysis), analysis.titre || pub.title, id
  );

  // Comparaison avec les fiches existantes des professions × thématiques concernées
  const allContents = listContents();
  const concerned = allContents.filter(
    (c) => analysis.professions_concernees.includes(c.profession_slug) || analysis.themes_concernes.includes(c.theme_slug)
  );
  const scope = concerned.length > 0 ? concerned : allContents;

  try {
    const proposals = await generateProposals(input, analysis, scope.map((c) => ({
      id: c.id, profession_slug: c.profession_slug, profession_name: c.profession_name,
      theme_slug: c.theme_slug, theme_name: c.theme_name, titre: c.titre, corps_web: c.corps_web, nuance: c.nuance,
    })));

    const profBySlug = new Map(professions.map((p) => [p.slug, p.id]));
    const themeBySlug = new Map(themes.map((t) => [t.slug, t.id]));
    // Une relance d'analyse remplace les propositions encore en attente
    db.prepare("DELETE FROM proposals WHERE publication_id = ? AND statut = 'en_attente'").run(id);
    const insert = db.prepare(
      `INSERT INTO proposals (publication_id, content_id, profession_id, theme_id, kind, titre, current_text, proposed_text, rationale, source_excerpt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const p of proposals) {
      let contentId = p.content_id;
      let current = "";
      if (contentId) {
        const c = getContent(contentId);
        if (c) current = c.corps_web;
        else contentId = null;
      }
      insert.run(
        id, contentId,
        p.profession_slug ? profBySlug.get(p.profession_slug) ?? null : null,
        p.theme_slug ? themeBySlug.get(p.theme_slug) ?? null : null,
        p.kind, p.titre, current, p.proposed_text, p.rationale, p.source_excerpt
      );
    }
  } catch (e) {
    redirect(`/admin/publications/${id}?error=${encodeURIComponent(e instanceof Error ? e.message : "Erreur lors de la génération des propositions")}`);
  }

  revalidatePath(`/admin/publications/${id}`);
  redirect(`/admin/publications/${id}`);
}

/** Validation humaine (brief §13, §16) : accepter / modifier / refuser une proposition IA. */
export async function decideProposal(formData: FormData) {
  const user = await requireAdmin();
  const db = getDb();
  const proposalId = Number(formData.get("proposal_id"));
  const decision = String(formData.get("decision"));
  const editedText = String(formData.get("edited_text") ?? "").trim();
  const proposal = getProposal(proposalId);
  if (!proposal) {
    redirect("/admin/publications");
    return;
  }
  const pubId = proposal.publication_id;

  if (decision === "refuser") {
    db.prepare("UPDATE proposals SET statut='refuse', decided_by=?, decided_at=datetime('now') WHERE id=?").run(user.email, proposalId);
  } else if (decision === "accepter") {
    const finalText = editedText || proposal.proposed_text;
    const statut = editedText && editedText !== proposal.proposed_text ? "modifie" : "accepte";
    if (proposal.kind === "enrichissement" && proposal.content_id) {
      snapshotContent(proposal.content_id, `Enrichissement via publication #${pubId}`, user.email, pubId);
      db.prepare("UPDATE contents SET corps_web = ?, updated_at = datetime('now') WHERE id = ?").run(finalText, proposal.content_id);
    } else if (proposal.kind === "nouvelle_information" && proposal.profession_id && proposal.theme_id) {
      const maxOrdre = (db.prepare("SELECT COALESCE(MAX(ordre), 0) AS m FROM contents WHERE profession_id = ?").get(proposal.profession_id) as { m: number }).m;
      const theme = db.prepare("SELECT name FROM themes WHERE id = ?").get(proposal.theme_id) as { name: string } | undefined;
      const result = db.prepare(
        `INSERT INTO contents (profession_id, theme_id, ordre, display_theme_label, titre, corps_web, statut)
         VALUES (?, ?, ?, ?, ?, ?, 'publie')`
      ).run(proposal.profession_id, proposal.theme_id, maxOrdre + 1, theme?.name ?? "", proposal.titre, finalText);
      snapshotContent(Number(result.lastInsertRowid), `Création via publication #${pubId}`, user.email, pubId);
    }
    db.prepare("UPDATE proposals SET statut=?, proposed_text=?, decided_by=?, decided_at=datetime('now') WHERE id=?").run(statut, finalText, user.email, proposalId);
  }

  // Si plus aucune proposition en attente, la publication passe en statut « intégrée »
  const pending = (db.prepare("SELECT COUNT(*) AS n FROM proposals WHERE publication_id = ? AND statut = 'en_attente'").get(pubId) as { n: number }).n;
  if (pending === 0) db.prepare("UPDATE publications SET statut = 'integree' WHERE id = ?").run(pubId);

  refreshPublic();
  revalidatePath(`/admin/publications/${pubId}`);
  redirect(`/admin/publications/${pubId}`);
}
