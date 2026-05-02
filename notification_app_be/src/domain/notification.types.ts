/**
 * domain/notification.types.ts
 * TypeScript interfaces and type definitions for notifications.
 */

/** Raw notification shape returned by the external evaluation API */
export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string; // "YYYY-MM-DD HH:MM:SS"
}

/** Allowed notification types from the external API */
export type NotificationType = "Event" | "Result" | "Placement";

/** Query parameters accepted by GET /notifications
 *  Note: external API page size is fixed at 20 — limit is not supported.
 */
export interface NotificationQueryParams {
  page?: number;
  notification_type?: NotificationType;
}

/** Query parameters accepted by GET /notifications/priority */
export interface PriorityQueryParams {
  n?: number;
}

/** Shape of the external API response */
export interface ExternalApiResponse {
  notifications: Notification[];
}

/** Priority weight map — Placement > Result > Event */
export const PRIORITY_WEIGHTS: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
} as const;
