/**
 * src/components/EmptyState.tsx
 * Shown when no notifications match the current filter/query.
 */
import React from "react";
import { Box, Typography } from "@mui/material";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";

export default function EmptyState({ message = "No notifications found." }: { message?: string }) {
  return (
    <Box
      id="empty-state"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 10,
        gap: 2,
        color: "text.disabled",
      }}
    >
      <NotificationsOffIcon sx={{ fontSize: 64 }} />
      <Typography variant="h6">{message}</Typography>
    </Box>
  );
}
