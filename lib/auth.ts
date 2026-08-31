import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";
import type { User } from "./repo";

/** Secret de signature des sessions — à définir en production via AUTH_SECRET. */
const SECRET = process.env.AUTH_SECRET || "mnh-dev-secret-a-changer";
export const SESSION_COOKIE = "mnh_session";
const SESSION_DAYS = 7;

// ---------- Mots de passe (scrypt, node:crypto — aucune dépendance) ----------
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64);
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), check);
  } catch {
    return false;
  }
}

// ---------- Sessions (cookie signé HMAC : userId.expiration.signature) ----------
export function signSession(userId: number): { value: string; maxAge: number } {
  const exp = Date.now() + SESSION_DAYS * 86400 * 1000;
  const payload = `${userId}.${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return { value: `${payload}.${sig}`, maxAge: SESSION_DAYS * 86400 };
}

export function parseSession(token: string | undefined): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(`${id}.${exp}`).digest("hex");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
  } catch {
    return null;
  }
  return Number(id);
}

// ---------- Utilisateur courant (vérification autoritaire en base) ----------
export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies();
  const userId = parseSession(jar.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const user = getDb()
    .prepare("SELECT id, email, name, role, created_at, validated_by, validated_at FROM users WHERE id = ?")
    .get(userId) as User | undefined;
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) return null;
  return user;
}

/** À appeler en tête de chaque action serveur d'administration. */
export async function requireAdmin(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Gestion des inscriptions et des rôles : réservé aux super-admins. */
export async function requireSuperAdmin(): Promise<User> {
  const user = await requireAdmin();
  if (user.role !== "superadmin") redirect("/admin");
  return user;
}
