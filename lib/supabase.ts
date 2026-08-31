import { createClient, type SupabaseClient, type User as SupabaseUser } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let _admin: SupabaseClient | null = null;

/** Client serveur (clé secrète) — gestion des comptes et des rôles. Ne jamais exposer côté client. */
export function supabaseAdmin(): SupabaseClient {
  if (!URL || !SERVICE_KEY) throw new Error("Variables Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (.env)");
  if (!_admin) _admin = createClient(URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  return _admin;
}

/** Client public (clé publiable) — vérification e-mail / mot de passe à la connexion. */
export function supabasePublic(): SupabaseClient {
  if (!URL || !PUBLIC_KEY) throw new Error("Variables Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (.env)");
  return createClient(URL, PUBLIC_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
}

/** Utilisateur applicatif. Le rôle vit dans app_metadata (modifiable uniquement avec la clé secrète). */
export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string; // pending | admin | superadmin | refuse
  created_at: string;
  validated_by: string | null;
  validated_at: string | null;
}

export function toAppUser(u: SupabaseUser): AppUser {
  return {
    id: u.id,
    email: u.email ?? "",
    name: (u.user_metadata?.name as string) ?? "",
    role: (u.app_metadata?.role as string) ?? "pending",
    created_at: u.created_at ?? "",
    validated_by: (u.app_metadata?.validated_by as string) ?? null,
    validated_at: (u.app_metadata?.validated_at as string) ?? null,
  };
}

export async function getUserById(id: string): Promise<AppUser | null> {
  const { data, error } = await supabaseAdmin().auth.admin.getUserById(id);
  if (error || !data.user) return null;
  return toAppUser(data.user);
}

const ROLE_ORDER: Record<string, number> = { pending: 0, superadmin: 1, admin: 2, refuse: 3 };

export async function listUsers(): Promise<AppUser[]> {
  const users: AppUser[] = [];
  let page = 1;
  for (;;) {
    const { data, error } = await supabaseAdmin().auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`Supabase listUsers : ${error.message}`);
    users.push(...data.users.map(toAppUser));
    if (data.users.length < 200) break;
    page += 1;
  }
  return users.sort(
    (a, b) => (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9) || b.created_at.localeCompare(a.created_at)
  );
}

export async function pendingUsersCount(): Promise<number> {
  return (await listUsers()).filter((u) => u.role === "pending").length;
}

/** Changement de rôle, tracé (qui, quand). */
export async function setUserRole(id: string, role: string, byEmail: string): Promise<void> {
  const { error } = await supabaseAdmin().auth.admin.updateUserById(id, {
    app_metadata: { role, validated_by: byEmail, validated_at: new Date().toISOString() },
  });
  if (error) throw new Error(`Supabase updateUser : ${error.message}`);
}
