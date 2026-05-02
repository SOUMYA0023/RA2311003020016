/**
 * middleware/requestLogger.ts
 * Express middleware that logs every incoming HTTP request.
 * Uses the logging_middleware Log() function.
 */

import { Request, Response, NextFunction } from "express";
import { Log } from "../../logging_middleware_local/logger";

/**
 * Logs each incoming request: method, URL, query params, and response time.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl, query } = req;

  // Log the incoming request immediately
  Log(
    "backend",
    "info",
    "middleware",
    `Incoming request: ${method} ${originalUrl}${Object.keys(query).length ? " | query: " + JSON.stringify(query) : ""}`
  ).catch(console.error);

  // Intercept response finish to log response time
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    Log(
      "backend",
      logLevel,
      "middleware",
      `Response: ${method} ${originalUrl} → ${res.statusCode} (${duration}ms)`
    ).catch(console.error);
  });

  next();
}
