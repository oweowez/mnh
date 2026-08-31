"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { signSession, requireAdmin, requireSuperAdmin, SESSION_COOKIE } from "@/lib/auth";
import { supabaseAdmin, supabasePublic, getUserById as getSupaUser, setUserRole } from "@/lib/supabase";
import { analyzePublication, generateProposals, type Analysis } from "@/lib/ai";
import { getContent, getPublication, getProposal, listContents, listProfessions, listThemes } from "@/lib/repo";

/** Client Postgres (service_role). */
function db() {
  return supabaseAdmin();
}

function must<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(`Supabase : ${error.message}`);
  return data as T;
}

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

async function snapshotContent(contentId: number, reason: string, changedBy: string, publicationId?: number | null) {
  const current = must(await db().from("contents").select("*").eq("id", contentId))[0];
  if (!current) return;
  must(await db().from("content_versions").insert({
    content_id: contentId,
    snapshot: JSON.stringify(current),
    reason,
    changed_by: changedBy,
    publication_id: publicationId ?? null,
  }).select("id"));
}

// ---------- Professions ----------
export async function saveProfession(formData: FormData) {
  await requireAdmin();
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
  if (id) must(await db().from("professions").update(data).eq("id", id).select("id"));
  else must(await db().from("professions").insert(data).select("id"));
  refreshPublic();
  revalidatePath("/admin/professions");
  redirect("/admin/professions");
}

// ---------- Thématiques ----------
export async function saveTheme(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const data = {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    ordre: Number(formData.get("ordre") ?? 0),
    visible: formData.get("visible") ? 1 : 0,
  };
  if (!data.slug || !data.name) redirect("/admin/thematiques?error=champs");
  if (id) must(await db().from("themes").update(data).eq("id", id).select("id"));
  else must(await db().from("themes").insert(data).select("id"));
  refreshPublic();
  revalidatePath("/admin/thematiques");
  redirect("/admin/thematiques");
}

// ---------- Contenus ----------
export async function saveContent(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id"));
  await snapshotContent(id, "Modification manuelle", user.email);
  must(await db().from("contents").update({
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
    updated_at: new Date().toISOString(),
  }).eq("id", id).select("id"));
  refreshPublic();
  revalidatePath(`/admin/contenus/${id}`);
  redirect(`/admin/contenus/${id}?saved=1`);
}

// ---------- Études ----------
export async function saveStudy(formData: FormData) {
  await requireAdmin();
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
  if (id) must(await db().from("studies").update(data).eq("id", id).select("id"));
  else must(await db().from("studies").insert(data).select("id"));
  refreshPublic();
  revalidatePath("/admin/etudes");
  redirect("/admin/etudes");
}

// ---------- Pages générales ----------
export async function savePage(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  must(await db().from("pages").update({
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
  }).eq("id", id).select("id"));
  refreshPublic();
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${id}?saved=1`);
}

// ---------- Publications ----------
export async function createPublication(formData: FormData) {
  await requireAdmin();
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

  const inserted = must(await db().from("publications").insert({
    title: title || source_ref || "Publication sans titre",
    source_type, source_ref, raw_text, file_path,
  }).select("id").single()) as { id: number };
  revalidatePath("/admin/publications");
  redirect(`/admin/publications/${inserted.id}`);
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
  const pub = await getPublication(id);
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

  const professions = await listProfessions(true);
  const themes = await listThemes(true);
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

  must(await db().from("publications").update({
    analysis: JSON.stringify(analysis),
    title: analysis.titre || pub.title,
    statut: "analysee",
  }).eq("id", id).select("id"));

  // Comparaison avec les fiches existantes des professions × thématiques concernées
  const allContents = await listContents();
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
    must(await db().from("proposals").delete().eq("publication_id", id).eq("statut", "en_attente").select("id"));
    const rows = [];
    for (const p of proposals) {
      let contentId = p.content_id;
      let current = "";
      if (contentId) {
        const c = await getContent(contentId);
        if (c) current = c.corps_web;
        else contentId = null;
      }
      rows.push({
        publication_id: id,
        content_id: contentId,
        profession_id: p.profession_slug ? profBySlug.get(p.profession_slug) ?? null : null,
        theme_id: p.theme_slug ? themeBySlug.get(p.theme_slug) ?? null : null,
        kind: p.kind, titre: p.titre, current_text: current, proposed_text: p.proposed_text,
        rationale: p.rationale, source_excerpt: p.source_excerpt,
      });
    }
    if (rows.length > 0) must(await db().from("proposals").insert(rows).select("id"));
  } catch (e) {
    redirect(`/admin/publications/${id}?error=${encodeURIComponent(e instanceof Error ? e.message : "Erreur lors de la génération des propositions")}`);
  }

  revalidatePath(`/admin/publications/${id}`);
  redirect(`/admin/publications/${id}`);
}

/** Validation humaine (brief §13, §16) : accepter / modifier / refuser une proposition IA. */
export async function decideProposal(formData: FormData) {
  const user = await requireAdmin();
  const proposalId = Number(formData.get("proposal_id"));
  const decision = String(formData.get("decision"));
  const editedText = String(formData.get("edited_text") ?? "").trim();
  const proposal = await getProposal(proposalId);
  if (!proposal) {
    redirect("/admin/publications");
    return;
  }
  const pubId = proposal.publication_id;
  const now = new Date().toISOString();

  if (decision === "refuser") {
    must(await db().from("proposals").update({ statut: "refuse", decided_by: user.email, decided_at: now }).eq("id", proposalId).select("id"));
  } else if (decision === "accepter") {
    const finalText = editedText || proposal.proposed_text;
    const statut = editedText && editedText !== proposal.proposed_text ? "modifie" : "accepte";
    if (proposal.kind === "enrichissement" && proposal.content_id) {
      await snapshotContent(proposal.content_id, `Enrichissement via publication #${pubId}`, user.email, pubId);
      must(await db().from("contents").update({ corps_web: finalText, updated_at: now }).eq("id", proposal.content_id).select("id"));
    } else if (proposal.kind === "nouvelle_information" && proposal.profession_id && proposal.theme_id) {
      const existing = must(await db().from("contents").select("ordre").eq("profession_id", proposal.profession_id)) as Array<{ ordre: number }>;
      const maxOrdre = existing.reduce((m, r) => Math.max(m, r.ordre), 0);
      const theme = must(await db().from("themes").select("name").eq("id", proposal.theme_id))[0] as { name: string } | undefined;
      const inserted = must(await db().from("contents").insert({
        profession_id: proposal.profession_id,
        theme_id: proposal.theme_id,
        ordre: maxOrdre + 1,
        display_theme_label: theme?.name ?? "",
        titre: proposal.titre,
        corps_web: finalText,
        statut: "publie",
      }).select("id").single()) as { id: number };
      await snapshotContent(inserted.id, `Création via publication #${pubId}`, user.email, pubId);
    }
    must(await db().from("proposals").update({ statut, proposed_text: finalText, decided_by: user.email, decided_at: now }).eq("id", proposalId).select("id"));
  }

  // Si plus aucune proposition en attente, la publication passe en statut « intégrée »
  const { count } = await db().from("proposals").select("*", { count: "exact", head: true })
    .eq("publication_id", pubId).eq("statut", "en_attente");
  if ((count ?? 0) === 0) must(await db().from("publications").update({ statut: "integree" }).eq("id", pubId).select("id"));

  refreshPublic();
  revalidatePath(`/admin/publications/${pubId}`);
  redirect(`/admin/publications/${pubId}`);
}
