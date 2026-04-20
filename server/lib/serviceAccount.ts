import fs from "fs";
import path from "path";

/**
 * Returns the Google service account JSON.
 * - On Vercel: reads from GOOGLE_SERVICE_ACCOUNT_B64 env var (base64-encoded JSON)
 * - Locally:   reads from google-service-account.json file
 */
export function getServiceAccount(): Record<string, any> {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_B64) {
    return JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_B64, "base64").toString("utf8")
    );
  }
  const filePath = path.join(process.cwd(), "google-service-account.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
