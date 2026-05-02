/**
 * logger.ts
 * Core reusable logging module.
 *
 * Exports: Log(stack, level, package, message): Promise<void>
 *
 * Validates all fields before making the external API call.
 * Rejects invalid combinations with descriptive errors.
 * Attaches an ISO timestamp internally before sending.
 * Uses Bearer token from environment for authentication.
 */

import axios from "axios";
import * as dotenv from "dotenv";
import * as path from "path";

import {
  VALID_STACKS,
  VALID_LEVELS,
  BACKEND_PACKAGES,
  FRONTEND_PACKAGES,
  LOG_API_URL,
  Stack,
  Level,
  Package,
} from "./constants";

// Load .env from the logging_middleware directory (or parent if used as a package)
dotenv.config({ path: path.resolve(__dirname, "../.env") });
// Also try loading from the parent directory (e.g., when imported by backend/frontend)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Retrieves the Bearer token from environment variables.
 * Throws if the token is not configured.
 */
function getAuthToken(): string {
  const token = process.env.AUTH_TOKEN;
  if (!token) {
    throw new Error(
      "[logging_middleware] AUTH_TOKEN is not set in environment variables. " +
        "Please set it in your .env file."
    );
  }
  return token;
}

/**
 * Validates the stack field against allowed values.
 * @param stack - The stack identifier to validate
 */
function validateStack(stack: string): asserts stack is Stack {
  if (!(VALID_STACKS as readonly string[]).includes(stack)) {
    throw new Error(
      `[logging_middleware] Invalid stack: "${stack}". ` +
        `Allowed values: ${VALID_STACKS.join(", ")}`
    );
  }
}

/**
 * Validates the level field against allowed values.
 * @param level - The log level to validate
 */
function validateLevel(level: string): asserts level is Level {
  if (!(VALID_LEVELS as readonly string[]).includes(level)) {
    throw new Error(
      `[logging_middleware] Invalid level: "${level}". ` +
        `Allowed values: ${VALID_LEVELS.join(", ")}`
    );
  }
}

/**
 * Validates that the package is compatible with the given stack.
 * @param stack - The validated stack
 * @param pkg - The package name to validate
 */
function validatePackage(stack: Stack, pkg: string): asserts pkg is Package {
  const allowedPackages: readonly string[] =
    stack === "backend" ? BACKEND_PACKAGES : FRONTEND_PACKAGES;

  if (!allowedPackages.includes(pkg)) {
    throw new Error(
      `[logging_middleware] Invalid package: "${pkg}" for stack "${stack}". ` +
        `Allowed packages for "${stack}": ${allowedPackages.join(", ")}`
    );
  }
}

/**
 * Log — sends a structured log entry to the external evaluation service.
 *
 * @param stack   - "backend" | "frontend"
 * @param level   - "debug" | "info" | "warn" | "error" | "fatal"
 * @param pkg     - Package identifier (must be valid for the given stack)
 * @param message - Human-readable log message
 *
 * @throws {Error} If any field fails validation (before API call)
 * @returns Promise<void> — resolves on success, catches API errors gracefully
 *
 * @example
 * await Log("backend", "error", "handler", "received string, expected bool")
 * await Log("frontend", "info", "page", "All Notifications page loaded")
 */
export async function Log(
  stack: string,
  level: string,
  pkg: string,
  message: string
): Promise<void> {
  // ── Validation (all fields must be lowercase strings) ──────────────────
  // Enforce lowercase on inputs before validation
  const stackLower = stack.toLowerCase();
  const levelLower = level.toLowerCase();
  const pkgLower = pkg.toLowerCase();

  validateStack(stackLower);  // throws on invalid
  validateLevel(levelLower);  // throws on invalid
  validatePackage(stackLower, pkgLower);  // throws on invalid combo

  // ── Retrieve auth token ────────────────────────────────────────────────
  const token = getAuthToken();

  // ── Build payload with internal timestamp ──────────────────────────────
  const payload = {
    stack: stackLower,
    level: levelLower,
    package: pkgLower,
    message,
    timestamp: new Date().toISOString(),
  };

  // ── Send to external log API ───────────────────────────────────────────
  try {
    const response = await axios.post(LOG_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10 second timeout
    });

    // Log success to local console for debugging (does NOT re-call Log to avoid recursion)
    console.info(
      `[logging_middleware] Log created — ID: ${response.data?.logID} | ` +
        `${stackLower}/${levelLower}/${pkgLower}: ${message}`
    );
  } catch (error: unknown) {
    // Graceful degradation — log failure to console but do not throw
    // This prevents logging failures from crashing the application
    if (axios.isAxiosError(error)) {
      console.error(
        `[logging_middleware] API call failed — ` +
          `Status: ${error.response?.status ?? "no response"} | ` +
          `Message: ${error.message} | ` +
          `Payload: ${JSON.stringify(payload)}`
      );
    } else {
      console.error(
        `[logging_middleware] Unexpected error during log API call: ${String(error)}`
      );
    }
  }
}

// Default export for convenience
export default Log;
