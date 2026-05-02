/**
 * src/index.ts
 * Express application entry point.
 * Sets up middleware, mounts routes, and starts the HTTP server.
 */

import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import notificationRoutes from "./routes/notificationRoutes";
import { Log } from "../logging_middleware_local/logger";

const app = express();

// ── Global Middleware ──────────────────────────────────────────────────────
app.use(cors()); // Enable CORS for frontend access
app.use(express.json()); // Parse JSON request bodies
app.use(requestLogger); // Log every incoming request

// ── Health Check ───────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/notifications", notificationRoutes);

// ── Global Error Handler (must be last) ───────────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────────────────────
app.listen(config.port, async () => {
  await Log("backend", "info", "config", `Server started successfully on port ${config.port}`);
  console.log(`[server] Listening on http://localhost:${config.port}`);
});

export default app;
