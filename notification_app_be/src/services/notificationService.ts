/**
 * services/notificationService.ts
 * Business logic layer — priority sorting and notification retrieval.
 * No external calls here; uses the repository layer for data.
 *
 * PRIORITY SORTING ALGORITHM:
 *   Type weights: Placement = 3, Result = 2, Event = 1
 *   Pass 1: Sort by weight DESC  (primary key)
 *   Pass 2: Tiebreak by Timestamp DESC (secondary key — most recent first)
 *   Complexity: O(n log n) — native Array.prototype.sort (TimSort)
 *   Space:      O(n) — creates a sorted copy, does not mutate input
 */

import {
  Notification,
  NotificationQueryParams,
  PRIORITY_WEIGHTS,
} from "../domain/notification.types";
import {
  fetchNotifications,
  fetchAllNotifications,
} from "../repository/notificationRepository";
import { config } from "../config/env";
import { Log } from "../../logging_middleware_local/logger";

/**
 * Retrieves notifications from the external API, forwarding all query params.
 * This is a thin pass-through — no sorting or transformation applied.
 *
 * @param params - limit, page, notification_type forwarded to external API
 * @returns Raw notification array
 */
export async function getNotifications(
  params: NotificationQueryParams
): Promise<Notification[]> {
  await Log("backend", "debug", "service", "getNotifications called with params: " + JSON.stringify(params));

  const notifications = await fetchNotifications(params);

  await Log("backend", "info", "service", `getNotifications returning ${notifications.length} items`);

  return notifications;
}

/**
 * Fetches all notifications, applies two-pass priority sort, and returns top N.
 *
 * SORTING DETAIL:
 *   Uses Array.prototype.sort with a custom comparator (O(n log n)).
 *   No external sorting libraries used — only native JS constructs.
 *
 * @param n - Number of top notifications to return (default from config)
 * @returns Sorted array of top-N notifications
 */
export async function getPriorityNotifications(
  n: number = config.defaultTopN
): Promise<Notification[]> {
  await Log("backend", "debug", "service", `getPriorityNotifications called with n=${n}`);

  // Fetch all notifications from external API
  const all = await fetchAllNotifications();

  await Log("backend", "debug", "service", `Sorting ${all.length} notifications by priority`);

  // ── Two-pass priority sort ─────────────────────────────────────────────
  // We create a sorted copy to avoid mutating the original array.
  const sorted = [...all].sort((a, b) => {
    const weightA = PRIORITY_WEIGHTS[a.Type] ?? 0;
    const weightB = PRIORITY_WEIGHTS[b.Type] ?? 0;

    // Pass 1: Primary sort by weight DESC (higher weight = higher priority)
    if (weightB !== weightA) {
      return weightB - weightA;
    }

    // Pass 2: Tiebreaker — sort by Timestamp DESC (most recent first)
    // "YYYY-MM-DD HH:MM:SS" format is lexicographically sortable
    const timeA = new Date(a.Timestamp).getTime();
    const timeB = new Date(b.Timestamp).getTime();
    return timeB - timeA;
  });

  // ── Slice top N ────────────────────────────────────────────────────────
  const topN = sorted.slice(0, n);

  await Log(
    "backend",
    "info",
    "service",
    `Priority sort complete. Returning top ${topN.length} of ${all.length} notifications`
  );

  return topN;
}
