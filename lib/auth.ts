import crypto from "crypto";

const SALT = "mnh-fondation-salt";

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "mnh2026";
}

export function adminToken(): string {
  return crypto.createHash("sha256").update(`${adminPassword()}:${SALT}`).digest("hex");
}
