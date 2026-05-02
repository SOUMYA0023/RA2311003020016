// Loads and validates all required environment variables.
// Fails fast at startup if anything is missing.

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function getRequired(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? "5001", 10),
  authToken: getRequired("AUTH_TOKEN"),
  externalApiBaseUrl: getRequired("EXTERNAL_API_BASE_URL"),
  defaultTopN: parseInt(process.env.DEFAULT_TOP_N ?? "10", 10),
};
