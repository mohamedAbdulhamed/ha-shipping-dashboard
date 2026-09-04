import { Box, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

export function StatItem({
  label,
  value,
  isCurrency = true,
  highlight = false,
  icon,
}: {
  label: string;
  value: number;
  isCurrency?: boolean;
  highlight?: boolean;
  icon?: ReactNode;
}) {
  const formattedValue = isCurrency
    ? new Intl.NumberFormat("ar-EG", {
        style: "currency",
        currency: "EGP",
        minimumFractionDigits: 2,
      }).format(value)
    : value;

  return (
    <Stack direction="row" spacing={1} alignItems="baseline">
      <Box>{icon}</Box>
      <Typography variant="body2">{label}:</Typography>
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          color: highlight ? "warning.main" : "inherit",
          textShadow: highlight ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
        }}
      >
        {formattedValue}
      </Typography>
    </Stack>
  );
}
