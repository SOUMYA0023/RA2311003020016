// Handles all HTTP calls to the external notifications API.
// Paginates automatically — external API returns max 20 per page.

import axios from "axios";
import { config } from "../config/env";
import {
  Notification,
  NotificationQueryParams,
  ExternalApiResponse,
} from "../domain/notification.types";
import { Log } from "../../logging_middleware_local/logger";

const apiClient = axios.create({
  baseURL: config.externalApiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.authToken}`,
  },
  timeout: 15000,
});

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

// Fetches all pages until empty — used by the priority sort endpoint.
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

      if (batch.length === 0) break;

      for (const n of batch) {
        if (!seenIds.has(n.ID)) {
          seenIds.add(n.ID);
          all.push(n);
        }
      }

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
