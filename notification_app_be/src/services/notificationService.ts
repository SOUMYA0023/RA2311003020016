// Business logic layer — priority sorting and notification retrieval.
// Placement = 3, Result = 2, Event = 1

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

export async function getNotifications(
  params: NotificationQueryParams
): Promise<Notification[]> {
  await Log("backend", "debug", "service", "getNotifications called with params: " + JSON.stringify(params));
  const notifications = await fetchNotifications(params);
  await Log("backend", "info", "service", `getNotifications returning ${notifications.length} items`);
  return notifications;
}

export async function getPriorityNotifications(
  n: number = config.defaultTopN
): Promise<Notification[]> {
  await Log("backend", "debug", "service", `getPriorityNotifications called with n=${n}`);

  const all = await fetchAllNotifications();

  // Sort by weight DESC, then timestamp DESC for tiebreaks
  const sorted = [...all].sort((a, b) => {
    const weightA = PRIORITY_WEIGHTS[a.Type] ?? 0;
    const weightB = PRIORITY_WEIGHTS[b.Type] ?? 0;
    if (weightB !== weightA) return weightB - weightA;
    return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
  });

  const topN = sorted.slice(0, n);

  await Log(
    "backend",
    "info",
    "service",
    `Priority sort complete. Returning top ${topN.length} of ${all.length} notifications`
  );

  return topN;
}
