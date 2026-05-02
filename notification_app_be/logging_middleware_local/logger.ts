/**
 * logging_middleware_local/logger.ts
 * Local re-export of the shared logging middleware for use within the backend.
 * Imports from the sibling logging_middleware package source directly.
 */

// Re-export everything from the shared logging_middleware package
export { Log, Log as default } from "../../logging_middleware/src/logger";
