// Vercel serverless entry point.
// Vercel routes all /api/* requests here via vercel.json rewrites.
import { createApp } from "../server/createApp.js";

const app = createApp();

export default app;
