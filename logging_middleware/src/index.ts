/**
 * index.ts
 * Public entry point for the logging_middleware package.
 * Re-exports Log function and all types for consumers.
 */

export { Log, Log as default } from "./logger";
export {
  VALID_STACKS,
  VALID_LEVELS,
  BACKEND_PACKAGES,
  FRONTEND_PACKAGES,
  COMMON_PACKAGES,
  LOG_API_URL,
} from "./constants";
export type { Stack, Level, Package, BackendPackage, FrontendPackage } from "./constants";
