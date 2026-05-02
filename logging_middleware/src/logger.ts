// Log(stack, level, package, message) — sends a structured log entry to the evaluation service.
// Validates all fields before making the API call.
// Fails silently on network errors (logs to console) so logging never crashes the app.

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

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function getAuthToken(): string {
  const token = process.env.AUTH_TOKEN;
  if (!token) throw new Error("[logging_middleware] AUTH_TOKEN is not set");
  return token;
}

function validateStack(stack: string): asserts stack is Stack {
  if (!(VALID_STACKS as readonly string[]).includes(stack)) {
    throw new Error(`[logging_middleware] Invalid stack: "${stack}". Allowed: ${VALID_STACKS.join(", ")}`);
  }
}

function validateLevel(level: string): asserts level is Level {
  if (!(VALID_LEVELS as readonly string[]).includes(level)) {
    throw new Error(`[logging_middleware] Invalid level: "${level}". Allowed: ${VALID_LEVELS.join(", ")}`);
  }
}

function validatePackage(stack: Stack, pkg: string): asserts pkg is Package {
  const allowed: readonly string[] = stack === "backend" ? BACKEND_PACKAGES : FRONTEND_PACKAGES;
  if (!allowed.includes(pkg)) {
    throw new Error(`[logging_middleware] Invalid package: "${pkg}" for stack "${stack}"`);
  }
}

export async function Log(
  stack: string,
  level: string,
  pkg: string,
  message: string
): Promise<void> {
  const stackLower = stack.toLowerCase();
  const levelLower = level.toLowerCase();
  const pkgLower = pkg.toLowerCase();

  validateStack(stackLower);
  validateLevel(levelLower);
  validatePackage(stackLower, pkgLower);

  const token = getAuthToken();

  const payload = {
    stack: stackLower,
    level: levelLower,
    package: pkgLower,
    message,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await axios.post(LOG_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    });
    console.info(`[logging_middleware] ${stackLower}/${levelLower}/${pkgLower}: ${message} (logID: ${response.data?.logID})`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(`[logging_middleware] API error ${error.response?.status ?? "no response"}: ${error.message}`);
    } else {
      console.error(`[logging_middleware] ${String(error)}`);
    }
  }
}

export default Log;
