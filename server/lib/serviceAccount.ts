import fs from "fs";
import path from "path";

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  [key: string]: string;
}

/**
 * Returns the Google service account JSON.
 * Priority:
 *   1. GOOGLE_SERVICE_ACCOUNT_B64 env var (base64-encoded JSON) — Vercel / production
 *   2. GOOGLE_SERVICE_ACCOUNT_JSON env var (raw JSON string) — fallback
 *   3. google-service-account.json local file — local dev ONLY, never commit this file
 *
 * The local file is in .gitignore. Never commit it.
 */
export function getServiceAccount(): ServiceAccount {
  // 1. Base64-encoded env var (Vercel production)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_B64) {
    try {
      const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_B64, "base64").toString("utf8");
      const parsed = JSON.parse(decoded);
      validateServiceAccount(parsed);
      return parsed;
    } catch (e: any) {
      throw new Error(`GOOGLE_SERVICE_ACCOUNT_B64 is invalid: ${e.message}`);
    }
  }

  // 2. Raw JSON env var
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      validateServiceAccount(parsed);
      return parsed;
    } catch (e: any) {
      throw new Error(`GOOGLE_SERVICE_ACCOUNT_JSON is invalid: ${e.message}`);
    }
  }

  // 3. Local file (dev only — never commit)
  const filePath = path.join(process.cwd(), "google-service-account.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(
      "No Google service account configured. Set GOOGLE_SERVICE_ACCOUNT_B64 env var " +
      "or create google-service-account.json locally (never commit this file)."
    );
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    validateServiceAccount(parsed);
    return parsed;
  } catch (e: any) {
    throw new Error(`google-service-account.json is invalid: ${e.message}`);
  }
}

function validateServiceAccount(sa: any): void {
  const required = ["type", "project_id", "private_key", "client_email"];
  for (const field of required) {
    if (!sa[field]) throw new Error(`Missing required field: ${field}`);
  }
  if (sa.type !== "service_account") {
    throw new Error(`Expected type "service_account", got "${sa.type}"`);
  }
  if (!sa.private_key.includes("BEGIN PRIVATE KEY")) {
    throw new Error("private_key appears malformed — ensure no extra escaping");
  }
}
