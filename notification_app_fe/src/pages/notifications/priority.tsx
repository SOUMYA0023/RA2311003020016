/**
 * src/pages/notifications/priority.tsx
 * Page 2 — Priority Notifications
 * Features: N selector (10/15/20), sorted list, placement highlights, new/viewed tracking
 */

import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  Container,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { usePriority } from "../../hooks/usePriority";
import NotificationCard from "../../components/NotificationCard";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import { Log } from "../../../logging_middleware_local/logger";
import { useViewed } from "../../state/ViewedContext";

const N_OPTIONS = [10, 15, 20];

export default function PriorityNotificationsPage() {
  const [n, setN] = useState(10);

  const { notifications, loading, error, meta, refetch } = usePriority(n);
  const { viewedIds } = useViewed();

  const placementCount = notifications.filter((x) => x.Type === "Placement").length;
  const resultCount = notifications.filter((x) => x.Type === "Result").length;
  const eventCount = notifications.filter((x) => x.Type === "Event").length;
  const unviewedCount = notifications.filter((notif) => !viewedIds.has(notif.ID)).length;

  useEffect(() => {
    Log("frontend", "info", "page", "Priority Notifications page loaded").catch(console.error);
  }, []);

  const handleNChange = async (
    _: React.MouseEvent<HTMLElement>,
    newN: number | null
  ) => {
    if (newN === null) return;
    setN(newN);
    await Log(
      "frontend",
      "info",
      "component",
      `Priority N selector changed to ${newN}`
    ).catch(console.error);
  };

  return (
    <>
      <Head>
        <title>Priority Notifications — Campus Notification System</title>
        <meta
          name="description"
          content="View top-priority campus notifications sorted by type: Placement, Result, and Event."
        />
      </Head>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <StarIcon fontSize="large" sx={{ color: "#f9a825" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }} color="primary">
              Priority Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Top notifications sorted by priority: Placement → Result → Event
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* N Selector */}
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
            Show top:
          </Typography>
          <ToggleButtonGroup
            id="n-selector"
            value={n}
            exclusive
            onChange={handleNChange}
            size="small"
            color="primary"
          >
            {N_OPTIONS.map((opt) => (
              <ToggleButton key={opt} value={opt} id={`n-option-${opt}`}>
                {opt}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {!loading && notifications.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, flexWrap: "wrap" }}>
              <Chip label={`${placementCount} Placement`} color="success" size="small" variant="outlined" />
              <Chip label={`${resultCount} Result`} color="warning" size="small" variant="outlined" />
              <Chip label={`${eventCount} Event`} color="info" size="small" variant="outlined" />
              {unviewedCount > 0 && (
                <Chip label={`${unviewedCount} New`} color="error" size="small" />
              )}
            </Box>
          )}
        </Box>

        {/* Sort info banner */}
        {!loading && !error && notifications.length > 0 && (
          <Alert
            icon={<TrendingUpIcon />}
            severity="info"
            sx={{ mb: 3, borderRadius: 2 }}
          >
            Sorted by priority weight (Placement=3, Result=2, Event=1), then by most recent timestamp.
            {meta && ` Showing ${meta.returned} of requested ${meta.topN}.`}
          </Alert>
        )}

        {/* Content Area */}
        {loading && <LoadingState message="Loading priority notifications..." />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && notifications.length === 0 && (
          <EmptyState message="No priority notifications available." />
        )}

        {!loading && !error && notifications.length > 0 && (
          <Box id="priority-notifications-list">
            {notifications.map((notification, index) => (
              <Box key={notification.ID} sx={{ position: "relative" }}>
                {/* Rank badge */}
                <Box
                  sx={{
                    position: "absolute",
                    left: -32,
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: index < 3 ? "#f9a825" : "#e0e0e0",
                    color: index < 3 ? "white" : "text.secondary",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </Box>
                <NotificationCard notification={notification} highlightPlacement />
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </>
  );
}
