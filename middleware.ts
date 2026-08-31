import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECRET = process.env.AUTH_SECRET || "mnh-dev-secret-a-changer";
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/inscription"];

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [id, exp, sig] = parts;
  if (!/^[0-9a-fA-F-]{8,64}$/.test(id) || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${id}.${exp}`));
  const hex = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === sig;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();
  const ok = await isValidSession(req.cookies.get("mnh_session")?.value);
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
