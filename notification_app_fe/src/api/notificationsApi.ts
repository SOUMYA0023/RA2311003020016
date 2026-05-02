/**
 * src/api/notificationsApi.ts
 * All API calls from the frontend to the backend service.
 * Uses axios with the NEXT_PUBLIC_API_BASE_URL environment variable.
 */

import axios from "axios";
import { Notification, NotificationType } from "../types/notification";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

/** Axios instance for backend API calls */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export interface GetNotificationsParams {
  limit?: number;
  page?: number;
  notification_type?: NotificationType | "";
}

export interface GetNotificationsResponse {
  notifications: Notification[];
}

export interface GetPriorityNotificationsResponse {
  notifications: Notification[];
  meta: { topN: number; returned: number };
}

/**
 * Fetches all notifications from the backend.
 * @param params - Optional filter/pagination params
 */
export async function getAllNotifications(
  params: GetNotificationsParams = {}
): Promise<GetNotificationsResponse> {
  const queryParams: Record<string, string | number> = {};
  if (params.limit) queryParams.limit = params.limit;
  if (params.page) queryParams.page = params.page;
  if (params.notification_type) queryParams.notification_type = params.notification_type;

  const response = await apiClient.get<GetNotificationsResponse>("/notifications", {
    params: queryParams,
  });
  return response.data;
}

/**
 * Fetches priority-sorted top-N notifications from the backend.
 * @param n - Number of top notifications to fetch (default 10)
 */
export async function getPriorityNotifications(
  n: number = 10
): Promise<GetPriorityNotificationsResponse> {
  const response = await apiClient.get<GetPriorityNotificationsResponse>(
    "/notifications/priority",
    { params: { n } }
  );
  return response.data;
}
