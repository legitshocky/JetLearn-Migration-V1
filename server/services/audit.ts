import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import { HubSpotService } from "./hubspot.js";
import { AIService } from "./ai.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), "google-service-account.json");
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));

import firebaseConfig from "../../firebase-applet-config.json" assert { type: "json" };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(SERVICE_ACCOUNT),
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);

// Firestore collection names
const COLLECTIONS = {
  AUDIT_LOG: "auditLog",
  USER_ACTIVITY: "userActivity",
  TASKS: "tasks",
};

const PAGINATION_LIMIT = 50;

// ── Spreadsheet IDs (for Google Sheets fallback reads) ────────────────────────
const SPREADSHEET_IDS = {
  APP_DATA: "1XxC8Y0sWkBqoOa0Ntw6zhd5EYXTvaTAN4XhIH1hOwDE",
};

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

// ── Shared date parser (mirrors GAS parseSheetDate) ───────────────────────────
function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  if (value && typeof value === "object" && value.toDate) return value.toDate(); // Firestore Timestamp
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d;
  return null;
}

export class AuditService {

  // ── Get paginated audit log ────────────────────────────────────────────────
  // Reads from Firestore. Falls back to Google Sheets if Firestore has no data.
  static async getAuditLog(params: {
    page?: number;
    limit?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || PAGINATION_LIMIT;

    try {
      // Build Firestore query
      let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.AUDIT_LOG);

      // Status filter
      if (params.status && params.status !== "all") {
        query = query.where("status", "==", params.status);
      }

      // Date filters
      if (params.fromDate) {
        const from = new Date(params.fromDate);
        from.setHours(0, 0, 0, 0);
        query = query.where("timestamp", ">=", Timestamp.fromDate(from));
      }
      if (params.toDate) {
        const to = new Date(params.toDate);
        to.setHours(23, 59, 59, 999);
        query = query.where("timestamp", "<=", Timestamp.fromDate(to));
      }

      query = query.orderBy("timestamp", "desc");

      const snapshot = await query.get();
      let rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Search filter (client-side — Firestore doesn't support full-text)
      if (params.search) {
        const term = params.search.toLowerCase();
        rows = rows.filter((row: any) =>
          Object.values(row).some((v) => v && String(v).toLowerCase().includes(term))
        );
      }

      const totalItems = rows.length;
      const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;
      const startIndex = (page - 1) * limit;
      const paginatedData = rows.slice(startIndex, startIndex + limit);

      return { data: paginatedData, total: totalItems, page, totalPages };
    } catch (error: any) {
      console.error("[AuditService.getAuditLog] Error:", error.message);
      return { data: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  // ── Log an action to Firestore audit log ──────────────────────────────────
  // Matches GAS logAction() — same 12-column schema
  static async logAction(
    action: string,
    jlid: string,
    learner: string,
    oldTeacher: string,
    newTeacher: string,
    course: string,
    status: string,
    notes: string,
    reason = "",
    intervenedBy = ""
  ) {
    try {
      const sessionId = uuidv4();
      await db.collection(COLLECTIONS.AUDIT_LOG).add({
        timestamp: Timestamp.now(),
        action: action || "",
        jlid: jlid || "",
        learner: learner || "",
        oldTeacher: oldTeacher || "",
        newTeacher: newTeacher || "",
        course: course || "",
        status: status || "Unknown",
        notes: notes || "",
        sessionId,
        reason: reason || "",
        intervenedBy: intervenedBy || "",
      });
      console.log(`[AuditService] Logged: ${action} for JLID: ${jlid}`);
    } catch (error: any) {
      console.error("[AuditService.logAction] Error:", error.message);
    }
  }

  // ── Log user activity ─────────────────────────────────────────────────────
  static async logUserActivity(username: string, action: string, details: string) {
    try {
      await db.collection(COLLECTIONS.USER_ACTIVITY).add({
        timestamp: Timestamp.now(),
        username: username || "",
        action: action || "",
        details: details || "",
      });
    } catch (error: any) {
      console.error("[AuditService.logUserActivity] Error:", error.message);
    }
  }

  // ── Export audit data for a date range ───────────────────────────────────
  static async exportAuditData(startDate?: string, endDate?: string) {
    try {
      let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.AUDIT_LOG).orderBy("timestamp", "asc");

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query = query.where("timestamp", ">=", Timestamp.fromDate(start));
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query = query.where("timestamp", "<=", Timestamp.fromDate(end));
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      console.error("[AuditService.exportAuditData] Error:", error.message);
      return [];
    }
  }

  // ── Get audit details for a deal (field comparison + calendar verification) ─
  // Mirrors GAS getAuditDetails() — fetches deal, parses sales note, compares fields
  static async getAuditDetails(dealId: string) {
    try {
      // 1. Fetch deal properties directly by deal ID
      const axios = (await import("axios")).default;
      const token = process.env.HUBSPOT_API_KEY;
      const properties = [
        "dealname", "jetlearner_id", "amount", "deal_currency_code", "age", "learner_status",
        "module_start_date", "module_end_date", "total_classes_committed_through_learner_s_journey",
        "current_teacher", "current_course", "time_zone", "regular_class_day",
        "frequency_of_classes", "payment_type", "subscription", "subscription_tenure",
        "payment_term", "learner_practice_document_link",
      ];

      const dealResponse = await axios.get(
        `https://api.hubapi.com/crm/v3/objects/deals/${dealId}?properties=${properties.join(",")}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const props = dealResponse.data.properties;

      // 2. Fetch and parse latest sales note
      const noteText = await HubSpotService.fetchLatestSalesNoteForDeal(dealId);
      const noteData = this.parseSalesNote(noteText || "");

      // 3. Build comparison details (mirrors GAS getComparisonResult)
      const details = [
        this.compare("Amount", parseFloat(props.amount), noteData.totalDealAmount,
          (hs: number, note: number) => Math.abs(hs - note) < 0.01),
        this.compare("Currency", props.deal_currency_code, noteData.totalDealCurrency,
          (hs: string, note: string) => hs?.toUpperCase() === note?.toUpperCase()),
        this.compare("Payment Type", props.payment_type, noteData.paymentType,
          (hs: string, note: string) => hs?.toLowerCase().includes(note?.toLowerCase())),
        this.compare("Subscription Tenure (Months)", parseInt(props.subscription_tenure), noteData.subscriptionDuration),
        this.compare("Committed Classes", parseInt(props.total_classes_committed_through_learner_s_journey), noteData.committedClasses),
        this.compare("Current Course", props.current_course, noteData.courseEnrolled,
          (hs: string, note: string) =>
            hs && note && (hs.toLowerCase().includes(note.toLowerCase()) || note.toLowerCase().includes(hs.toLowerCase()))),
        this.compare("Class Frequency", props.frequency_of_classes, noteData.classFrequency,
          (hs: string, note: string) => hs && note && hs.toLowerCase().includes(note.toLowerCase().replace(" per week", ""))),
        this.compare("Time Zone", props.time_zone, noteData.timeZone,
          (hs: string, note: string) => hs && note && hs.toLowerCase().includes(note.toLowerCase())),
        this.compare("Age", props.age, null),
        this.compare("Learner Status", props.learner_status, null),
      ];

      return {
        success: true,
        details,
        rawNote: noteText || "No relevant sales or onboarding note found.",
        dealProperties: props,
      };
    } catch (error: any) {
      console.error("[AuditService.getAuditDetails] Error:", error.message);
      return { success: false, message: `Server error: ${error.message}` };
    }
  }

  // ── Run onboarding audit for a date range ─────────────────────────────────
  // Mirrors GAS runOnboardingAudit()
  static async runOnboardingAudit(params: { fromDate: string; toDate: string }) {
    if (!params?.fromDate || !params?.toDate) {
      return { success: false, message: "fromDate and toDate are required." };
    }

    try {
      const deals = await HubSpotService.fetchDealsByOnboardingDate(params.fromDate, params.toDate);
      if (!deals || deals.length === 0) {
        return { success: true, data: [], message: "No deals found with an onboarding completion date in this range." };
      }

      const auditResults = await Promise.all(
        deals.map(async (deal: any) => {
          try {
            const result: any = {
              dealId: deal.id,
              jlid: deal.properties.jetlearner_id || "N/A",
              learnerName: deal.properties.dealname,
              onboardingDate: deal.properties.onboarding_completion_date
                ? new Date(deal.properties.onboarding_completion_date).toLocaleDateString("en-GB")
                : "N/A",
              discrepancyCount: 0,
              status: "Compliant",
            };

            const noteText = await HubSpotService.fetchLatestSalesNoteForDeal(deal.id);
            if (!noteText) {
              result.status = "Warning";
              result.discrepancyCount = 1;
              return result;
            }

            const noteData = this.parseSalesNote(noteText);
            const p = deal.properties;

            const checks = [
              this.compare("Amount", parseFloat(p.amount), noteData.totalDealAmount,
                (hs: number, note: number) => Math.abs(hs - note) < 1),
              this.compare("Payment Type", p.payment_type, noteData.paymentType,
                (hs: string, note: string) => hs?.toLowerCase() === note?.toLowerCase()),
              this.compare("Subscription Tenure", parseInt(p.subscription_tenure), noteData.subscriptionDuration),
              this.compare("Committed Classes", parseInt(p.total_classes_committed_through_learner_s_journey), noteData.committedClasses),
              this.compare("Current Course", p.current_course, noteData.courseEnrolled,
                (hs: string, note: string) =>
                  hs && note && (hs.toLowerCase().includes(note.toLowerCase()) || note.toLowerCase().includes(hs.toLowerCase()))),
            ];

            result.discrepancyCount += checks.filter((c) => c.status === "Mismatch").length;

            if (checks.some((c) => c.status === "Warning")) result.status = "Warning";
            if (result.discrepancyCount > 0) result.status = "Mismatch";

            return result;
          } catch (loopError: any) {
            return {
              dealId: deal.id || "Unknown",
              jlid: deal.properties.jetlearner_id || "N/A",
              learnerName: deal.properties.dealname || "Unknown",
              onboardingDate: "N/A",
              discrepancyCount: 1,
              status: "Error",
            };
          }
        })
      );

      return { success: true, data: auditResults };
    } catch (error: any) {
      console.error("[AuditService.runOnboardingAudit] Fatal error:", error.message);
      return { success: false, message: `Critical server error: ${error.message}` };
    }
  }

  // ── Parse sales note (mirrors GAS parseSalesNote) ─────────────────────────
  static parseSalesNote(noteText: string): Record<string, any> {
    if (!noteText) return {};
    const data: Record<string, any> = {};
    const cleanText = noteText.replace(/<[^>]*>/g, "\n");

    const extract = (regex: RegExp) => {
      const match = cleanText.match(regex);
      return match ? match[1]?.trim() || null : null;
    };

    const isSalesNote = /^\s*1:\s*Learner Name/im.test(cleanText);
    const isOnboardingNote = /payment received/i.test(cleanText) && /athena checked/i.test(cleanText);

    if (isSalesNote) {
      data.learnerName = extract(/1:\s*Learner Name:\s*([^\n]+)/i);

      const amountMatch = cleanText.match(
        /3:\s*Total Deal Amount with currency:\s*([€$£A-Z]+)?\s*([\d.,]+)\s*([€$£A-Z]+)?/i
      );
      if (amountMatch) {
        data.totalDealCurrency = ((amountMatch[1] || amountMatch[3]) ?? "").trim().toUpperCase();
        data.totalDealAmount = parseFloat(amountMatch[2].replace(/[.,]$/g, "").replace(/,/g, ""));
      }

      data.paymentType = extract(/4:\s*Payment Type:\s*([^\n]+)/i);
      data.subscriptionDuration = parseInt(extract(/8:\s*Subscription Duration:\s*(\d+)/i) || "0", 10) || null;
      data.courseEnrolled = extract(/11:\s*Course enrolled on:\s*([^\n]+)/i);
      data.committedClasses = parseInt(extract(/12:\s*Number of committed class:\s*(\d+)/i) || "0", 10) || null;
      data.classFrequency = extract(/15:\s*Class Frequency:\s*(.+)/i);
      data.teacherPreference = extract(/10:\s*Pref teacher:\s*([^\n]+)/i);
    } else if (isOnboardingNote) {
      const paymentMatch = cleanText.match(/Payment Received\s*-\s*([\d.,]+)\s*([A-Z]{3})/i);
      if (paymentMatch) {
        data.totalDealAmount = parseFloat(paymentMatch[1].replace(/,/g, ""));
        data.totalDealCurrency = paymentMatch[2].toUpperCase();
      }
      data.courseEnrolled = extract(/Athena Checked\s*-\s*(.+)/i);
      data.teacherQualified = extract(/Teacher Qualified\s*-\s*(.+)/i);
      data.timeZone = extract(/TZ\s*-\s*(.+)/i);
    }

    // Sanitise nulls
    for (const key in data) {
      if (data[key] === null || data[key] === undefined ||
          (typeof data[key] === "number" && isNaN(data[key])) || data[key] === "na") {
        data[key] = null;
      }
    }

    return data;
  }

  // ── Field comparison helper (mirrors GAS getComparisonResult) ─────────────
  static compare(
    propertyName: string,
    hsValue: any,
    noteValue: any,
    comparisonFn: (a: any, b: any) => boolean = (a, b) => String(a) === String(b)
  ) {
    const fmt = (v: any) => (v === null || v === undefined ? "Not Found" : v);
    const result: any = {
      field: propertyName,
      hsValue: fmt(hsValue),
      noteValue: fmt(noteValue),
      status: "Mismatch",
    };

    if (hsValue === null || hsValue === undefined) { result.status = "Warning"; return result; }
    if (noteValue === null || noteValue === undefined) { result.status = "Info"; return result; }
    if (comparisonFn(hsValue, noteValue)) result.status = "Match";

    return result;
  }

  // ── Get tasks list ────────────────────────────────────────────────────────
  static async getTasks() {
    try {
      const snapshot = await db.collection(COLLECTIONS.TASKS)
        .orderBy("created", "desc")
        .get();

      return snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          created: d.created?.toDate?.() || d.created,
          learnerJlid: d.learnerJlid || "",
          learner: d.learnerName || "",
          description: d.description || "",
          assignedTo: d.assignedTo || "",
          status: d.status || "Pending",
          dueDate: d.dueDate || "",
          notes: d.notes || "",
        };
      });
    } catch (error: any) {
      console.error("[AuditService.getTasks] Error:", error.message);
      return [];
    }
  }

  // ── Update task status ────────────────────────────────────────────────────
  static async updateTaskStatus(taskId: string, newStatus: string) {
    try {
      await db.collection(COLLECTIONS.TASKS).doc(taskId).update({ status: newStatus });
      await this.logAction("Task Updated", "", "", "", "", "", "Success",
        `Task ${taskId} status changed to ${newStatus}`);
      return { success: true, message: "Task status updated." };
    } catch (error: any) {
      console.error("[AuditService.updateTaskStatus] Error:", error.message);
      return { success: false, message: `Failed to update task: ${error.message}` };
    }
  }

  // ── Get raw learner audit log (search by JLID or name) ───────────────────
  static async getRawLearnerAuditLog(searchTerm: string) {
    if (!searchTerm?.trim()) {
      return { success: false, message: "Search term cannot be empty." };
    }

    try {
      const term = searchTerm.toLowerCase().replace(/\s/g, "");
      const numericTerm = searchTerm.replace(/\D/g, "");

      // Try JLID exact match first
      let snapshot = await db.collection(COLLECTIONS.AUDIT_LOG)
        .where("jlid", "==", searchTerm.trim().toUpperCase())
        .orderBy("timestamp", "asc")
        .get();

      // Fall back to learner name search
      if (snapshot.empty) {
        snapshot = await db.collection(COLLECTIONS.AUDIT_LOG)
          .orderBy("timestamp", "asc")
          .get();
      }

      const rows = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((row: any) => {
          const jlid = String(row.jlid || "");
          const learner = String(row.learner || "").toLowerCase().replace(/\s/g, "");
          const numericJlid = jlid.replace(/\D/g, "");

          return learner.includes(term) ||
            (numericTerm && numericJlid && numericJlid === numericTerm) ||
            jlid.toUpperCase() === searchTerm.trim().toUpperCase();
        });

      return { success: true, data: rows };
    } catch (error: any) {
      console.error("[AuditService.getRawLearnerAuditLog] Error:", error.message);
      return { success: false, message: `Failed to retrieve learner audit log: ${error.message}` };
    }
  }
}
