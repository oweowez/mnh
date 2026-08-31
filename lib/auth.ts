import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserById, type AppUser } from "./supabase";

/** Secret de signature des sessions — à définir en production via AUTH_SECRET. */
const SECRET = process.env.AUTH_SECRET || "mnh-dev-secret-a-changer";
export const SESSION_COOKIE = "mnh_session";
const SESSION_DAYS = 7;

// ---------- Sessions (cookie signé HMAC : userId.expiration.signature) ----------
export function signSession(userId: string): { value: string; maxAge: number } {
  const exp = Date.now() + SESSION_DAYS * 86400 * 1000;
  const payload = `${userId}.${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return { value: `${payload}.${sig}`, maxAge: SESSION_DAYS * 86400 };
}

export function parseSession(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  if (!/^[0-9a-fA-F-]{8,64}$/.test(id) || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(`${id}.${exp}`).digest("hex");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
  } catch {
    return null;
  }
  return id;
}

// ---------- Utilisateur courant (vérification autoritaire chez Supabase) ----------
export async function getSessionUser(): Promise<AppUser | null> {
  const jar = await cookies();
  const userId = parseSession(jar.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const user = await getUserById(userId);
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) return null;
  return user;
}

/** À appeler en tête de chaque action serveur d'administration. */
export async function requireAdmin(): Promise<AppUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Gestion des inscriptions et des rôles : réservé aux super-admins. */
export async function requireSuperAdmin(): Promise<AppUser> {
  const user = await requireAdmin();
  if (user.role !== "superadmin") redirect("/admin");
  return user;
}
