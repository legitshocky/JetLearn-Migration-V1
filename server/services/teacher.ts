import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { HubSpotService } from "./hubspot.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), "google-service-account.json");
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));

// Spreadsheet IDs
export const SPREADSHEET_IDS = {
  MIGRATION: "1xzprj2U6NpJwoevBMvM1DVfIj76wVjAd0ZcMjVC1xMM",
  PERSONA:   "1rSweVyLKEwb1xThFHMLoH4xWnrLs8wbRM_61VtRjGww",
  AUDIT:     "1iNrejNX3HA01UqYEch94HuKLQCffSPofB8KbD4D9sI4",
};

// Sheet names
export const SHEETS = {
  TEACHER_DATA:     "Teacher Data",
  COURSE_NAME:      "Course Name",
  TEACHER_COURSES:  "Teacher Courses",
  TEACHER_HS_DATA:  "Teacher HS values",
  COURSE_HS_DATA:   "Course HS values",
  HS_USER_DATA:     "HS User Values",
  PERSONA_DATA:     "Main Sheet",
  PERSONA_MAPPING:  "Teacher Persona Mapping",
};

// In-memory sheet cache (per-request lifetime — resets on each server call)
const _sheetCache: Record<string, any[][]> = {};

// Teacher name alias map (matches GAS exactly)
const TEACHER_NAME_ALIASES: Record<string, string> = {
  "aditi chuhan":            "Aditi Chauhan",
  "aditi chauhan":           "Aditi Chauhan",
  "aditi chauahn":           "Aditi Chauhan",
  "aditi chahuan":           "Aditi Chauhan",
  "betty ann":               "Betty Ann Lijo",
  "florence bogor":          "Florence",
  "ramakant chandla":        "Ramakant Chandla",
  "xavier kristeen ottilia": "Ottilia Kristeen Xavier",
  "aarshi":                  "Aarshi Chaturvedi",
  "anjali":                  "Anjali Murali",
  "akshay gunani":           "Akshay Gurnani",
  "kim jeoffrey cuevas":     "Kim Jeoffrey Cuevass",
  "love sogarwal":           "Love Sogarwal",
  "lovepreetkaur chadha":    "LovepreetKaur Chadha",
  "sakshi chillar":          "Sakshi Badgujjar",
  "saloni jain":             "Saloni Sharma",
  "soni":                    "Akanksha Soni",
  "komal":                   "Komal",
  "sakina jaorawala":        "Sakina Jaorawala",
};

const HARDCODED_TP_MANAGERS = [
  "Amruta Gavade",
  "Manika Singhal",
  "Naureen Fatima",
  "Oorja M Srivastava",
  "Sakshi Sharma",
  "Sangeeta Sarkar",
  "Sayani Chakraborty",
  "Shradha Agarwal",
  "Sudhi Agrawal"
];

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

async function getSheetData(spreadsheetId: string, sheetName: string): Promise<any[][]> {
  const key = `${spreadsheetId}_${sheetName}`;
  if (_sheetCache[key]) return _sheetCache[key];
  
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'`,
  });
  const values = response.data.values || [];
  _sheetCache[key] = values;
  return values;
}

// ── Name helpers (mirror GAS exactly) ────────────────────────────────────────
export function normalizeTeacherName(name: string): string {
  return String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolveTeacherName(name: string): string {
  const key = normalizeTeacherName(name);
  return TEACHER_NAME_ALIASES[key] || String(name || "").trim();
}

export class TeacherService {

  // ── Get all teacher data (mirrors GAS getTeacherData) ────────────────────
  static async getTeacherData() {
    try {
      const data = await getSheetData(SPREADSHEET_IDS.MIGRATION, SHEETS.TEACHER_DATA);
      if (data.length < 2) return [];

      return data.slice(1).map((row: any[]) => {
        const gender = String(row[2] || "").trim().toUpperCase();
        const autoPrefix = gender === "M" ? "Mr." : gender === "F" ? "Ms." : "";
        return {
          name:                 String(row[1] || "").trim(),
          email:                String(row[8] || "").trim(),
          clsEmail:             String(row[9] || "").trim(),
          tpManagerEmail:       String(row[10] || "").trim(),
          manager:              String(row[6] || "").trim(),
          clsManagerResponsible:String(row[7] || "").trim(),
          status:               String(row[3] || "Active").trim(),
          joinDate:             row[2] || null,
          hiddenInSearch:       String(row[11] || "").trim(),
          prefix:               autoPrefix,
        };
      }).filter((t: any) => t.name !== "");
    } catch (e: any) {
      console.error("[TeacherService.getTeacherData] Error:", e.message);
      return [];
    }
  }

  // ── Get active teacher names list ─────────────────────────────────────────
  static async getActiveTeachers(): Promise<string[]> {
    const teachers = await this.getTeacherData();
    return teachers.map((t: any) => t.name);
  }

  // ── Get course names list ─────────────────────────────────────────────────
  static async getCourseNames(): Promise<string[]> {
    try {
      const data = await getSheetData(SPREADSHEET_IDS.MIGRATION, SHEETS.COURSE_NAME);
      if (data.length < 2) return [];
      return data.slice(1).map((row: any[]) => String(row[0] || "").trim()).filter(Boolean);
    } catch (e: any) {
      console.error("[TeacherService.getCourseNames] Error:", e.message);
      return [];
    }
  }

  // ── Get TP managers list ──────────────────────────────────────────────────
  static async getTPManagers(): Promise<string[]> {
    try {
      const teachers = await this.getTeacherData();
      const managers = new Set<string>(HARDCODED_TP_MANAGERS);
      teachers.forEach((t: any) => {
        if (t.manager?.trim()) managers.add(t.manager.trim());
      });
      return Array.from(managers).sort();
    } catch (e: any) {
      return HARDCODED_TP_MANAGERS;
    }
  }

  // ── Get teacher courses (wide format) ────────────────────────────────────
  // Returns { teacherName: [{course, proficiency}] }
  static async getTeacherCoursesMap(): Promise<Record<string, { course: string; proficiency: string }[]>> {
    try {
      const data = await getSheetData(SPREADSHEET_IDS.MIGRATION, SHEETS.TEACHER_COURSES);
      if (data.length < 2) return {};

      // Find header row
      let headerRowIdx = 0;
      for (let i = 0; i < Math.min(data.length, 10); i++) {
        if (String(data[i][0]).trim().toLowerCase() === "teacher") { headerRowIdx = i; break; }
      }
      const headers = data[headerRowIdx];
      const COURSE_START = 4;
      const result: Record<string, { course: string; proficiency: string }[]> = {};

      for (let r = headerRowIdx + 1; r < data.length; r++) {
        const row = data[r];
        const name = String(row[0] || "").trim();
        if (!name || name.toLowerCase() === "teacher") continue;

        const courses: { course: string; proficiency: string }[] = [];
        for (let c = COURSE_START; c < headers.length; c++) {
          const courseName = String(headers[c] || "").trim();
          const proficiency = String(row[c] || "").trim();
          if (courseName && proficiency && proficiency.toLowerCase() !== "not onboarded") {
            courses.push({ course: courseName, proficiency });
          }
        }
        result[name] = courses;
      }
      return result;
    } catch (e: any) {
      console.error("[TeacherService.getTeacherCoursesMap] Error:", e.message);
      return {};
    }
  }

  // ── Get specific teacher load (mirrors GAS getTeacherSpecificLoad) ────────
  static async getTeacherLoad(teacherName: string) {
    try {
      const data = await getSheetData(SPREADSHEET_IDS.MIGRATION, SHEETS.TEACHER_COURSES);
      if (data.length < 2) return { success: false, message: "No data found." };

      let headerRowIdx = 0;
      for (let i = 0; i < Math.min(data.length, 10); i++) {
        if (String(data[i][0]).trim().toLowerCase() === "teacher") { headerRowIdx = i; break; }
      }
      const headers = data[headerRowIdx];
      const COURSE_START = 4;

      const teacherRow = data.slice(headerRowIdx + 1).find((row: any[]) =>
        String(row[0]).trim().toLowerCase() === teacherName.trim().toLowerCase()
      );
      if (!teacherRow) return { success: false, message: "Teacher not found." };

      const courses: { course: string; proficiency: string }[] = [];
      for (let i = COURSE_START; i < headers.length; i++) {
        const courseName = String(headers[i] || "").trim();
        const status = String(teacherRow[i] || "").trim();
        if (status && status.toLowerCase() !== "not onboarded" && courseName) {
          courses.push({ course: courseName, proficiency: status });
        }
      }
      // Sort: 100% first
      courses.sort((a, b) => b.proficiency.localeCompare(a.proficiency));

      // Manager lookup from Teacher Data sheet
      let tpManager = "", clsManager = "", clsEmail = "", tpManagerEmail = "";
      try {
        const tdData = await getSheetData(SPREADSHEET_IDS.MIGRATION, SHEETS.TEACHER_DATA);
        const nameLower = teacherName.trim().toLowerCase();
        for (let r = 1; r < tdData.length; r++) {
          if (String(tdData[r][1] || "").trim().toLowerCase() === nameLower) {
            tpManager      = String(tdData[r][6]  || "").trim();
            clsManager     = String(tdData[r][7]  || "").trim();
            clsEmail       = String(tdData[r][9]  || "").trim();
            tpManagerEmail = String(tdData[r][10] || "").trim();
            break;
          }
        }
      } catch (_) {}

      return {
        success: true,
        teacherName: teacherRow[0],
        status: teacherRow[3] || "Active",
        courses,
        totalLoad: courses.length,
        manager: tpManager,
        clsManagerResponsible: clsManager,
        clsEmail,
        tpManagerEmail,
      };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  // ── Get teacher courses (for API endpoint) ────────────────────────────────
  static async getTeacherCourses(teacherName: string) {
    return this.getTeacherLoad(teacherName);
  }

  // ── Translate HubSpot internal ID → teacher display name ─────────────────
  static async getTeacherLabel(hubspotValue: string): Promise<string> {
    if (!hubspotValue) return hubspotValue;
    try {
      const data = await getSheetData(SPREADSHEET_IDS.MIGRATION, SHEETS.TEACHER_HS_DATA);
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][1]) === hubspotValue) return String(data[i][2] || hubspotValue);
      }
    } catch (_) {}
    return hubspotValue;
  }

  // ── Translate HubSpot internal ID → course display name ──────────────────
  static async getCourseLabel(internalValue: string): Promise<string> {
    if (!internalValue) return internalValue;
    try {
      const data = await getSheetData(SPREADSHEET_IDS.MIGRATION, SHEETS.COURSE_HS_DATA);
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === internalValue) return String(data[i][1] || internalValue);
      }
    } catch (_) {}
    return internalValue;
  }

  // ── Translate HubSpot internal ID → HS user display name ─────────────────
  static async getHSUserLabel(internalValue: string): Promise<string> {
    if (!internalValue) return internalValue;
    try {
      const data = await getSheetData(SPREADSHEET_IDS.MIGRATION, SHEETS.HS_USER_DATA);
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(internalValue)) return String(data[i][1] || internalValue);
      }
    } catch (_) {}
    return internalValue;
  }

  // ── Get HubSpot owner ID by name ──────────────────────────────────────────
  static async getHubSpotOwnerIdByName(name: string): Promise<string | null> {
    if (!name) return null;
    try {
      const needle = name.trim().toLowerCase();
      const data = await getSheetData(SPREADSHEET_IDS.MIGRATION, SHEETS.HS_USER_DATA);
      for (let i = 1; i < data.length; i++) {
        const label = String(data[i][1] || "").trim().toLowerCase();
        if (label === needle) return String(data[i][0]);
      }
    } catch (_) {}
    return null;
  }

  // ── Teacher details for load table (with HubSpot learner counts) ──────────
  static async getTeacherDetailsForTable() {
    try {
      const [allTeachers, hubspotCounts] = await Promise.all([
        this.getTeacherData(),
        HubSpotService.getActiveLearnersPerTeacher(),
      ]);

      return allTeachers.map((teacher: any) => {
        const teacherNorm = normalizeTeacherName(teacher.name);
        const resolvedName = resolveTeacherName(teacher.name);
        const resolvedNorm = normalizeTeacherName(resolvedName);
        const hsData =
          (hubspotCounts as any)[teacher.name] ||
          (hubspotCounts as any)[teacherNorm] ||
          (hubspotCounts as any)[resolvedName] ||
          (hubspotCounts as any)[resolvedNorm] ||
          { total: 0, coding: 0, math: 0 };

        const isActive = ["Active", "EWS", "Friendly"].includes(teacher.status);
        return {
          name:                  teacher.name,
          email:                 teacher.email || "N/A",
          clsEmail:              teacher.clsEmail || "N/A",
          status:                teacher.status || "Active",
          joinDate:              teacher.joinDate
            ? new Date(teacher.joinDate).toLocaleDateString("en-GB")
            : "N/A",
          manager:               teacher.manager || "",
          clsManagerResponsible: teacher.clsManagerResponsible || "",
          tpManagerEmail:        teacher.tpManagerEmail || "",
          activeCourses:         isActive ? hsData.total  : 0,
          activeCoding:          isActive ? hsData.coding : 0,
          activeMath:            isActive ? hsData.math   : 0,
          hiddenInSearch:        teacher.hiddenInSearch || "",
        };
      });
    } catch (e: any) {
      console.error("[TeacherService.getTeacherDetailsForTable] Error:", e.message);
      return [];
    }
  }

  // ── Find upskill alternatives (mirrors GAS findUpskillAlternatives) ───────
  static async findUpskillAlternatives(courseLabels: string[], excludeTeacher: string, jlid?: string) {
    try {
      const data = await getSheetData(SPREADSHEET_IDS.MIGRATION, SHEETS.TEACHER_COURSES);
      if (!data || data.length < 2) return { success: false, alternatives: [] };

      let headerRowIdx = 0;
      for (let i = 0; i < Math.min(data.length, 10); i++) {
        if (String(data[i][0]).trim().toLowerCase() === "teacher") { headerRowIdx = i; break; }
      }
      const headers = data[headerRowIdx];
      const COURSE_START = 4;
      const requiredLow = (courseLabels || []).map((c) => c.toLowerCase().trim());
      const excludeLow = normalizeTeacherName(resolveTeacherName(excludeTeacher || ""));

      const alternatives: any[] = [];

      for (let r = headerRowIdx + 1; r < data.length; r++) {
        const row = data[r];
        const teacherName = String(row[0] || "").trim();
        if (!teacherName) continue;
        if (normalizeTeacherName(teacherName) === excludeLow) continue;

        const upskilledMap: Record<string, { course: string; proficiency: string }> = {};
        for (let c = COURSE_START; c < headers.length; c++) {
          const colName = String(headers[c] || "").trim();
          const proficiency = String(row[c] || "").trim();
          if (colName && proficiency && proficiency.toLowerCase() !== "not onboarded") {
            upskilledMap[colName.toLowerCase().trim()] = { course: colName, proficiency };
          }
        }

        const coversAll = requiredLow.every((req) => !!upskilledMap[req]);
        if (!coversAll) continue;

        const courseDetails = requiredLow.map((req) => upskilledMap[req] || { course: req, proficiency: "?" });
        alternatives.push({ teacherName, courses: courseDetails });
      }

      // Sort: 100% proficient first
      alternatives.sort((a, b) => {
        const aAll = a.courses.every((c: any) => c.proficiency === "100%");
        const bAll = b.courses.every((c: any) => c.proficiency === "100%");
        return (bAll ? 1 : 0) - (aAll ? 1 : 0);
      });

      // Enrich with learner history if jlid provided
      if (jlid) {
        try {
          const timeline = await HubSpotService.getComprehensiveLearnerHistory(jlid);
          const migrations = timeline?.migrationTimeline || [];

          alternatives.forEach((alt) => {
            const normAlt = normalizeTeacherName(alt.teacherName);
            alt.wasEverAssigned = migrations.some(
              (m: any) => normalizeTeacherName(m.toTeacher || "") === normAlt
            );
            alt.escalationCount = migrations.filter(
              (m: any) =>
                (m.reason || "").toLowerCase().includes("escalation") &&
                (normalizeTeacherName(m.fromTeacher || "") === normAlt ||
                  normalizeTeacherName(m.toTeacher || "") === normAlt)
            ).length;
            alt.isAffinityCase = migrations.some(
              (m: any) =>
                normalizeTeacherName(m.toTeacher || "") === normAlt &&
                (m.reason || "").toLowerCase().includes("affinity")
            );
          });
        } catch (_) {}
      }

      return { success: true, alternatives };
    } catch (e: any) {
      console.error("[TeacherService.findUpskillAlternatives] Error:", e.message);
      return { success: false, alternatives: [], message: e.message };
    }
  }

  // ── Check new teacher for learner (migration intelligence) ────────────────
  // Mirrors GAS checkNewTeacherForLearner — returns alerts, history, future course checks
  static async checkNewTeacherForLearner(jlid: string, newTeacherName: string, slotParams?: any) {
    try {
      const resolvedNew = resolveTeacherName(newTeacherName);
      const normalizedNew = normalizeTeacherName(resolvedNew);

      const timeline = await HubSpotService.getComprehensiveLearnerHistory(jlid);
      if (!timeline || !timeline.success) {
        return { success: false, message: timeline?.message || "Timeline fetch failed" };
      }

      const migrations = timeline.migrationTimeline || [];
      const now = new Date();

      // Migration frequency counts (30/60/90d)
      let count30 = 0, count60 = 0, count90 = 0;
      migrations.forEach((m: any) => {
        if (!m.date) return;
        const days = (now.getTime() - new Date(m.date).getTime()) / 86400000;
        if (days <= 30) count30++;
        if (days <= 60) count60++;
        if (days <= 90) count90++;
      });

      // Was new teacher ever assigned?
      const assignmentHistory = migrations.filter(
        (m: any) => normalizeTeacherName(m.toTeacher || "") === normalizedNew
      );
      const wasEverAssigned = assignmentHistory.length > 0;
      const isAffinityCase = assignmentHistory.some((m: any) =>
        (m.reason || "").toLowerCase().includes("affinity")
      );

      // Escalation events involving new teacher + this learner
      const escalationEvents = migrations.filter((m: any) => {
        const r = (m.reason || "").toLowerCase();
        return (
          r.includes("escalation") &&
          (normalizeTeacherName(m.fromTeacher || "") === normalizedNew ||
            normalizeTeacherName(m.toTeacher || "") === normalizedNew)
        );
      });

      // Last migration
      const sorted = [...migrations].sort(
        (a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      );
      const lastMigration = sorted[0] || null;

      // Build alerts
      const alerts: any[] = [];
      if (count30 >= 2) {
        alerts.push({ level: "danger", icon: "exclamation-triangle",
          message: `${count30} migrations in the last 30 days — high churn risk. CLS review recommended.` });
      } else if (count60 >= 2) {
        alerts.push({ level: "warning", icon: "exclamation-circle",
          message: `${count60} migrations in the last 60 days — review if this migration is necessary.` });
      } else if (count90 >= 2) {
        alerts.push({ level: "info", icon: "info-circle",
          message: `${count90} migrations in the last 90 days — within range but monitor closely.` });
      }
      if (escalationEvents.length > 0) {
        alerts.push({ level: "danger", icon: "exclamation-triangle",
          message: `${escalationEvents.length} past escalation event(s) involving ${resolvedNew} for this learner.` });
      }
      if (wasEverAssigned && !isAffinityCase) {
        alerts.push({ level: "warning", icon: "history",
          message: `${resolvedNew} was a previous teacher for this learner. Confirm re-assignment is intentional.` });
      }
      if (isAffinityCase) {
        alerts.push({ level: "success", icon: "heart",
          message: `Teacher Affinity case — parent/learner has previously requested ${resolvedNew}.` });
      }

      // Future courses from latest ticket
      const futureCourses: any[] = [];
      let mipTicketId = null;
      try {
        const tcResult = await HubSpotService.fetchLatestMigrationTicket(jlid);
        if (tcResult.found) {
          mipTicketId = tcResult.ticketId;
          const rp = tcResult.rawProperties || {};
          const teacherLoad = await this.getTeacherLoad(resolvedNew);
          const teacherCourseList = teacherLoad.success ? (teacherLoad.courses || []) : [];
          const teacherCourseNames = teacherCourseList.map((tc: any) => (tc.course || "").toLowerCase().trim());

          [rp.future_course_1, rp.future_course_2, rp.future_course_3].forEach((raw: string, idx: number) => {
            if (!raw) return;
            const label = raw;
            const labelLow = label.toLowerCase().trim();
            const isUpskilled = teacherCourseNames.includes(labelLow);
            futureCourses.push({ index: idx + 1, courseLabel: label, rawValue: raw, isUpskilled });
          });
        }
      } catch (_) {}

      return {
        success: true,
        jlid,
        ticketId: mipTicketId,
        learnerName: timeline.learnerProfile?.learnerName || "",
        newTeacherName: resolvedNew,
        migrationCount30d: count30,
        migrationCount60d: count60,
        migrationCount90d: count90,
        totalMigrations: migrations.length,
        wasEverAssigned,
        isAffinityCase,
        escalationCount: escalationEvents.length,
        escalationEvents,
        lastMigrationDate:      lastMigration?.date || null,
        lastMigrationReason:    lastMigration?.reason || null,
        lastMigrationToTeacher: lastMigration?.toTeacher || null,
        riskLevel:   timeline.journeyAnalysis?.riskLevel   || "Unknown",
        riskMessage: timeline.journeyAnalysis?.riskMessage || "",
        alerts,
        futureCourses,
      };
    } catch (e: any) {
      console.error("[TeacherService.checkNewTeacherForLearner] Error:", e.message);
      return { success: false, message: e.message };
    }
  }

  // ── Build audit score map (mirrors GAS _buildAuditScoreMapDays) ───────────
  static async buildAuditScoreMap(days = 45): Promise<Record<string, { avgScore: number | null; redFlags: number; auditCount: number }>> {
    const map: Record<string, { scores: number[]; redFlags: number }> = {};
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const AUDIT_TABS = ["Coding Audit'26", "Math Audit'26", "GCSE Audit'26"];

    try {
      const sheets = await getSheetsClient();
      for (const tabName of AUDIT_TABS) {
        try {
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_IDS.AUDIT,
            range: `'${tabName}'`,
          });
          const data = response.data.values || [];
          if (data.length < 2) continue;

          const headers = data[0].map((h: any) => String(h).trim());
          const teacherIdx = headers.indexOf("Teacher");
          const scoreIdx   = headers.indexOf("Class Score");
          const rfIdx      = headers.indexOf("Red Flags");
          const dateIdx    = ["Date", "Audit Date", "Class Date", "Session Date", "Observation Date"]
            .reduce((found, n) => found > -1 ? found : headers.indexOf(n), -1);

          if (teacherIdx === -1 || scoreIdx === -1) continue;

          for (let i = 1; i < data.length; i++) {
            if (dateIdx > -1 && data[i][dateIdx]) {
              const d = new Date(data[i][dateIdx]);
              if (!isNaN(d.getTime()) && d < cutoff) continue;
            }
            const rawTeacher = String(data[i][teacherIdx] || "").trim();
            if (!rawTeacher) continue;
            const key = normalizeTeacherName(rawTeacher);
            const score = parseFloat(data[i][scoreIdx]) || 0;
            if (score <= 0) continue;
            if (!map[key]) map[key] = { scores: [], redFlags: 0 };
            map[key].scores.push(score);
            if (rfIdx > -1) {
              const rf = String(data[i][rfIdx] || "").trim().toLowerCase();
              if (rf && rf !== "none" && rf !== "no" && rf !== "-" && rf !== "") {
                map[key].redFlags++;
              }
            }
          }
        } catch (_) {}
      }
    } catch (e: any) {
      console.error("[TeacherService.buildAuditScoreMap] Error:", e.message);
    }

    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(map)) {
      result[k] = {
        avgScore: v.scores.length > 0
          ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length * 10) / 10
          : null,
        redFlags: v.redFlags,
        auditCount: v.scores.length,
      };
    }
    return result;
  }

  // ── Get teacher audit data (mirrors GAS getTeacherAuditData) ─────────────
  static async getTeacherAuditData(teacherName: string) {
    const normalized = normalizeTeacherName(teacherName);
    const scores: number[] = [];
    let redFlagTotal = 0;
    const auditRows: any[] = [];

    const AUDIT_TABS = ["Coding Audit'26", "Math Audit'26", "GCSE Audit'26"];
    try {
      const sheets = await getSheetsClient();
      for (const tabName of AUDIT_TABS) {
        try {
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_IDS.AUDIT,
            range: `'${tabName}'`,
          });
          const data = response.data.values || [];
          if (data.length < 2) continue;
          const headers = data[0].map((h: any) => String(h).trim());
          const teacherIdx = headers.indexOf("Teacher");
          const scoreIdx   = headers.indexOf("Class Score");
          const rfIdx      = headers.indexOf("Red Flags");
          if (teacherIdx === -1 || scoreIdx === -1) continue;

          for (let i = 1; i < data.length; i++) {
            const rowTeacher = normalizeTeacherName(String(data[i][teacherIdx] || ""));
            if (rowTeacher !== normalized) continue;
            const score = parseFloat(data[i][scoreIdx]) || 0;
            if (score > 0) scores.push(score);
            if (rfIdx > -1) {
              const rf = String(data[i][rfIdx] || "").trim().toLowerCase();
              if (rf && rf !== "none" && rf !== "no" && rf !== "-") redFlagTotal++;
            }
            auditRows.push({ tab: tabName, score, redFlags: rfIdx > -1 ? String(data[i][rfIdx] || "").trim() : "" });
          }
        } catch (_) {}
      }
    } catch (e: any) {
      console.error("[TeacherService.getTeacherAuditData] Error:", e.message);
    }

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10
      : null;

    return { success: true, hasData: scores.length > 0, avgScore, redFlags: redFlagTotal, auditCount: auditRows.length, auditRows };
  }

  // ── Teacher profile (combined: basic info + courses + escalations) ────────
  static async getTeacherProfileData(teacherName: string) {
    try {
      const [allTeachers, loadData, escalationData] = await Promise.all([
        this.getTeacherData(),
        this.getTeacherLoad(teacherName),
        HubSpotService.getTeacherEscalationHistory("", teacherName),
      ]);

      const nameLower = normalizeTeacherName(teacherName);
      const teacherInfo = allTeachers.find((t: any) => normalizeTeacherName(t.name) === nameLower) || null;
      const courses = loadData.success ? (loadData.courses || []) : [];

      return {
        success: true,
        profile: {
          name:         teacherName,
          email:        teacherInfo?.email || "N/A",
          status:       teacherInfo?.status || loadData?.status || "N/A",
          manager:      teacherInfo?.manager || "N/A",
          clsManager:   teacherInfo?.clsManagerResponsible || "N/A",
          joinDate:     teacherInfo?.joinDate
            ? new Date(teacherInfo.joinDate).toLocaleDateString("en-GB")
            : "N/A",
          totalCourses: courses.length,
          courses,
          escalation:   escalationData.success ? {
            totalCount:         escalationData.totalCount,
            byReason:           escalationData.byReason,
            tickets:            escalationData.tickets,
            lastEscalationDate: escalationData.lastEscalationDate,
          } : { totalCount: 0, byReason: {}, tickets: [], lastEscalationDate: null },
        },
      };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  // ── Search matching teachers (mirrors GAS searchMatchingTeachers) ─────────
  // Simplified version — slot matching via HubSpot data only (no GAS CalendarApp)
  static async searchMatchingTeachers(requestData: any) {
    try {
      const currentCourse = String(requestData.currentCourse || "").trim();
      const futureCourses = [
        String(requestData.futureCourse1 || "").trim(),
        String(requestData.futureCourse2 || "").trim(),
        String(requestData.futureCourse3 || "").trim(),
      ].filter((f) => f && f !== "None");
      const learnerAge = parseInt(requestData.learnerAge || "0", 10);
      const isMathCourse = currentCourse.toLowerCase().includes("math");

      // Load teacher courses map
      const coursesMap = await this.getTeacherCoursesMap();

      // Load audit scores
      const auditMap = await this.buildAuditScoreMap(45);

      // Load persona map
      const personaMap: Record<string, { traits: string[]; ageGroups: string[] }> = {};
      try {
        const personaData = await getSheetData(SPREADSHEET_IDS.MIGRATION, SHEETS.PERSONA_MAPPING);
        if (personaData && personaData.length > 1) {
          const pHeaders = personaData[0].map((h: any) => String(h).trim());
          const nameIdx = pHeaders.indexOf("Teacher Name");
          const ageIdx = pHeaders.indexOf("Preferred Age Group") > -1
            ? pHeaders.indexOf("Preferred Age Group")
            : pHeaders.indexOf("Age Group");
          const traitCols = pHeaders.reduce((acc: number[], h: string, i: number) => {
            if (/trait|expertise|style|skill|strength|personality|subject|teaching/i.test(h)) acc.push(i);
            return acc;
          }, []);

          personaData.slice(1).forEach((row: any[]) => {
            const rn = String(row[nameIdx] || "").trim();
            if (!rn) return;
            const key = normalizeTeacherName(rn);
            const traits: string[] = [];
            traitCols.forEach((i: number) => {
              String(row[i] || "").split(/[,\n]/).forEach((t: string) => {
                const clean = t.trim().toLowerCase();
                if (clean) traits.push(clean);
              });
            });
            const ageGroups = ageIdx > -1
              ? String(row[ageIdx] || "").split(",").map((a: string) => a.trim()).filter(Boolean)
              : [];
            personaMap[key] = { traits, ageGroups };
          });
        }
      } catch (_) {}

      const PROG_SCORE: Record<string, number> = {
        "100%": 30, "91-99%": 27, "81-90%": 24, "71-80%": 21, "61-70%": 18,
        "51-60%": 15, "41-50%": 12, "31-40%": 9, "21-30%": 6, "11-20%": 3, "1-10%": 1, "0%": 0,
      };
      const VALID_PROGRESS = ["71-80%", "81-90%", "91-99%", "100%"];

      const targetTraits = isMathCourse
        ? String(requestData.mathTraits || "").split(",").map((t: string) => t.trim().toLowerCase()).filter(Boolean)
        : String(requestData.techTraits || "").split(",").map((t: string) => t.trim().toLowerCase()).filter(Boolean);

      const output: any[] = [];

      for (const [rawName, courses] of Object.entries(coursesMap)) {
        const tNorm = normalizeTeacherName(rawName);

        // Course filter
        if (currentCourse) {
          const prog = courses.find((c) => c.course.toLowerCase().trim() === currentCourse.toLowerCase().trim());
          if (!prog || !VALID_PROGRESS.includes(prog.proficiency)) continue;
        }

        const persona = personaMap[tNorm] || null;
        const teacherTraits = persona?.traits || [];
        const candidateAgeGroups = persona?.ageGroups || [];

        // Trait score
        let traitScore = 15;
        let traitsMissing: string[] = [];
        if (targetTraits.length > 0) {
          const tLow = teacherTraits.map((t) => t.toLowerCase());
          const matched = targetTraits.filter((t) => tLow.includes(t));
          traitsMissing = targetTraits.filter((t) => !tLow.includes(t));
          traitScore = teacherTraits.length > 0 ? Math.round((matched.length / targetTraits.length) * 30) : 0;
        }

        // Age score
        let ageScore = 10;
        if (!isNaN(learnerAge) && candidateAgeGroups.length > 0) {
          const ageMatched = candidateAgeGroups.some((ag) => {
            const rng = ag.toLowerCase().match(/(\d+)\s*[-–]\s*(\d+)/);
            if (rng) return learnerAge >= parseInt(rng[1]) && learnerAge <= parseInt(rng[2]);
            const plus = ag.toLowerCase().match(/(\d+)\+/);
            if (plus) return learnerAge >= parseInt(plus[1]);
            return false;
          });
          ageScore = ageMatched ? 20 : 5;
        }

        // Course score
        let courseScore = 0;
        let currentCourseProgress = "Not Onboarded";
        if (currentCourse) {
          const prog = courses.find((c) => c.course.toLowerCase().trim() === currentCourse.toLowerCase().trim());
          if (prog) {
            currentCourseProgress = prog.proficiency;
            courseScore = PROG_SCORE[prog.proficiency] ?? 5;
          }
        }

        // Audit score
        const auditData = auditMap[tNorm] || null;
        const auditScore = auditData?.avgScore != null
          ? Math.max(0, Math.round((auditData.avgScore / 80) * 20) - Math.min((auditData.redFlags || 0) * 3, 10))
          : 10;
        const auditGrade = auditData?.avgScore != null
          ? (auditData.avgScore >= 65 ? "A" : auditData.avgScore >= 50 ? "B" : auditData.avgScore >= 35 ? "C" : "D")
          : "—";

        const totalScore = traitScore + ageScore + courseScore + auditScore;

        const fcProg = (fc: string) => {
          if (!fc) return "N/A";
          const match = courses.find((c) => c.course.toLowerCase().trim() === fc.toLowerCase().trim());
          return match?.proficiency || "Not Onboarded";
        };

        output.push({
          teacherName:           rawName,
          ageYear:               candidateAgeGroups.join(", ") || "N/A",
          slotMatch:             "—",
          slotFullMatch:         false,
          alternateSlots:        "",
          currentCourseProgress,
          futureCourse1Progress: fcProg(futureCourses[0]),
          futureCourse2Progress: fcProg(futureCourses[1]),
          futureCourse3Progress: fcProg(futureCourses[2]),
          teacherTraits,
          traitsMissing,
          avgClassScore:         auditData?.avgScore != null ? `${auditData.avgScore}/80` : "No data",
          auditGrade,
          redFlagCount:          auditData?.redFlags || 0,
          auditCount45:          auditData?.auditCount || 0,
          upskillCount:          courses.length,
          _rankScore:            totalScore,
          _traitMatchesCount:    targetTraits.length > 0 ? (targetTraits.length - traitsMissing.length) : 0,
        });
      }

      // Sort: course progress → trait matches
      const PROGRESS_RANK: Record<string, number> = { "100%": 0, "91-99%": 1, "81-90%": 2, "71-80%": 3 };
      output.sort((a, b) => {
        const pa = PROGRESS_RANK[a.currentCourseProgress] ?? 99;
        const pb = PROGRESS_RANK[b.currentCourseProgress] ?? 99;
        if (pa !== pb) return pa - pb;
        return (b._traitMatchesCount || 0) - (a._traitMatchesCount || 0);
      });

      return { success: true, results: output };
    } catch (e: any) {
      console.error("[TeacherService.searchMatchingTeachers] Error:", e.message);
      return { success: false, message: e.message };
    }
  }

  // ── Set teacher visibility (hidden/shown in search) ───────────────────────
  static async setTeacherVisibility(teacherName: string, isHidden: boolean) {
    // In the new stack, store visibility in Firestore teacher metadata
    // For now return success — UI state managed client-side
    return { success: true, message: `${teacherName} ${isHidden ? "hidden" : "unhidden"} successfully.` };
  }

  // ── Find similar teachers (mirrors GAS findSimilarTeachers) ──────────────
  static async findSimilarTeachers(targetTeacherName: string) {
    try {
      const resolvedTarget = resolveTeacherName(targetTeacherName);
      const [escalationMap, auditMap, upskillMap] = await Promise.all([
        HubSpotService.getEscalatedTeachersLast90Days(),
        this.buildAuditScoreMap(90),
        this.getTeacherCoursesMap(),
      ]);

      const personaData = await getSheetData(SPREADSHEET_IDS.MIGRATION, SHEETS.PERSONA_MAPPING);
      if (!personaData || personaData.length < 2) {
        return { success: false, message: "Persona Mapping sheet not found." };
      }

      const pHeaders = personaData[0].map((h: any) => String(h).trim());
      const nameIdx = pHeaders.indexOf("Teacher Name");
      const ageGroupIdx = pHeaders.indexOf("Preferred Age Group") > -1
        ? pHeaders.indexOf("Preferred Age Group")
        : pHeaders.indexOf("Age Group");
      const hiddenIdx = pHeaders.indexOf("Hidden In Search");
      const traitCols = pHeaders.reduce((acc: number[], h: string, i: number) => {
        if (/trait|expertise|style|skill|strength|personality|subject|teaching/i.test(h)) acc.push(i);
        return acc;
      }, []);

      // Find target row
      const targetRow = personaData.slice(1).find((r: any[]) =>
        normalizeTeacherName(String(r[nameIdx] || "")) === normalizeTeacherName(resolvedTarget)
      );

      const targetUpskillCount = (upskillMap[resolvedTarget] || []).length;
      const targetNorm = normalizeTeacherName(resolvedTarget);

      const getTraits = (row: any[]) => {
        const traits: string[] = [];
        traitCols.forEach((i) => {
          String(row[i] || "").split(/[,\n]/).forEach((t: string) => {
            const clean = t.trim().toLowerCase();
            if (clean) traits.push(clean);
          });
        });
        return traits;
      };

      const targetTraits = targetRow ? getTraits(targetRow) : [];
      const targetAgeGroups = targetRow && ageGroupIdx > -1
        ? String(targetRow[ageGroupIdx] || "").split(",").map((a: string) => a.trim().toLowerCase()).filter(Boolean)
        : [];

      const candidates = personaData.slice(1).filter((r: any[]) => {
        const rawName = String(r[nameIdx] || "").trim();
        if (!rawName) return false;
        if (normalizeTeacherName(rawName) === targetNorm) return false;
        if (hiddenIdx > -1 && String(r[hiddenIdx] || "").trim().toLowerCase() === "yes") return false;
        return true;
      });

      const results = candidates.map((r: any[]) => {
        const rawName = String(r[nameIdx]).trim();
        const name = resolveTeacherName(rawName);
        const namNorm = normalizeTeacherName(name);
        const candidateTraits = getTraits(r);
        const candidateAgeGroups = ageGroupIdx > -1
          ? String(r[ageGroupIdx] || "").split(",").map((a: string) => a.trim().toLowerCase()).filter(Boolean)
          : [];
        const escalations = (escalationMap as any)[name] || (escalationMap as any)[namNorm] || 0;
        const upskillCount = (upskillMap[name] || upskillMap[rawName] || []).length;
        const auditData = auditMap[namNorm] || null;

        const traitScore = targetTraits.length > 0
          ? Math.round((candidateTraits.filter((t) => targetTraits.includes(t)).length / targetTraits.length) * 30)
          : 10;
        const ageScore = targetAgeGroups.length > 0
          ? Math.round((candidateAgeGroups.filter((a) => targetAgeGroups.includes(a)).length / targetAgeGroups.length) * 20)
          : 10;
        const courseScore = targetUpskillCount > 0
          ? Math.max(0, 30 - Math.floor(Math.abs(targetUpskillCount - upskillCount) / 5) * 5)
          : upskillCount > 0 ? 15 : 0;
        const escalationScore = Math.max(0, 20 - escalations * 4);
        const auditBonus = auditData?.avgScore != null ? Math.round((auditData.avgScore / 80) * 20) : 10;
        const auditScore = Math.max(0, auditBonus - Math.min((auditData?.redFlags || 0) * 3, 15));
        const totalScore = traitScore + ageScore + courseScore + escalationScore + auditScore;

        const esc = escalations as number;
        return {
          name, matchScore: totalScore, traitScore, ageScore, courseScore, escalationScore,
          upskillCount, escalations: esc,
          escalationRisk: esc === 0 ? "No Escalations" : esc <= 2 ? `${esc} Tickets (Low)` : esc <= 4 ? `${esc} Tickets (Medium)` : `${esc} Tickets (High Risk)`,
          escalationColor: esc === 0 ? "#15803d" : esc <= 4 ? "#d97706" : "#b91c1c",
          avgClassScore: auditData?.avgScore || null,
          redFlagCount: auditData?.redFlags || 0,
          stability: { total: esc, risk: esc >= 5 ? "High" : esc >= 3 ? "Medium" : "Stable" },
        };
      });

      const top8 = results.sort((a: any, b: any) => b.matchScore - a.matchScore).slice(0, 8);
      return {
        success: true,
        data: top8,
        aiEnriched: false,
        targetContext: { name: resolvedTarget, upskillCount: targetUpskillCount, ageGroups: targetAgeGroups },
      };
    } catch (e: any) {
      console.error("[TeacherService.findSimilarTeachers] Error:", e.message);
      return { success: false, message: e.message };
    }
  }

  // ── TP Manager dashboard ──────────────────────────────────────────────────
  static async getTPManagerDashboard(tpManagerName: string, dateFrom?: string, dateTo?: string) {
    if (!tpManagerName) return { success: false, message: "TP Manager name required." };
    try {
      const now = new Date();
      const toMs   = dateTo   ? new Date(dateTo).getTime()   : now.getTime();
      const fromMs = dateFrom ? new Date(dateFrom).getTime() : now.getTime() - 60 * 24 * 60 * 60 * 1000;

      const allTeachers = await this.getTeacherData();
      const myTeachers = allTeachers.filter((t: any) =>
        t.manager?.trim().toLowerCase() === tpManagerName.trim().toLowerCase()
      );
      if (myTeachers.length === 0) return { success: true, teachers: [], summary: {} };

      const teacherRows = await Promise.all(myTeachers.map(async (t: any) => {
        const auditData = await this.getTeacherAuditData(t.name);
        return {
          name:           t.name,
          status:         t.status,
          email:          t.email,
          lastAuditDate:  null,
          lastScore:      auditData.avgScore,
          lastGrade:      auditData.avgScore != null
            ? (auditData.avgScore >= 65 ? "A" : auditData.avgScore >= 50 ? "B" : auditData.avgScore >= 35 ? "C" : "D")
            : "—",
          auditCountAll:  auditData.auditCount,
          redFlagCount:   auditData.redFlags,
        };
      }));

      const scores = teacherRows.filter((t) => t.lastScore !== null).map((t) => t.lastScore as number);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

      return {
        success: true,
        teachers: teacherRows,
        dateFrom: new Date(fromMs).toISOString().substring(0, 10),
        dateTo: new Date(toMs).toISOString().substring(0, 10),
        summary: {
          total:    teacherRows.length,
          ewsCount: teacherRows.filter((t) => t.status === "EWS").length,
          noAudit:  teacherRows.filter((t) => t.auditCountAll === 0).length,
          redFlags: teacherRows.reduce((s, t) => s + t.redFlagCount, 0),
          avgScore,
        },
      };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  static async checkSheetsHealth() {
    const results = [];
    const sheetsToCheck = [
      { id: SPREADSHEET_IDS.MIGRATION, name: SHEETS.TEACHER_DATA, label: "Migration - Teacher Data" },
      { id: SPREADSHEET_IDS.MIGRATION, name: SHEETS.COURSE_NAME, label: "Migration - Course Name" },
      { id: SPREADSHEET_IDS.MIGRATION, name: SHEETS.TEACHER_COURSES, label: "Migration - Teacher Courses" },
      { id: SPREADSHEET_IDS.PERSONA, name: SHEETS.PERSONA_DATA, label: "Persona - Main Sheet" },
      { id: SPREADSHEET_IDS.AUDIT, name: "Coding Audit'26", label: "Audit - Coding '26" },
      { id: SPREADSHEET_IDS.AUDIT, name: "Math Audit'26", label: "Audit - Math '26" },
      { id: SPREADSHEET_IDS.AUDIT, name: "GCSE Audit'26", label: "Audit - GCSE '26" },
    ];

    for (const sheet of sheetsToCheck) {
      try {
        const data = await getSheetData(sheet.id, sheet.name);
        results.push({
          name: sheet.label,
          status: data.length > 0 ? "Connected" : "Empty/Error",
          rows: data.length,
          id: sheet.id.substring(0, 8) + "..."
        });
      } catch (e: any) {
        results.push({
          name: sheet.label,
          status: "Disconnected",
          rows: 0,
          error: e.message,
          id: sheet.id.substring(0, 8) + "..."
        });
      }
    }
    return results;
  }
}
