/**
 * constants.ts
 * Defines all valid values for stack, level, and package fields
 * used by the logging middleware.
 */

/** Valid stack identifiers */
export const VALID_STACKS = ["backend", "frontend"] as const;
export type Stack = (typeof VALID_STACKS)[number];

/** Valid log levels */
export const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"] as const;
export type Level = (typeof VALID_LEVELS)[number];

/** Packages available only on the backend stack */
export const BACKEND_ONLY_PACKAGES = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
] as const;

/** Packages available only on the frontend stack */
export const FRONTEND_ONLY_PACKAGES = [
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
] as const;

/** Packages valid for both backend and frontend */
export const COMMON_PACKAGES = ["auth", "config", "middleware", "utils"] as const;

/** All backend-valid packages (backend-only + common) */
export const BACKEND_PACKAGES = [
  ...BACKEND_ONLY_PACKAGES,
  ...COMMON_PACKAGES,
] as const;

/** All frontend-valid packages (frontend-only + common) */
export const FRONTEND_PACKAGES = [
  ...FRONTEND_ONLY_PACKAGES,
  ...COMMON_PACKAGES,
] as const;

export type BackendPackage = (typeof BACKEND_PACKAGES)[number];
export type FrontendPackage = (typeof FRONTEND_PACKAGES)[number];
export type Package = BackendPackage | FrontendPackage;

/** External log API endpoint */
export const LOG_API_URL = "http://20.207.122.201/evaluation-service/logs";
