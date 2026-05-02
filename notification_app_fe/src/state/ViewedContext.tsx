/**
 * src/state/ViewedContext.tsx
 * React context for tracking which notification IDs have been viewed.
 * Persists to localStorage so state survives page refreshes.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Log } from "../../logging_middleware_local/logger";

const STORAGE_KEY = "campus_notifications_viewed";

interface ViewedContextValue {
  /** Set of viewed notification IDs */
  viewedIds: Set<string>;
  /** Mark a notification as viewed */
  markViewed: (id: string) => void;
  /** Check if a notification has been viewed */
  isViewed: (id: string) => boolean;
}

const ViewedContext = createContext<ViewedContextValue | null>(null);

/** Reads viewed IDs from localStorage */
function loadViewedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

/** Persists viewed IDs to localStorage */
function saveViewedIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage might be unavailable in some contexts
  }
}

export function ViewedProvider({ children }: { children: ReactNode }) {
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    const loaded = loadViewedIds();
    setViewedIds(loaded);
  }, []);

  const markViewed = useCallback((id: string) => {
    setViewedIds((prev) => {
      if (prev.has(id)) return prev; // Already viewed — no state update
      const next = new Set(prev);
      next.add(id);
      saveViewedIds(next);

      // Log the state change via logging middleware
      Log("frontend", "debug", "state", `Notification marked as viewed: ${id}`).catch(
        console.error
      );

      return next;
    });
  }, []);

  const isViewed = useCallback(
    (id: string) => viewedIds.has(id),
    [viewedIds]
  );

  return (
    <ViewedContext.Provider value={{ viewedIds, markViewed, isViewed }}>
      {children}
    </ViewedContext.Provider>
  );
}

/** Hook to consume the viewed context */
export function useViewed(): ViewedContextValue {
  const ctx = useContext(ViewedContext);
  if (!ctx) {
    throw new Error("useViewed must be used within a ViewedProvider");
  }
  return ctx;
}
