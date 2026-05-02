/**
 * controllers/notificationController.ts
 * Handles HTTP request/response for notification endpoints.
 * Delegates all business logic to the service layer.
 */

import { Request, Response, NextFunction } from "express";
import { getNotifications, getPriorityNotifications } from "../services/notificationService";
import { NotificationQueryParams, NotificationType } from "../domain/notification.types";
import { config } from "../config/env";
import { Log } from "../../logging_middleware_local/logger";

/**
 * GET /notifications
 * Fetches notifications from the external API and returns them as-is.
 * Supports query params: limit, page, notification_type
 */
export async function getAllNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await Log("backend", "info", "controller", `GET /notifications — query: ${JSON.stringify(req.query)}`);

    // Parse and validate query params
    // Note: external API does not support a 'limit' param beyond its default (20).
    // We support 'page' and 'notification_type' for filtering.
    const params: NotificationQueryParams = {};

    if (req.query.page !== undefined) {
      const page = parseInt(req.query.page as string, 10);
      if (isNaN(page) || page <= 0) {
        res.status(400).json({ error: "Query param 'page' must be a positive integer" });
        return;
      }
      params.page = page;
    }

    if (req.query.notification_type !== undefined) {
      const validTypes: NotificationType[] = ["Event", "Result", "Placement"];
      const type = req.query.notification_type as string;
      if (!validTypes.includes(type as NotificationType)) {
        res.status(400).json({
          error: `Query param 'notification_type' must be one of: ${validTypes.join(", ")}`,
        });
        return;
      }
      params.notification_type = type as NotificationType;
    }

    const notifications = await getNotifications(params);

    await Log("backend", "info", "controller", `GET /notifications — responding with ${notifications.length} items`);

    res.status(200).json({ notifications });
  } catch (error) {
    await Log("backend", "error", "controller", `GET /notifications failed: ${String(error)}`);
    next(error);
  }
}

/**
 * GET /notifications/priority?n=10
 * Fetches all notifications, applies priority sort, returns top N.
 * n defaults to config.defaultTopN if not provided.
 */
export async function getPriorityNotificationsList(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await Log("backend", "info", "controller", `GET /notifications/priority — query: ${JSON.stringify(req.query)}`);

    // Parse n parameter (configurable top-N)
    let n = config.defaultTopN;
    if (req.query.n !== undefined) {
      const parsed = parseInt(req.query.n as string, 10);
      if (isNaN(parsed) || parsed <= 0) {
        res.status(400).json({ error: "Query param 'n' must be a positive integer" });
        return;
      }
      n = parsed;
    }

    const notifications = await getPriorityNotifications(n);

    await Log(
      "backend",
      "info",
      "controller",
      `GET /notifications/priority — responding with top ${notifications.length} of requested n=${n}`
    );

    res.status(200).json({
      notifications,
      meta: { topN: n, returned: notifications.length },
    });
  } catch (error) {
    await Log("backend", "error", "controller", `GET /notifications/priority failed: ${String(error)}`);
    next(error);
  }
}
