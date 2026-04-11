import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { HubSpotService } from "./server/services/hubspot.js";
import { WatiService } from "./server/services/wati.js";
import { AIService } from "./server/services/ai.js";
import { CalendarService } from "./server/services/calendar.js";
import { MigrationService } from "./server/services/migration.js";
import { AuditService } from "./server/services/audit.js";
import { ReportService } from "./server/services/report.js";
import { TeacherService } from "./server/services/teacher.js";
import { InvoiceService } from "./server/services/invoice.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Generic error handler wrapper ──────────────────────────────────────────
function handle(fn: (req: express.Request, res: express.Response) => Promise<any>) {
  return async (req: express.Request, res: express.Response) => {
    try {
      await fn(req, res);
    } catch (error: any) {
      console.error(`[API Error] ${req.path}:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json({ limit: "10mb" }));

  // ════════════════════════════════════════════════════════════════════════════
  // HEALTH
  // ════════════════════════════════════════════════════════════════════════════
  app.get("/api/health", (_, res) => res.json({ status: "ok" }));

  // ════════════════════════════════════════════════════════════════════════════
  // HUBSPOT — LEARNER / DEAL
  // ════════════════════════════════════════════════════════════════════════════

  // Fetch deal data by JLID
  app.get("/api/hubspot/deal/:jlid", handle(async (req, res) => {
    const data = await HubSpotService.fetchByJlid(req.params.jlid);
    if (!data || !data.success) return res.status(404).json({ success: false, message: "Learner not found" });
    res.json(data);
  }));

  // Fetch latest migration ticket by JLID
  app.get("/api/hubspot/ticket/:jlid", handle(async (req, res) => {
    const data = await HubSpotService.fetchLatestMigrationTicket(req.params.jlid);
    if (!data || !data.found) return res.status(404).json({ success: false, message: "Ticket not found" });
    res.json(data);
  }));

  // Hybrid deal + ticket data (used by migration form)
  app.get("/api/hubspot/hybrid/:jlid", handle(async (req, res) => {
    const data = await HubSpotService.fetchHybridData(req.params.jlid);
    if (!data || !data.success) return res.status(404).json(data);
    res.json(data);
  }));

  // Persona smart data (onboarding vs migration mode)
  app.get("/api/hubspot/persona/:jlid", handle(async (req, res) => {
    const data = await HubSpotService.fetchPersonaSmartData(req.params.jlid);
    res.json(data);
  }));

  // Renewal data — deal + line items
  app.get("/api/hubspot/renewal/:jlid", handle(async (req, res) => {
    const data = await HubSpotService.fetchRenewalData(req.params.jlid);
    res.json(data);
  }));

  // Deals by onboarding completion date range
  app.get("/api/hubspot/onboarding-deals", handle(async (req, res) => {
    const { fromDate, toDate } = req.query as { fromDate: string; toDate: string };
    if (!fromDate || !toDate) return res.status(400).json({ success: false, message: "fromDate and toDate are required" });
    const data = await HubSpotService.fetchDealsByOnboardingDate(fromDate, toDate);
    res.json({ success: true, data });
  }));

  // HubSpot ticket history for a deal (for learner history panel)
  app.get("/api/hubspot/history/:dealId", handle(async (req, res) => {
    const data = await HubSpotService.fetchHubspotHistory(req.params.dealId);
    res.json({ success: true, data });
  }));

  // Latest sales/onboarding note for a deal
  app.get("/api/hubspot/note/:dealId", handle(async (req, res) => {
    const note = await HubSpotService.fetchLatestSalesNoteForDeal(req.params.dealId);
    res.json({ success: true, note: note || null });
  }));

  // Log email engagement to HubSpot deal
  app.post("/api/hubspot/log-email", handle(async (req, res) => {
    const { dealId, subject, htmlBody } = req.body;
    if (!dealId || !subject) return res.status(400).json({ success: false, message: "dealId and subject are required" });
    await HubSpotService.logEmailToHubspot(dealId, subject, htmlBody || "");
    res.json({ success: true });
  }));

  // Add note to HubSpot ticket
  app.post("/api/hubspot/ticket-note", handle(async (req, res) => {
    const { ticketId, noteBody } = req.body;
    if (!ticketId || !noteBody) return res.status(400).json({ success: false, message: "ticketId and noteBody are required" });
    await HubSpotService.addNoteToTicket(ticketId, noteBody);
    res.json({ success: true });
  }));

  // Create upskill task on HubSpot
  app.post("/api/hubspot/upskill-task", handle(async (req, res) => {
    const { jlid, teacherName, learnerName, tpManagerHsId, gapCourses, dealId } = req.body;
    await HubSpotService.createUpskillTask(jlid, teacherName, learnerName, tpManagerHsId, gapCourses, dealId);
    res.json({ success: true });
  }));

  // Phone number lookup for a deal
  app.get("/api/hubspot/phone/:dealId", handle(async (req, res) => {
    const data = await HubSpotService.getPhoneNumbersForDeal(req.params.dealId);
    res.json({ success: true, ...data });
  }));

  // ════════════════════════════════════════════════════════════════════════════
  // HUBSPOT — TEACHERS
  // ════════════════════════════════════════════════════════════════════════════

  // Active learners per teacher (full paginated scan)
  app.get("/api/hubspot/learners-per-teacher", handle(async (req, res) => {
    const data = await HubSpotService.getActiveLearnersPerTeacher();
    res.json({ success: true, data });
  }));

  // Total active learner count (fast)
  app.get("/api/hubspot/active-learner-count", handle(async (req, res) => {
    const data = await HubSpotService.getTotalActiveLearnerCount();
    res.json(data);
  }));

  // Teacher attrition report (active learners under a specific teacher)
  app.get("/api/hubspot/teacher-attrition/:teacherName", handle(async (req, res) => {
    const { teacherHsId } = req.query as { teacherHsId?: string };
    const data = await HubSpotService.getTeacherAttritionReport(teacherHsId || "", req.params.teacherName);
    res.json(data);
  }));

  // Teacher escalation history
  app.get("/api/hubspot/teacher-escalations/:teacherName", handle(async (req, res) => {
    const { teacherHsId } = req.query as { teacherHsId?: string };
    const data = await HubSpotService.getTeacherEscalationHistory(teacherHsId || "", req.params.teacherName);
    res.json(data);
  }));

  // Escalated teachers in last 90 days (map of teacher → count)
  app.get("/api/hubspot/escalated-teachers", handle(async (req, res) => {
    const data = await HubSpotService.getEscalatedTeachersLast90Days();
    res.json({ success: true, data });
  }));

  // ════════════════════════════════════════════════════════════════════════════
  // HUBSPOT — LEARNER MIGRATION HISTORY & TIMELINE
  // ════════════════════════════════════════════════════════════════════════════

  // Migration history stats for a JLID (inbound/outbound counts + events)
  app.get("/api/hubspot/migration-stats/:jlid", handle(async (req, res) => {
    const data = await HubSpotService.getMigrationHistoryStats(req.params.jlid);
    res.json({ success: true, ...data });
  }));

  // Comprehensive learner history (powers Migration Timeline page)
  app.get("/api/hubspot/learner-history/:jlid", handle(async (req, res) => {
    const data = await HubSpotService.getComprehensiveLearnerHistory(req.params.jlid);
    res.json(data);
  }));

  // ════════════════════════════════════════════════════════════════════════════
  // WATI — WHATSAPP COMMUNICATION
  // ════════════════════════════════════════════════════════════════════════════

  // Send WhatsApp template message
  app.post("/api/wati/send", handle(async (req, res) => {
    const { phoneNumber, templateName, parameters } = req.body;
    if (!phoneNumber || !templateName) return res.status(400).json({ success: false, message: "phoneNumber and templateName are required" });
    const result = await WatiService.sendMessage(phoneNumber, templateName, parameters);
    res.json(result);
  }));

  // Get WATI templates list
  app.get("/api/wati/templates", handle(async (req, res) => {
    const result = await WatiService.getTemplates();
    res.json(result);
  }));

  // Get conversation history for a phone number
  app.get("/api/wati/conversation/:phoneNumber", handle(async (req, res) => {
    const result = await WatiService.getConversation(req.params.phoneNumber);
    res.json(result);
  }));

  // ════════════════════════════════════════════════════════════════════════════
  // AI — ANALYSIS & INSIGHTS
  // ════════════════════════════════════════════════════════════════════════════

  // General data analysis
  app.post("/api/ai/analyze", handle(async (req, res) => {
    const { data, context } = req.body;
    const result = await AIService.analyzeData(data, context);
    res.json({ success: true, result });
  }));

  // Generate AI insights (free-form prompt)
  app.post("/api/ai/insights", handle(async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: "prompt is required" });
    const result = await AIService.generateInsights(prompt);
    res.json({ success: true, result });
  }));

  // AI teacher matching / persona recommendations
  app.post("/api/ai/match-teachers", handle(async (req, res) => {
    const { learnerData, teacherPool, context } = req.body;
    const result = await AIService.matchTeachers(learnerData, teacherPool, context);
    res.json({ success: true, result });
  }));

  // AI onboarding audit analysis (compare deal vs sales note vs calendar)
  app.post("/api/ai/audit-analysis", handle(async (req, res) => {
    const { hubspotProps, noteData, calendarData } = req.body;
    const result = await AIService.runAuditAnalysis(hubspotProps, noteData, calendarData);
    res.json({ success: true, result });
  }));

  // AI smart invoice plan generator
  app.post("/api/ai/smart-invoice", handle(async (req, res) => {
    const { jlid } = req.body;
    if (!jlid) return res.status(400).json({ success: false, message: "jlid is required" });
    const result = await AIService.generateSmartInvoicePlan(jlid);
    res.json(result);
  }));

  // AI monthly report insights
  app.post("/api/ai/report-insights", handle(async (req, res) => {
    const { reportData, previousMonthData } = req.body;
    const result = await AIService.generateReportInsights(reportData, previousMonthData);
    res.json({ success: true, result });
  }));

  // ════════════════════════════════════════════════════════════════════════════
  // CALENDAR — SCHEDULE VERIFICATION
  // ════════════════════════════════════════════════════════════════════════════

  // Verify learner subscription schedule against Google Calendar
  app.get("/api/calendar/verify/:jlid", handle(async (req, res) => {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const result = await CalendarService.verifySchedule(req.params.jlid, startDate, endDate);
    res.json(result);
  }));

  // Check if a teacher is free at a given slot (for migration form)
  app.post("/api/calendar/check-slot", handle(async (req, res) => {
    const { teacherName, slotParams } = req.body;
    if (!teacherName || !slotParams) return res.status(400).json({ success: false, message: "teacherName and slotParams are required" });
    const result = await CalendarService.checkTeacherSlot(teacherName, slotParams);
    res.json(result);
  }));

  // ════════════════════════════════════════════════════════════════════════════
  // AUDIT SERVICE — AUDIT LOG & ONBOARDING AUDIT
  // ════════════════════════════════════════════════════════════════════════════

  // Get paginated audit log
  app.get("/api/audit/log", handle(async (req, res) => {
    const { page, limit, status, fromDate, toDate, search } = req.query as Record<string, string>;
    const result = await AuditService.getAuditLog({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      status,
      fromDate,
      toDate,
      search,
    });
    res.json(result);
  }));

  // Log an action to the audit log
  app.post("/api/audit/log", handle(async (req, res) => {
    const { action, jlid, learner, oldTeacher, newTeacher, course, status, notes, reason, intervenedBy } = req.body;
    await AuditService.logAction(action, jlid, learner, oldTeacher, newTeacher, course, status, notes, reason, intervenedBy);
    res.json({ success: true });
  }));

  // Export audit data for a date range
  app.get("/api/audit/export", handle(async (req, res) => {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const result = await AuditService.exportAuditData(startDate, endDate);
    res.json({ success: true, data: result });
  }));

  // Run onboarding audit for a date range
  app.post("/api/audit/onboarding", handle(async (req, res) => {
    const { fromDate, toDate } = req.body;
    if (!fromDate || !toDate) return res.status(400).json({ success: false, message: "fromDate and toDate are required" });
    const result = await AuditService.runOnboardingAudit({ fromDate, toDate });
    res.json(result);
  }));

  // Get audit details for a specific deal (field comparison vs sales note vs calendar)
  app.get("/api/audit/deal/:dealId", handle(async (req, res) => {
    const result = await AuditService.getAuditDetails(req.params.dealId);
    res.json(result);
  }));

  // Log user activity
  app.post("/api/audit/user-activity", handle(async (req, res) => {
    const { username, action, details } = req.body;
    await AuditService.logUserActivity(username, action, details);
    res.json({ success: true });
  }));

  // ════════════════════════════════════════════════════════════════════════════
  // TEACHER SERVICE
  // ════════════════════════════════════════════════════════════════════════════

  // Get all active teachers
  app.get("/api/teachers", handle(async (req, res) => {
    const result = await TeacherService.getActiveTeachers();
    res.json({ success: true, data: result });
  }));

  // Get teacher data (full list with metadata)
  app.get("/api/teachers/data", handle(async (req, res) => {
    const result = await TeacherService.getTeacherData();
    res.json({ success: true, data: result });
  }));

  // Get teacher load (learner count, courses)
  app.get("/api/teachers/load/:teacherName", handle(async (req, res) => {
    const result = await TeacherService.getTeacherLoad(req.params.teacherName);
    res.json(result);
  }));

  // Get teacher courses / upskilling status
  app.get("/api/teachers/courses/:teacherName", handle(async (req, res) => {
    const result = await TeacherService.getTeacherCourses(req.params.teacherName);
    res.json(result);
  }));

  // Find teachers upskilled in a set of courses (for persona / migration)
  app.post("/api/teachers/find-upskilled", handle(async (req, res) => {
    const { courseLabels, excludeTeacher, jlid } = req.body;
    const result = await TeacherService.findUpskillAlternatives(courseLabels, excludeTeacher, jlid);
    res.json(result);
  }));

  // Check new teacher against learner history (migration intelligence)
  app.post("/api/teachers/check-for-learner", handle(async (req, res) => {
    const { jlid, newTeacherName, slotParams } = req.body;
    if (!jlid || !newTeacherName) return res.status(400).json({ success: false, message: "jlid and newTeacherName are required" });
    const result = await TeacherService.checkNewTeacherForLearner(jlid, newTeacherName, slotParams);
    res.json(result);
  }));

  // Get TP managers list
  app.get("/api/teachers/tp-managers", handle(async (req, res) => {
    const result = await TeacherService.getTPManagers();
    res.json({ success: true, data: result });
  }));

  // ════════════════════════════════════════════════════════════════════════════
  // REPORT SERVICE
  // ════════════════════════════════════════════════════════════════════════════

  // Monthly migration report
  app.get("/api/reports/monthly", handle(async (req, res) => {
    const { month, year, perspective } = req.query as Record<string, string>;
    const result = await ReportService.generateMonthlyReport(
      month ? parseInt(month) : new Date().getMonth(),
      year ? parseInt(year) : new Date().getFullYear(),
      perspective || "All"
    );
    res.json(result);
  }));

  // Enhanced migration report for a date range
  app.get("/api/reports/migrations", handle(async (req, res) => {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    if (!startDate || !endDate) return res.status(400).json({ success: false, message: "startDate and endDate are required" });
    const result = await ReportService.getEnhancedMigrationReport({ startDate, endDate });
    res.json(result);
  }));

  // Dashboard statistics (onboardings, active learners, etc.)
  app.get("/api/reports/dashboard-stats", handle(async (req, res) => {
    const result = await ReportService.getDashboardStatistics();
    res.json(result);
  }));

  // Full new dashboard data (KPIs, action cards)
  app.get("/api/reports/dashboard", handle(async (req, res) => {
    const result = await ReportService.getNewDashboardData();
    res.json(result);
  }));

  // ════════════════════════════════════════════════════════════════════════════
  // INVOICE SERVICE
  // ════════════════════════════════════════════════════════════════════════════

  // Get invoice products list
  app.get("/api/invoices/products", handle(async (req, res) => {
    const result = await InvoiceService.getInvoiceProducts();
    res.json({ success: true, data: result });
  }));

  // Get live currency rates
  app.get("/api/invoices/currency-rates", handle(async (req, res) => {
    const result = await InvoiceService.getLiveCurrencyRates();
    res.json({ success: true, data: result });
  }));

  // ════════════════════════════════════════════════════════════════════════════
  // MIGRATION SERVICE — DATA MIGRATION (Sheets → Firestore)
  // ════════════════════════════════════════════════════════════════════════════

  app.post("/api/migrate", handle(async (req, res) => {
    const userCount = await MigrationService.migrateUsers();
    const migrationCount = await MigrationService.migrateMigrations();
    res.json({
      success: true,
      message: "Migration completed successfully",
      usersMigrated: userCount,
      migrationsMigrated: migrationCount,
    });
  }));

  // ════════════════════════════════════════════════════════════════════════════
  // COMMUNICATION PAGE DATA
  // ════════════════════════════════════════════════════════════════════════════

  // All data needed by the communication page (teachers, courses, timezones, etc.)
  app.get("/api/communication/page-data", handle(async (req, res) => {
    const [teachers, courses, tpManagers, invoiceProducts] = await Promise.all([
      TeacherService.getActiveTeachers(),
      TeacherService.getCourseNames(),
      TeacherService.getTPManagers(),
      InvoiceService.getInvoiceProducts(),
    ]);

    const TIMEZONES = [
      "(GMT-12:00) International Date Line West", "(GMT-11:00) Coordinated Universal Time-11",
      "(GMT-10:00) Hawaii", "(GMT-09:00) Alaska", "(GMT-08:00) Pacific Time (US & Canada)",
      "(GMT-07:00) Mountain Time (US & Canada)", "(GMT-07:00) Arizona",
      "(GMT-06:00) Central Time (US & Canada)", "(GMT-05:00) Eastern Time (US & Canada)",
      "(GMT-05:00) Indiana (East)", "(GMT-04:00) Atlantic Time (Canada)",
      "(GMT-03:00) Brasilia", "(GMT-03:00) Buenos Aires",
      "(GMT+00:00) Dublin, Edinburgh, Lisbon, London",
      "(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
      "(GMT+01:00) Brussels, Copenhagen, Madrid, Paris",
      "(GMT+02:00) Athens, Bucharest", "(GMT+02:00) Cairo", "(GMT+02:00) Istanbul",
      "(GMT+03:00) Baghdad", "(GMT+03:00) Kuwait, Riyadh",
      "(GMT+03:00) Moscow, St. Petersburg, Volgograd",
      "(GMT+03:30) Tehran", "(GMT+04:00) Abu Dhabi, Muscat", "(GMT+04:00) Baku",
      "(GMT+04:30) Kabul", "(GMT+05:00) Islamabad, Karachi",
      "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi", "(GMT+05:30) Sri Jayawardenepura",
      "(GMT+05:45) Kathmandu", "(GMT+06:00) Dhaka",
      "(GMT+07:00) Bangkok, Hanoi, Jakarta",
      "(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
      "(GMT+08:00) Kuala Lumpur, Singapore", "(GMT+08:00) Perth",
      "(GMT+09:00) Osaka, Sapporo, Tokyo", "(GMT+09:00) Seoul",
      "(GMT+09:30) Adelaide", "(GMT+10:00) Canberra, Melbourne, Sydney",
      "(GMT+10:00) Brisbane", "(GMT+12:00) Auckland, Wellington",
    ];

    res.json({
      success: true,
      teachers,
      courses,
      tpManagers,
      invoiceProducts,
      timezones: TIMEZONES,
      jetGuides: [
        "Abhishek Nayak", "Aishwarya Jain", "Anamika Parmar",
        "Molishka Rai", "Spreha Jain", "Satyam Mehra", "Sunil Amarnath",
      ],
    });
  }));

  // ════════════════════════════════════════════════════════════════════════════
  // VITE / STATIC — Frontend serving
  // ════════════════════════════════════════════════════════════════════════════
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 JetLearn server running on http://localhost:${PORT}`);
    console.log(`   Mode: ${process.env.NODE_ENV || "development"}\n`);
  });
}

startServer();