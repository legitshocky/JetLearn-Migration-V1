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
import { TeacherService } from "./server/services/teacher.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // HubSpot Routes
  app.get("/api/hubspot/deal/:jlid", async (req, res) => {
    try {
      const data = await HubSpotService.fetchByJlid(req.params.jlid);
      if (!data) return res.status(404).json({ error: "Learner not found" });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/hubspot/ticket/:jlid", async (req, res) => {
    try {
      const data = await HubSpotService.fetchLatestMigrationTicket(req.params.jlid);
      if (!data) return res.status(404).json({ error: "Ticket not found" });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/hubspot/history/:dealId", async (req, res) => {
    try {
      const data = await HubSpotService.fetchHubspotHistory(req.params.dealId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/hubspot/history/comprehensive/:jlid", async (req, res) => {
    try {
      const data = await HubSpotService.getComprehensiveLearnerHistory(req.params.jlid);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/hubspot/renewal/:jlid", async (req, res) => {
    try {
      const data = await HubSpotService.fetchRenewalData(req.params.jlid);
      if (!data.success) return res.status(404).json({ error: data.message });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teachers/check-migration", async (req, res) => {
    try {
      const { jlid, teacherName } = req.query;
      const result = await TeacherService.checkNewTeacherForLearner(jlid as string, teacherName as string);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teachers/attrition-report", async (req, res) => {
    try {
      const { teacherName } = req.query;
      const result = await HubSpotService.getTeacherAttritionReport(null as any, teacherName as string);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // WATI Routes
  app.post("/api/wati/send", async (req, res) => {
    try {
      const { phoneNumber, templateName, parameters } = req.body;
      const result = await WatiService.sendMessage(phoneNumber, templateName, parameters);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Routes
  app.get("/api/ai/dashboard-stats", async (req, res) => {
    try {
      const result = await TeacherService.getAIDashboardStats();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { data, context } = req.body;
      const result = await AIService.analyzeData(data, context);
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Calendar Routes
  app.get("/api/calendar/verify/:jlid", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const result = await CalendarService.verifySchedule(
        req.params.jlid,
        startDate as string,
        endDate as string
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Audit Routes
  app.get("/api/audit/log", async (req, res) => {
    try {
      const result = await AuditService.getAuditLog(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit/log", async (req, res) => {
    try {
      const { action, intervenedBy, ...details } = req.body;
      await AuditService.logAction(action, details, intervenedBy);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit/details/:dealId", async (req, res) => {
    try {
      const result = await AuditService.getAuditDetails(req.params.dealId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const teachers = await TeacherService.getTeacherData();
      const activeTeachers = teachers.filter(t => t.status === "Active").length;
      
      res.json({
        activeLearners: { value: 2546, change: 12, trend: "up" },
        migrations30d: { value: 42, change: -5, trend: "down" },
        activeTeachers: { value: activeTeachers, change: 3, trend: "up" },
        successRate: { value: 94, change: 2, trend: "up" }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit/onboarding", async (req, res) => {
    try {
      const { fromDate, toDate } = req.query;
      const result = await AuditService.runOnboardingAudit(fromDate as string, toDate as string);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit/tasks", async (req, res) => {
    try {
      const result = await AuditService.getTasks();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/audit/tasks/:taskId", async (req, res) => {
    try {
      const result = await AuditService.updateTaskStatus(req.params.taskId, req.body.status);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teacher Routes
  app.get("/api/teachers", async (req, res) => {
    try {
      const result = await TeacherService.getTeacherDetailsForTable();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teachers/names", async (req, res) => {
    try {
      const result = await TeacherService.getActiveTeachers();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/managers/tp", async (req, res) => {
    try {
      const result = await TeacherService.getTPManagers();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/managers/cls", async (req, res) => {
    try {
      const result = await TeacherService.getCLSManagers();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/managers/jetguides", async (req, res) => {
    try {
      const result = await TeacherService.getJetGuides();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teachers/load/:name", async (req, res) => {
    try {
      const result = await TeacherService.getTeacherLoad(req.params.name);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teachers/profile/:name", async (req, res) => {
    try {
      const result = await TeacherService.getTeacherProfileData(req.params.name);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/teachers/search", async (req, res) => {
    try {
      const result = await TeacherService.searchMatchingTeachers(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teachers/similar/:name", async (req, res) => {
    try {
      const result = await TeacherService.findSimilarTeachers(req.params.name);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/system/health/sheets", async (req, res) => {
    try {
      const result = await TeacherService.checkSheetsHealth();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teachers/tp-dashboard/:name", async (req, res) => {
    try {
      const { fromDate, toDate } = req.query;
      const result = await TeacherService.getTPManagerDashboard(
        req.params.name,
        fromDate as string,
        toDate as string
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teachers/notes/:name", async (req, res) => {
    try {
      const result = await TeacherService.getTPNotes(req.params.name);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/teachers/notes", async (req, res) => {
    try {
      const { teacherName, tpManager, noteText, createdBy } = req.body;
      const result = await TeacherService.saveTPNote(teacherName, tpManager, noteText, createdBy);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teachers/upskill/:name", async (req, res) => {
    try {
      const result = await TeacherService.getUpskillTasksForTeacher(req.params.name);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/teachers/upskill/:id", async (req, res) => {
    try {
      const { status, notes } = req.body;
      const result = await TeacherService.updateUpskillStatus(req.params.id, status, notes);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/courses", async (req, res) => {
    try {
      const result = await TeacherService.getCourseNames();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Migration Routes
  app.post("/api/migrate", async (req, res) => {
    try {
      const userCount = await MigrationService.migrateUsers();
      const migrationCount = await MigrationService.migrateMigrations();
      res.json({ 
        message: "Migration completed successfully",
        usersMigrated: userCount,
        migrationsMigrated: migrationCount
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/communication/send", async (req, res) => {
    try {
      const { type, data } = req.body;
      const { EmailService } = await import("./server/services/email.js");
      const { WatiService } = await import("./server/services/wati.js");

      let emailResult = { success: true };
      let whatsappResult = { success: true };

      if (type === "onboarding" || type === "parent-email") {
        const html = EmailService.generateOnboardingEmail(data);
        emailResult = await EmailService.sendEmail(data.parentEmail, `Welcome to JetLearn - ${data.dealname || data.learnerName}`, html);
        
        if (data.generateInvoice) {
          const invoiceHtml = EmailService.generateInvoiceHtml(data);
          await EmailService.sendEmail(data.parentEmail, `Invoice for ${data.dealname || data.learnerName}`, invoiceHtml);
        }
      } else if (type === "migration") {
        const html = EmailService.generateMigrationEmail(data);
        emailResult = await EmailService.sendEmail(data.parentEmail, `Teacher Update for ${data.dealname || data.learnerName}`, html);
      } else if (type === "minecraft") {
        const html = EmailService.generateMinecraftGuide(data);
        emailResult = await EmailService.sendEmail(data.parentEmail, `Minecraft Installation Guide - JetLearn`, html);
      } else if (type === "roblox") {
        const html = EmailService.generateRobloxGuide(data);
        emailResult = await EmailService.sendEmail(data.parentEmail, `Roblox Studio Setup Guide - JetLearn`, html);
      }

      if (data.sendWhatsApp && data.whatsappNumber) {
        try {
          whatsappResult = await WatiService.sendMessage(
            data.whatsappNumber,
            type === "onboarding" ? "onboarding_welcome" : "migration_update",
            [
              { name: "learner_name", value: data.dealname || data.learnerName },
              { name: "teacher_name", value: data.teacher || data.newTeacher },
              { name: "course_name", value: data.current_course }
            ]
          );
        } catch (e) {
          console.error("WhatsApp failed:", e);
          whatsappResult = { success: false, message: "WhatsApp failed" } as any;
        }
      }

      res.json({ success: true, email: emailResult, whatsapp: whatsappResult });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
