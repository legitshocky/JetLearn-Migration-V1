import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createApp } from "./server/createApp.js";

dotenv.config();

async function startServer() {
  const app = createApp();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // In dev: attach Vite HMR middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve the Vite-built React SPA
    const { default: path }            = await import("path");
    const { default: express }         = await import("express");
    const { fileURLToPath }            = await import("url");
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const distPath  = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
