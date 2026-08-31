import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SALT = "mnh-fondation-salt";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  const cookie = req.cookies.get("mnh_admin")?.value;
  const expected = await sha256Hex(`${process.env.ADMIN_PASSWORD || "mnh2026"}:${SALT}`);
  if (cookie !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
