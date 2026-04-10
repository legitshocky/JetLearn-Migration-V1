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

  app.post("/api/wati/send", async (req, res) => {
    try {
      const { phoneNumber, templateName, parameters } = req.body;
      const result = await WatiService.sendMessage(phoneNumber, templateName, parameters);
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
