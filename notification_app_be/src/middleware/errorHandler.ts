/**
 * middleware/errorHandler.ts
 * Global Express error handler middleware.
 * Must have 4 parameters to be recognized as an error handler by Express.
 */

import { Request, Response, NextFunction } from "express";
import { Log } from "../../logging_middleware_local/logger";

/**
 * Catches any error passed to next(error) and returns a structured JSON response.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const status = (err as { status?: number }).status ?? 500;
  const message = err.message ?? "Internal server error";

  // Log at fatal for 500s, error for everything else
  Log(
    "backend",
    status >= 500 ? "fatal" : "error",
    "middleware",
    `Unhandled error on ${req.method} ${req.originalUrl}: ${message}`
  ).catch(console.error);

  res.status(status).json({
    error: message,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
}
