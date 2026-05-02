/**
 * repository/notificationRepository.ts
 * Responsible for all HTTP communication with the external evaluation API.
 * No business logic here — only data fetching.
 */

import axios from "axios";
import { config } from "../config/env";
import {
  Notification,
  NotificationQueryParams,
  ExternalApiResponse,
} from "../domain/notification.types";
import { Log } from "../../logging_middleware_local/logger";

/** Shared Axios instance with auth headers pre-configured */
const apiClient = axios.create({
  baseURL: config.externalApiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.authToken}`,
  },
  timeout: 15000, // 15 second timeout
});

/**
 * Fetches notifications from the external evaluation API.
 * Forwards any provided query parameters directly.
 *
 * @param params - Optional query parameters: limit, page, notification_type
 * @returns Array of raw Notification objects
 */
export async function fetchNotifications(
  params: NotificationQueryParams = {}
): Promise<Notification[]> {
  await Log("backend", "debug", "repository", "Fetching notifications from external API");

  // Build query params object, omitting undefined values
  const queryParams: Record<string, string | number> = {};
  if (params.limit !== undefined) queryParams.limit = params.limit;
  if (params.page !== undefined) queryParams.page = params.page;
  if (params.notification_type !== undefined) queryParams.notification_type = params.notification_type;

  try {
    const response = await apiClient.get<ExternalApiResponse>("/notifications", {
      params: queryParams,
    });

    const notifications = response.data?.notifications ?? [];

    await Log(
      "backend",
      "info",
      "repository",
      `Successfully fetched ${notifications.length} notifications from external API`
    );

    return notifications;
  } catch (error: unknown) {
    const message =
      axios.isAxiosError(error)
        ? `External API error: ${error.response?.status ?? "no response"} — ${error.message}`
        : `Unexpected error fetching notifications: ${String(error)}`;

    await Log("backend", "error", "repository", message);
    throw new Error(message);
  }
}

/**
 * Fetches ALL notifications from the external API without type filtering.
 * Used by the priority endpoint which needs all types to sort across them.
 * Makes paginated requests if needed to ensure completeness.
 *
 * @returns All available notifications
 */
export async function fetchAllNotifications(): Promise<Notification[]> {
  await Log("backend", "debug", "repository", "Fetching all notifications for priority sorting");

  try {
    // Fetch with a large limit to get all notifications in one pass
    const response = await apiClient.get<ExternalApiResponse>("/notifications", {
      params: { limit: 100, page: 1 },
    });

    const notifications = response.data?.notifications ?? [];

    await Log(
      "backend",
      "info",
      "repository",
      `Fetched ${notifications.length} total notifications for priority processing`
    );

    return notifications;
  } catch (error: unknown) {
    const message =
      axios.isAxiosError(error)
        ? `External API error fetching all: ${error.response?.status ?? "no response"} — ${error.message}`
        : `Unexpected error: ${String(error)}`;

    await Log("backend", "error", "repository", message);
    throw new Error(message);
  }
}
