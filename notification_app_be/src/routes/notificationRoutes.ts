/**
 * routes/notificationRoutes.ts
 * Defines all notification-related routes and wires them to controllers.
 */

import { Router } from "express";
import {
  getAllNotifications,
  getPriorityNotificationsList,
} from "../controllers/notificationController";

const router = Router();

/**
 * GET /notifications
 * Returns notifications from the external API.
 * Query params: limit, page, notification_type
 */
router.get("/", getAllNotifications);

/**
 * GET /notifications/priority
 * Returns top-N priority-sorted notifications.
 * Query params: n (default = 10)
 */
router.get("/priority", getPriorityNotificationsList);

export default router;
