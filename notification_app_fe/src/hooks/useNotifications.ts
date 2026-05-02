/**
 * src/hooks/useNotifications.ts
 * Custom hook for fetching all notifications with filtering and pagination.
 * Integrates logging middleware for API call lifecycle events.
 */

import { useState, useEffect, useCallback } from "react";
import { Notification, NotificationType } from "../types/notification";
import { getAllNotifications, GetNotificationsParams } from "../api/notificationsApi";
import { Log } from "../../logging_middleware_local/logger";

interface UseNotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

interface UseNotificationsReturn extends UseNotificationsState {
  refetch: () => void;
}

export function useNotifications(
  params: GetNotificationsParams
): UseNotificationsReturn {
  const [state, setState] = useState<UseNotificationsState>({
    notifications: [],
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    await Log(
      "frontend",
      "debug",
      "api",
      `Fetching notifications with params: ${JSON.stringify(params)}`
    ).catch(console.error);

    try {
      const data = await getAllNotifications(params);

      await Log(
        "frontend",
        "info",
        "api",
        `Fetched ${data.notifications.length} notifications successfully`
      ).catch(console.error);

      setState({ notifications: data.notifications, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch notifications";

      await Log(
        "frontend",
        "error",
        "api",
        `Failed to fetch notifications: ${message}`
      ).catch(console.error);

      setState({ notifications: [], loading: false, error: message });
    }
  }, [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}
