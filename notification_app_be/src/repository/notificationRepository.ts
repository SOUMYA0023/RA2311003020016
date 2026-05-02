/**
 * repository/notificationRepository.ts
 * Responsible for all HTTP communication with the external evaluation API.
 * No business logic here — only data fetching.
 *
 * External API constraints (discovered via probing):
 *  - Default page size: 20 notifications per page
 *  - limit param: max 10 (use page-based pagination instead)
 *  - Empty array signals last page
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
 * Fetches one page of notifications from the external evaluation API.
 *
 * @param params - Optional query parameters: page, notification_type
 * @returns Array of raw Notification objects for that page
 */
export async function fetchNotifications(
  params: NotificationQueryParams = {}
): Promise<Notification[]> {
  await Log("backend", "debug", "repository", "Fetching notifications from external API");

  // Build query params object, omitting undefined values
  const queryParams: Record<string, string | number> = {};
  if (params.page !== undefined) queryParams.page = params.page;
  if (params.notification_type !== undefined)
    queryParams.notification_type = params.notification_type;

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
    const message = axios.isAxiosError(error)
      ? `External API error: ${error.response?.status ?? "no response"} — ${error.message}`
      : `Unexpected error fetching notifications: ${String(error)}`;

    await Log("backend", "error", "repository", message);
    throw new Error(message);
  }
}

/**
 * Fetches ALL notifications from the external API using pagination.
 * The external API returns 20 per page by default; we paginate until
 * an empty page is returned.
 *
 * Used by the priority endpoint which needs the full dataset to sort across types.
 *
 * @returns All available notifications (deduplicated by ID)
 */
export async function fetchAllNotifications(): Promise<Notification[]> {
  await Log(
    "backend",
    "debug",
    "repository",
    "Fetching all notifications for priority sorting (paginated)"
  );

  const all: Notification[] = [];
  const seenIds = new Set<string>();
  let page = 1;
  const MAX_PAGES = 20; // safety cap to prevent infinite loops

  try {
    while (page <= MAX_PAGES) {
      const response = await apiClient.get<ExternalApiResponse>("/notifications", {
        params: { page },
      });

      const batch = response.data?.notifications ?? [];

      // Empty page means we've reached the end
      if (batch.length === 0) break;

      // Deduplicate by ID in case pages overlap
      for (const n of batch) {
        if (!seenIds.has(n.ID)) {
          seenIds.add(n.ID);
          all.push(n);
        }
      }

      // If the batch is smaller than the expected page size (20), we're on the last page
      if (batch.length < 20) break;

      page++;
    }

    await Log(
      "backend",
      "info",
      "repository",
      `Fetched ${all.length} total notifications across ${page} page(s) for priority processing`
    );

    return all;
  } catch (error: unknown) {
    const message = axios.isAxiosError(error)
      ? `External API pagination error (page ${page}): ${error.response?.status ?? "no response"} — ${error.message}`
      : `Unexpected error: ${String(error)}`;

    await Log("backend", "error", "repository", message);
    throw new Error(message);
  }
}
