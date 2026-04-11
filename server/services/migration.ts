import { google } from "googleapis";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), "google-service-account.json");

import firebaseConfig from "../../firebase-applet-config.json" assert { type: "json" };

import { getFirestore } from "firebase-admin/firestore";

const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(SERVICE_ACCOUNT),
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);

const SPREADSHEET_IDS = {
  MIGRATION: "1xzprj2U6NpJwoevBMvM1DVfIj76wVjAd0ZcMjVC1xMM",
  PERSONA: "1rSweVyLKEwb1xThFHMLoH4xWnrLs8wbRM_61VtRjGww",
  AUDIT: "1iNrejNX3HA01UqYEch94HuKLQCffSPofB8KbD4D9sI4",
};

export class MigrationService {
  private static async getSheetsClient() {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_PATH,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    return google.sheets({ version: "v4", auth });
  }

  private static parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    // Handle DD/MM/YYYY HH:mm:ss
    const parts = dateStr.split(/[\/\s:]/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      const hour = parts[3] ? parseInt(parts[3]) : 0;
      const min = parts[4] ? parseInt(parts[4]) : 0;
      const sec = parts[5] ? parseInt(parts[5]) : 0;
      return new Date(year, month, day, hour, min, sec);
    }
    return new Date(dateStr);
  }

  static async migrateUsers() {
    console.log("[MigrationService] Starting User migration...");
    const sheets = await this.getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_IDS.MIGRATION,
      range: "'User Profiles'!A2:E",
    });

    const rows = response.data.values;
    if (!rows) {
      console.log("[MigrationService] No user rows found.");
      return 0;
    }

    let count = 0;
    for (const row of rows) {
      const [username, password, role, email, isActive] = row;
      if (!username || !email) continue;

      await db.collection("users").doc(username).set({
        username,
        email,
        role,
        isActive: isActive === "TRUE" || isActive === true,
        lastLogin: null,
      });
      count++;
    }
    console.log(`[MigrationService] Migrated ${count} users.`);
    return count;
  }

  static async migrateMigrations() {
    console.log("[MigrationService] Starting Migration logs migration...");
    const sheets = await this.getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_IDS.MIGRATION,
      range: "'Audit Log'!A2:L",
    });

    const rows = response.data.values;
    if (!rows) {
      console.log("[MigrationService] No migration rows found.");
      return 0;
    }

    let count = 0;
    for (const row of rows) {
      const [timestamp, action, jlid, learner, oldTeacher, newTeacher, course, status, notes, sessionId, reason, intervenedBy] = row;
      if (!jlid || !action || !action.includes("Migration")) continue;

      try {
        await db.collection("migrations").add({
          jlid,
          learnerName: learner || "Unknown",
          oldTeacher: oldTeacher || null,
          newTeacher: newTeacher || "Unknown",
          course: course || "Unknown",
          reason: reason || notes || null,
          status: status || "Success",
          timestamp: admin.firestore.Timestamp.fromDate(this.parseDate(timestamp)),
          intervenedBy: intervenedBy || null,
        });
        count++;
      } catch (err: any) {
        console.error(`[MigrationService] Error migrating row for ${jlid}:`, err.message);
      }
    }
    console.log(`[MigrationService] Migrated ${count} migration logs.`);
    return count;
  }
}
