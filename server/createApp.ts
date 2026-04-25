import express from "express";
import { HubSpotService } from "./services/hubspot.js";
import { WatiService } from "./services/wati.js";
import { AIService } from "./services/ai.js";
import { CalendarService } from "./services/calendar.js";
import { MigrationService } from "./services/migration.js";
import { AuditService } from "./services/audit.js";
import { TeacherService } from "./services/teacher.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use((_, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  });

  const authAttempts = new Map<string, { count: number; resetAt: number }>();
  const authWindowMs = 15 * 60 * 1000;
  const authMaxAttempts = 10;

  function getClientKey(req: express.Request) {
    const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    return forwarded || req.ip || "unknown";
  }

  function checkAuthRateLimit(req: express.Request) {
    const bodyUsername = typeof req.body?.username === "string" ? req.body.username.trim().toLowerCase() : "";
    const key = `${getClientKey(req)}:${bodyUsername}`;
    const now = Date.now();
    const current = authAttempts.get(key);

    if (!current || current.resetAt <= now) {
      authAttempts.set(key, { count: 1, resetAt: now + authWindowMs });
      return false;
    }

    current.count += 1;
    authAttempts.set(key, current);
    return current.count > authMaxAttempts;
  }

  // ── Health ────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  // ── Auth: username → email lookup (used by login page) ───
  app.post("/api/auth/lookup", async (req, res) => {
    try {
      const { username } = req.body;
      if (checkAuthRateLimit(req)) {
        return res.status(429).json({ error: "Too many login attempts. Please try again later." });
      }
      if (typeof username !== "string" || !username.trim() || username.length > 100) {
        return res.status(400).json({ error: "Username is required" });
      }
      const user = await MigrationService.lookupUserByUsername(username);
      if (!user) return res.status(404).json({ error: "User not found" });
      if (!user.isActive) return res.status(403).json({ error: "Account is inactive. Contact your administrator." });
      res.json({ email: user.email });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/auth/profile", async (req, res) => {
    try {
      const email = typeof req.query.email === "string" ? req.query.email : "";
      if (!email || email.length > 320) {
        return res.status(400).json({ error: "Valid email is required" });
      }

      const profile = await MigrationService.getUserProfileByEmail(email);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      if (!profile.isActive) {
        return res.status(403).json({ error: "Account is inactive. Contact your administrator." });
      }

      res.json(profile);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/users", async (_req, res) => {
    try {
      res.json(await TeacherService.getUsers());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/users/:userId/role", async (req, res) => {
    try {
      const result = await TeacherService.updateUserRole(req.params.userId, req.body.role);
      if (!result.success) return res.status(404).json({ error: result.message });
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/migrations", async (req, res) => {
    try {
      const limitCount = Number(req.query.limit || 50);
      res.json(await TeacherService.getMigrationLogs(limitCount));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/migrations", async (req, res) => {
    try {
      const result = await TeacherService.logMigrationEntry(req.body || {});
      if (!result.success) return res.status(400).json({ error: result.message });
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/email-activities", async (req, res) => {
    try {
      const limitCount = Number(req.query.limit || 20);
      res.json(await TeacherService.getEmailActivities(limitCount));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── HubSpot ───────────────────────────────────────────────
  app.get("/api/hubspot/deal/:jlid", async (req, res) => {
    try {
      const data = await HubSpotService.fetchByJlid(req.params.jlid);
      if (!data) return res.status(404).json({ error: "Learner not found" });
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/hubspot/ticket/:jlid", async (req, res) => {
    try {
      const data = await HubSpotService.fetchLatestMigrationTicket(req.params.jlid);
      if (!data) return res.status(404).json({ error: "Ticket not found" });
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/hubspot/history/:dealId", async (req, res) => {
    try {
      res.json(await HubSpotService.fetchHubspotHistory(req.params.dealId));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/hubspot/history/comprehensive/:jlid", async (req, res) => {
    try {
      res.json(await HubSpotService.getComprehensiveLearnerHistory(req.params.jlid));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/hubspot/renewal/:jlid", async (req, res) => {
    try {
      const data = await HubSpotService.fetchRenewalData(req.params.jlid);
      if (!data.success) return res.status(404).json({ error: (data as any).message });
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Teachers ──────────────────────────────────────────────
  app.get("/api/teachers/check-migration", async (req, res) => {
    try {
      const { jlid, teacherName } = req.query;
      res.json(await TeacherService.checkNewTeacherForLearner(jlid as string, teacherName as string));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/teachers/attrition-report", async (req, res) => {
    try {
      res.json(await HubSpotService.getTeacherAttritionReport(null as any, req.query.teacherName as string));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/teachers", async (_req, res) => {
    try {
      res.json(await TeacherService.getTeacherDetailsForTable());
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/teachers/names", async (_req, res) => {
    try {
      res.json(await TeacherService.getActiveTeachers());
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/teachers/load/:name", async (req, res) => {
    try {
      res.json(await TeacherService.getTeacherLoad(req.params.name));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/teachers/profile/:name", async (req, res) => {
    try {
      res.json(await TeacherService.getTeacherProfileData(req.params.name));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/teachers/search", async (req, res) => {
    try {
      res.json(await TeacherService.searchMatchingTeachers(req.body));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/teachers/similar/:name", async (req, res) => {
    try {
      res.json(await TeacherService.findSimilarTeachers(req.params.name));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/teachers/tp-dashboard/:name", async (req, res) => {
    try {
      const { fromDate, toDate } = req.query;
      res.json(await TeacherService.getTPManagerDashboard(req.params.name, fromDate as string, toDate as string));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/teachers/notes/:name", async (req, res) => {
    try {
      res.json(await TeacherService.getTPNotes(req.params.name));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/teachers/notes", async (req, res) => {
    try {
      const { teacherName, tpManager, noteText, createdBy } = req.body;
      res.json(await TeacherService.saveTPNote(teacherName, tpManager, noteText, createdBy));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/teachers/upskill/:name", async (req, res) => {
    try {
      res.json(await TeacherService.getUpskillTasksForTeacher(req.params.name));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.patch("/api/teachers/upskill/:id", async (req, res) => {
    try {
      const { status, notes } = req.body;
      res.json(await TeacherService.updateUpskillStatus(req.params.id, status, notes));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Managers ──────────────────────────────────────────────
  app.get("/api/managers/tp",        async (_req, res) => { try { res.json(await TeacherService.getTPManagers());   } catch (e: any) { res.status(500).json({ error: e.message }); } });
  app.get("/api/managers/cls",       async (_req, res) => { try { res.json(await TeacherService.getCLSManagers());  } catch (e: any) { res.status(500).json({ error: e.message }); } });
  app.get("/api/managers/jetguides", async (_req, res) => { try { res.json(await TeacherService.getJetGuides());    } catch (e: any) { res.status(500).json({ error: e.message }); } });

  // ── Courses ───────────────────────────────────────────────
  app.get("/api/courses", async (_req, res) => {
    try {
      res.json(await TeacherService.getCourseNames());
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── WATI ──────────────────────────────────────────────────
  app.post("/api/wati/send", async (req, res) => {
    try {
      const { phoneNumber, templateName, parameters } = req.body;
      res.json(await WatiService.sendMessage(phoneNumber, templateName, parameters));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── AI ────────────────────────────────────────────────────
  app.get("/api/ai/dashboard-stats", async (_req, res) => {
    try {
      res.json(await TeacherService.getAIDashboardStats());
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { data, context } = req.body;
      res.json({ result: await AIService.analyzeData(data, context) });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Calendar ──────────────────────────────────────────────
  app.get("/api/calendar/verify/:jlid", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      res.json(await CalendarService.verifySchedule(req.params.jlid, startDate as string, endDate as string));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Audit ─────────────────────────────────────────────────
  app.get("/api/audit/log", async (req, res) => {
    try {
      res.json(await AuditService.getAuditLog(req.query));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/audit/log", async (req, res) => {
    try {
      const { action, intervenedBy, ...details } = req.body;
      await AuditService.logAction(action, details, intervenedBy);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/audit/details/:dealId", async (req, res) => {
    try {
      res.json(await AuditService.getAuditDetails(req.params.dealId));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/audit/onboarding", async (req, res) => {
    try {
      const { fromDate, toDate } = req.query;
      res.json(await AuditService.runOnboardingAudit(fromDate as string, toDate as string));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/audit/tasks", async (_req, res) => {
    try {
      res.json(await AuditService.getTasks());
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.patch("/api/audit/tasks/:taskId", async (req, res) => {
    try {
      res.json(await AuditService.updateTaskStatus(req.params.taskId, req.body.status));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Dashboard ─────────────────────────────────────────────
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const teachers = await TeacherService.getTeacherData();
      const activeTeachers = teachers.filter((t: any) => t.status === "Active").length;
      res.json({
        activeLearners:  { value: 2546, change: 12, trend: "up" },
        migrations30d:   { value: 42,   change: -5, trend: "down" },
        activeTeachers:  { value: activeTeachers, change: 3, trend: "up" },
        successRate:     { value: 94,   change: 2,  trend: "up" }
      });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── System Health ─────────────────────────────────────────
  app.get("/api/system/health/sheets", async (_req, res) => {
    try {
      res.json(await TeacherService.checkSheetsHealth());
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Migration ─────────────────────────────────────────────
  app.post("/api/migrate", async (_req, res) => {
    try {
      const userCount      = await MigrationService.migrateUsers();
      const migrationCount = await MigrationService.migrateMigrations();
      res.json({ message: "Migration completed", usersMigrated: userCount, migrationsMigrated: migrationCount });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Communication ─────────────────────────────────────────
  app.post("/api/communication/send", async (req, res) => {
    try {
      const { type, data } = req.body;
      const { EmailService } = await import("./services/email.js");

      let emailResult: any = { success: true };
      let whatsappResult: any = { success: true };

      if (type === "onboarding" || type === "parent-email") {
        const html = EmailService.generateOnboardingEmail(data);
        const subject = `Welcome to JetLearn - ${data.dealname || data.learnerName}`;
        emailResult = await EmailService.sendEmail(data.parentEmail, subject, html);
        if (data.generateInvoice) {
          const invoiceHtml = EmailService.generateInvoiceHtml(data);
          await EmailService.sendEmail(data.parentEmail, `Invoice for ${data.dealname || data.learnerName}`, invoiceHtml);
        }
      } else if (type === "migration") {
        const html = EmailService.generateMigrationEmail(data);
        emailResult = await EmailService.sendEmail(data.parentEmail, `Teacher Update for ${data.dealname || data.learnerName}`, html);
      } else if (type === "minecraft") {
        emailResult = await EmailService.sendEmail(data.parentEmail, "Minecraft Installation Guide - JetLearn", EmailService.generateMinecraftGuide(data));
      } else if (type === "roblox") {
        emailResult = await EmailService.sendEmail(data.parentEmail, "Roblox Studio Setup Guide - JetLearn", EmailService.generateRobloxGuide(data));
      }

      if (data.sendWhatsApp && data.whatsappNumber) {
        try {
          whatsappResult = await WatiService.sendMessage(
            data.whatsappNumber,
            type === "onboarding" ? "onboarding_welcome" : "migration_update",
            [
              { name: "learner_name", value: data.dealname || data.learnerName },
              { name: "teacher_name", value: data.teacher || data.newTeacher },
              { name: "course_name",  value: data.current_course },
            ]
          );
        } catch (e) {
          whatsappResult = { success: false, message: "WhatsApp failed" };
        }
      }

      const subjectMap: Record<string, string> = {
        onboarding: `Welcome to JetLearn - ${data.dealname || data.learnerName || ""}`,
        "parent-email": `Welcome to JetLearn - ${data.dealname || data.learnerName || ""}`,
        migration: `Teacher Update for ${data.dealname || data.learnerName || ""}`,
        minecraft: "Minecraft Installation Guide - JetLearn",
        roblox: "Roblox Studio Setup Guide - JetLearn",
      };

      await TeacherService.logEmailActivity({
        type,
        jlid: data.jlid,
        learnerName: data.dealname || data.learnerName,
        parentEmail: data.parentEmail,
        course: data.current_course,
        status: emailResult?.success === false ? "Failed" : "Delivered",
        subject: subjectMap[type] || "JetLearn Communication",
        intervenedBy: data.intervenedBy,
      });

      res.json({ success: true, email: emailResult, whatsapp: whatsappResult });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Certificates ─────────────────────────────────────────────
  app.post("/api/certificates/send", async (req, res) => {
    try {
      const { CertificateService } = await import("./services/certificate.js");
      const { jlid, learnerName, courseName, parentEmail, parentName, sentBy } = req.body;
      res.json(await CertificateService.sendCertificateEmail(jlid, learnerName, courseName, parentEmail, parentName, sentBy));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/certificates/bulk", async (req, res) => {
    try {
      const { CertificateService } = await import("./services/certificate.js");
      const { jlid, learnerName, courses, parentEmail, parentName, sentBy } = req.body;
      res.json(await CertificateService.sendBulkCertificates(jlid, learnerName, courses, parentEmail, parentName, sentBy));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/certificates/log", async (req, res) => {
    try {
      const { CertificateService } = await import("./services/certificate.js");
      res.json(await CertificateService.getCertificateLog(Number(req.query.limit || 50)));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  return app;
}
