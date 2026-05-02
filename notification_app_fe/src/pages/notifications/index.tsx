/**
 * src/pages/notifications/index.tsx
 * Page 1 — All Notifications
 * Features: type filter, pagination, new/viewed tracking
 */

import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  Container,
  Typography,
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationCard from "../../components/NotificationCard";
import FilterBar from "../../components/FilterBar";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import { NotificationType } from "../../types/notification";
import { Log } from "../../../logging_middleware_local/logger";
import { useViewed } from "../../state/ViewedContext";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

export default function AllNotificationsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterType, setFilterType] = useState<NotificationType | "">("");

  const { notifications, loading, error, refetch } = useNotifications({
    page,
    limit,
    notification_type: filterType || undefined,
  });

  const { viewedIds } = useViewed();
  const unviewedCount = notifications.filter((n) => !viewedIds.has(n.ID)).length;

  useEffect(() => {
    Log("frontend", "info", "page", "All Notifications page loaded").catch(console.error);
  }, []);

  const handleFilterChange = (value: NotificationType | "") => {
    setFilterType(value);
    setPage(1);
  };

  const handlePageChange = async (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    await Log("frontend", "info", "component", `Pagination changed to page ${value}`).catch(
      console.error
    );
  };

  const handleLimitChange = async (event: SelectChangeEvent<number>) => {
    const newLimit = Number(event.target.value);
    setLimit(newLimit);
    setPage(1);
    await Log("frontend", "info", "component", `Page size changed to ${newLimit}`).catch(
      console.error
    );
  };

  const totalPages = notifications.length === limit ? page + 1 : page;

  return (
    <>
      <Head>
        <title>All Notifications — Campus Notification System</title>
        <meta
          name="description"
          content="View all campus notifications including events, results, and placements."
        />
      </Head>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Badge badgeContent={unviewedCount > 0 ? unviewedCount : undefined} color="error">
            <NotificationsIcon fontSize="large" color="primary" />
          </Badge>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }} color="primary">
              All Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Showing all campus notifications — click a card to mark as viewed
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Filter Controls */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: { xs: "stretch", sm: "center" },
            mb: 3,
          }}
        >
          <FilterBar value={filterType} onChange={handleFilterChange} />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="page-size-label">Per page</InputLabel>
            <Select
              labelId="page-size-label"
              id="page-size-select"
              value={limit}
              label="Per page"
              onChange={handleLimitChange}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <MenuItem key={size} value={size} id={`page-size-${size}`}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>


        {/* Content Area */}
        {loading && <LoadingState message="Fetching notifications..." />}

        {!loading && error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && notifications.length === 0 && (
          <EmptyState message="No notifications found for the selected filter." />
        )}

        {!loading && !error && notifications.length > 0 && (
          <>
            <Box id="notifications-list" sx={{ mb: 3 }}>
              {notifications.map((notification) => (
                <NotificationCard key={notification.ID} notification={notification} />
              ))}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                id="notifications-pagination"
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
