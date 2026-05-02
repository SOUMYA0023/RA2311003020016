/**
 * src/components/NotificationCard.tsx
 * A single notification card using MUI components.
 * Shows type chip, message, timestamp, and new/viewed visual state.
 */

import React from "react";
import {
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import { Notification, NotificationType } from "../types/notification";
import { useViewed } from "../state/ViewedContext";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import EventIcon from "@mui/icons-material/Event";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";

/** Color mapping for each notification type chip */
const TYPE_CHIP_COLORS: Record<
  NotificationType,
  "success" | "warning" | "error" | "primary" | "secondary" | "info" | "default"
> = {
  Placement: "success",
  Result: "warning",
  Event: "info",
};

/** Icon mapping for each notification type */
const TYPE_ICONS: Record<NotificationType, React.ReactElement> = {
  Placement: <WorkIcon fontSize="small" />,
  Result: <SchoolIcon fontSize="small" />,
  Event: <EventIcon fontSize="small" />,
};

interface NotificationCardProps {
  notification: Notification;
  /** If true, applies a distinct highlight for Placement type */
  highlightPlacement?: boolean;
}

export default function NotificationCard({
  notification,
  highlightPlacement = false,
}: NotificationCardProps) {
  const { isViewed, markViewed } = useViewed();
  const viewed = isViewed(notification.ID);
  const isPlacement = notification.Type === "Placement";

  const handleClick = () => {
    if (!viewed) {
      markViewed(notification.ID);
    }
  };

  // Format timestamp for display
  const formattedTime = (() => {
    try {
      return new Date(notification.Timestamp.replace(" ", "T")).toLocaleString();
    } catch {
      return notification.Timestamp;
    }
  })();

  return (
    <Card
      id={`notification-card-${notification.ID}`}
      elevation={viewed ? 1 : 4}
      sx={{
        mb: 2,
        border: viewed
          ? "1px solid transparent"
          : isPlacement && highlightPlacement
          ? "2px solid #4caf50"
          : "2px solid #1976d2",
        borderRadius: 2,
        transition: "all 0.2s ease",
        backgroundColor: viewed
          ? "background.paper"
          : isPlacement && highlightPlacement
          ? "rgba(76, 175, 80, 0.06)"
          : "rgba(25, 118, 210, 0.05)",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-1px)",
        },
      }}
    >
      <CardActionArea onClick={handleClick} sx={{ borderRadius: 2 }}>
        <CardContent>
          {/* Header row: Type chip + NEW badge */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Chip
              id={`chip-type-${notification.ID}`}
              icon={TYPE_ICONS[notification.Type]}
              label={notification.Type}
              color={TYPE_CHIP_COLORS[notification.Type]}
              size="small"
              variant={viewed ? "outlined" : "filled"}
              sx={{ fontWeight: viewed ? 400 : 700 }}
            />
            {!viewed && (
              <Tooltip title="New — click to mark as viewed">
                <Chip
                  id={`chip-new-${notification.ID}`}
                  icon={<NewReleasesIcon fontSize="small" />}
                  label="NEW"
                  size="small"
                  color="error"
                  variant="filled"
                  sx={{ fontWeight: 700, ml: 1 }}
                />
              </Tooltip>
            )}
          </Box>

          {/* Message */}
          <Typography
            variant="body1"
            sx={{
              fontWeight: viewed ? 400 : 600,
              color: viewed ? "text.secondary" : "text.primary",
              mb: 1,
              lineHeight: 1.5,
            }}
          >
            {notification.Message}
          </Typography>

          {/* Timestamp */}
          <Typography variant="caption" color="text.disabled">
            {formattedTime}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
