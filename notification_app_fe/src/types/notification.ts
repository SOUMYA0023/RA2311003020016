/**
 * src/types/notification.ts
 * Shared TypeScript interfaces for the frontend.
 */

export type NotificationType = "Event" | "Result" | "Placement";

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string; // "YYYY-MM-DD HH:MM:SS"
}
