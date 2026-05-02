// Valid values for stack, level, and package fields.

export const VALID_STACKS = ["backend", "frontend"] as const;
export type Stack = (typeof VALID_STACKS)[number];

export const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"] as const;
export type Level = (typeof VALID_LEVELS)[number];

const BACKEND_ONLY_PACKAGES = [
  "cache", "controller", "cron_job", "db", "domain",
  "handler", "repository", "route", "service",
] as const;

const FRONTEND_ONLY_PACKAGES = [
  "api", "component", "hook", "page", "state", "style",
] as const;

export const COMMON_PACKAGES = ["auth", "config", "middleware", "utils"] as const;

export const BACKEND_PACKAGES = [...BACKEND_ONLY_PACKAGES, ...COMMON_PACKAGES] as const;
export const FRONTEND_PACKAGES = [...FRONTEND_ONLY_PACKAGES, ...COMMON_PACKAGES] as const;

export type BackendPackage = (typeof BACKEND_PACKAGES)[number];
export type FrontendPackage = (typeof FRONTEND_PACKAGES)[number];
export type Package = BackendPackage | FrontendPackage;

export const LOG_API_URL = "http://20.207.122.201/evaluation-service/logs";
