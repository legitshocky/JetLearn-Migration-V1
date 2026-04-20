import { google } from "googleapis";
import admin from "firebase-admin";
import { getServiceAccount } from "../lib/serviceAccount.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const firebaseConfig = require("../../firebase-applet-config.json");

import { getFirestore, Firestore } from "firebase-admin/firestore";

// Lazy Firebase Admin — only initializes on first use, never crashes at module load
let _db: Firestore | null = null;

function getDb(): Firestore {
  if (!_db) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(getServiceAccount() as admin.ServiceAccount),
        projectId: firebaseConfig.projectId,
      });
    }
    _db = getFirestore(firebaseConfig.firestoreDatabaseId);
  }
  return _db;
}

const SPREADSHEET_IDS = {
  MIGRATION: "1xzprj2U6NpJwoevBMvM1DVfIj76wVjAd0ZcMjVC1xMM",
  PERSONA: "1rSweVyLKEwb1xThFHMLoH4xWnrLs8wbRM_61VtRjGww",
  AUDIT: "1iNrejNX3HA01UqYEch94HuKLQCffSPofB8KbD4D9sI4",
};

export class MigrationService {
  private static async getSheetsClient() {
    const auth = new google.auth.GoogleAuth({
      credentials: getServiceAccount(),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    return google.sheets({ version: "v4", auth });
  }

  private static parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
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
    const db = getDb();
    console.log("[MigrationService] Starting User migration...");
    const sheets = await this.getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_IDS.MIGRATION,
      range: "'User Profiles'!A2:E",
    });

    const rows = response.data.values;
    if (!rows) { console.log("[MigrationService] No user rows found."); return 0; }

    let count = 0;
    for (const row of rows) {
      const [username, password, role, email, isActive] = row;
      if (!username || !email) continue;
      await db.collection("users").doc(username).set({
        username, email, role,
        emailLower: String(email).trim().toLowerCase(),
        isActive: isActive === "TRUE" || isActive === true,
        lastLogin: null,
      });
      count++;
    }
    console.log(`[MigrationService] Migrated ${count} users.`);
    return count;
  }

  static async migrateMigrations() {
    const db = getDb();
    console.log("[MigrationService] Starting Migration logs migration...");
    const sheets = await this.getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_IDS.MIGRATION,
      range: "'Audit Log'!A2:L",
    });

    const rows = response.data.values;
    if (!rows) { console.log("[MigrationService] No migration rows found."); return 0; }

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

  static async lookupUserByUsername(username: string): Promise<{ email: string; isActive: boolean } | null> {
    const sheets = await this.getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_IDS.MIGRATION,
      range: "'User Profiles'!A2:E",
    });

    const rows = response.data.values || [];
    const normalizedUsername = String(username || "").trim().toLowerCase();
    const row = rows.find((r: any[]) => String(r[0] || "").trim().toLowerCase() === normalizedUsername);
    if (!row) return null;

    return {
      email: String(row[3] || "").trim(),
      isActive: String(row[4] || "").trim().toLowerCase() === "true",
    };
  }

  static async getUserProfileByEmail(email: string) {
    const trimmedEmail = String(email || "").trim().toLowerCase();
    if (!trimmedEmail) return null;

    const sheets = await this.getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_IDS.MIGRATION,
      range: "'User Profiles'!A2:E",
    });

    const rows = response.data.values || [];
    const row = rows.find((r: any[]) => String(r[3] || "").trim().toLowerCase() === trimmedEmail);
    if (!row) return null;

    return {
      id: String(row[0] || "").trim(),
      username: String(row[0] || "").trim(),
      email: String(row[3] || "").trim(),
      role: String(row[2] || "User").trim(),
      isActive: String(row[4] || "").trim().toLowerCase() === "true",
      lastLogin: null,
    };
  }
}
