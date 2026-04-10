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
  APP_DATA: "1XxC8Y0sWkBqoOa0Ntw6zhd5EYXTvaTAN4XhIH1hOwDE",
};

export class MigrationService {
  private static async getSheetsClient() {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_PATH,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    return google.sheets({ version: "v4", auth });
  }

  static async migrateUsers() {
    const sheets = await this.getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_IDS.MIGRATION,
      range: "'User Profiles'!A2:E",
    });

    const rows = response.data.values;
    if (!rows) return 0;

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
    return count;
  }

  static async migrateMigrations() {
    const sheets = await this.getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_IDS.APP_DATA,
      range: "'Audit Log'!A2:L",
    });

    const rows = response.data.values;
    if (!rows) return 0;

    let count = 0;
    for (const row of rows) {
      const [timestamp, action, jlid, learner, oldTeacher, newTeacher, course, status, notes, sessionId, reason, intervenedBy] = row;
      if (!jlid || !action.includes("Migration")) continue;

      await db.collection("migrations").add({
        jlid,
        learnerName: learner,
        oldTeacher: oldTeacher || null,
        newTeacher,
        course,
        reason: reason || notes || null,
        status,
        timestamp: admin.firestore.Timestamp.fromDate(new Date(timestamp)),
        intervenedBy: intervenedBy || null,
      });
      count++;
    }
    return count;
  }
}
