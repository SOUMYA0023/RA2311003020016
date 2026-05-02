/**
 * config/env.ts
 * Loads and validates all environment variables required by the backend.
 * Throws early if critical variables are missing so the server fails fast.
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load .env file from the notification_app_be directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[config] Missing required environment variable: ${key}. ` +
        `Please set it in your .env file (see .env.example).`
    );
  }
  return value;
}

export const config = {
  /** Express server port */
  port: parseInt(process.env.PORT ?? "5000", 10),

  /** Bearer token for external evaluation API calls */
  authToken: requireEnv("AUTH_TOKEN"),

  /** Base URL of the external evaluation service */
  externalApiBaseUrl:
    process.env.EXTERNAL_API_BASE_URL ?? "http://20.207.122.201/evaluation-service",

  /** Default number of top-N notifications for priority endpoint */
  defaultTopN: parseInt(process.env.DEFAULT_TOP_N ?? "10", 10),
} as const;
