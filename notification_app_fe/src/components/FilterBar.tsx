/**
 * src/components/FilterBar.tsx
 * Filter UI for selecting notification type (Event | Result | Placement).
 */

import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { NotificationType } from "../types/notification";
import { Log } from "../../logging_middleware_local/logger";

type FilterValue = NotificationType | "";

interface FilterBarProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

const TYPE_OPTIONS: { label: string; value: FilterValue }[] = [
  { label: "All Types", value: "" },
  { label: "Placement", value: "Placement" },
  { label: "Result", value: "Result" },
  { label: "Event", value: "Event" },
];

export default function FilterBar({ value, onChange }: FilterBarProps) {
  const handleChange = async (event: SelectChangeEvent<FilterValue>) => {
    const newValue = event.target.value as FilterValue;
    onChange(newValue);

    await Log(
      "frontend",
      "info",
      "component",
      `Filter changed to: ${newValue || "All"}`
    ).catch(console.error);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
        Filter by:
      </Typography>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="notification-type-filter-label">Notification Type</InputLabel>
        <Select
          labelId="notification-type-filter-label"
          id="notification-type-filter"
          value={value}
          label="Notification Type"
          onChange={handleChange}
        >
          {TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} id={`filter-option-${opt.value || "all"}`}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
