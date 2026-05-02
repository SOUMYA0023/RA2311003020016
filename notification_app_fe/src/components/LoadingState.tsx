/**
 * src/components/LoadingState.tsx
 * MUI CircularProgress loading indicator.
 */
import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
      <CircularProgress id="loading-spinner" size={48} thickness={4} />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}
