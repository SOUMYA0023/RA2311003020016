/**
 * src/components/NavBar.tsx
 * Responsive top navigation bar with links to both pages.
 */

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import Link from "next/link";
import { useRouter } from "next/router";

export default function NavBar() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isActive = (path: string) => router.pathname === path;

  return (
    <AppBar position="sticky" elevation={2} sx={{ backgroundColor: "#1a237e" }}>
      <Toolbar>
        {/* Brand */}
        <NotificationsIcon sx={{ mr: 1 }} />
        <Typography
          variant={isMobile ? "body1" : "h6"}
          sx={{ fontWeight: 700, flexGrow: 1, letterSpacing: 0.5 }}
        >
          {isMobile ? "Campus Alerts" : "Campus Notification System"}
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {isMobile ? (
            <>
              <Tooltip title="All Notifications">
                <IconButton
                  id="nav-all"
                  component={Link}
                  href="/notifications"
                  color="inherit"
                  sx={{
                    opacity: isActive("/notifications") ? 1 : 0.7,
                    borderBottom: isActive("/notifications") ? "2px solid white" : "none",
                  }}
                >
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Priority Notifications">
                <IconButton
                  id="nav-priority"
                  component={Link}
                  href="/notifications/priority"
                  color="inherit"
                  sx={{
                    opacity: isActive("/notifications/priority") ? 1 : 0.7,
                    borderBottom: isActive("/notifications/priority") ? "2px solid white" : "none",
                  }}
                >
                  <StarIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Button
                id="nav-all"
                component={Link}
                href="/notifications"
                color="inherit"
                startIcon={<NotificationsIcon />}
                sx={{
                  fontWeight: isActive("/notifications") ? 700 : 400,
                  borderBottom: isActive("/notifications") ? "2px solid white" : "2px solid transparent",
                  borderRadius: 0,
                }}
              >
                All Notifications
              </Button>
              <Button
                id="nav-priority"
                component={Link}
                href="/notifications/priority"
                color="inherit"
                startIcon={<StarIcon />}
                sx={{
                  fontWeight: isActive("/notifications/priority") ? 700 : 400,
                  borderBottom: isActive("/notifications/priority") ? "2px solid white" : "2px solid transparent",
                  borderRadius: 0,
                }}
              >
                Priority
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
