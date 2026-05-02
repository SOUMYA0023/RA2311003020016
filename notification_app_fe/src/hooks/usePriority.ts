/**
 * src/hooks/usePriority.ts
 * Custom hook for fetching priority-sorted top-N notifications.
 */

import { useState, useEffect, useCallback } from "react";
import { Notification } from "../types/notification";
import { getPriorityNotifications } from "../api/notificationsApi";
import { Log } from "../../logging_middleware_local/logger";

interface UsePriorityState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  meta: { topN: number; returned: number } | null;
}

interface UsePriorityReturn extends UsePriorityState {
  refetch: () => void;
}

export function usePriority(n: number = 10): UsePriorityReturn {
  const [state, setState] = useState<UsePriorityState>({
    notifications: [],
    loading: false,
    error: null,
    meta: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    await Log(
      "frontend",
      "debug",
      "api",
      `Fetching priority notifications with n=${n}`
    ).catch(console.error);

    try {
      const data = await getPriorityNotifications(n);

      await Log(
        "frontend",
        "info",
        "api",
        `Fetched ${data.notifications.length} priority notifications (top ${n})`
      ).catch(console.error);

      setState({
        notifications: data.notifications,
        loading: false,
        error: null,
        meta: data.meta,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch priority notifications";

      await Log(
        "frontend",
        "error",
        "api",
        `Failed to fetch priority notifications: ${message}`
      ).catch(console.error);

      setState({ notifications: [], loading: false, error: message, meta: null });
    }
  }, [n]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}
