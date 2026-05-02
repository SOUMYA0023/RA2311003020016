/**
 * src/components/ErrorState.tsx
 * MUI Alert for error display.
 */
import React from "react";
import { Alert, Box, Button } from "@mui/material";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Box sx={{ py: 4 }}>
      <Alert
        id="error-alert"
        severity="error"
        action={
          onRetry ? (
            <Button id="retry-button" color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      >
        {message}
      </Alert>
    </Box>
  );
}
