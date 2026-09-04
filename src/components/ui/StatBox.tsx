import React from "react";
import { Card, Typography, Box, useTheme } from "@mui/material";
import { motion } from "framer-motion";

interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
  onClick?: () => void;
}

export const StatBox: React.FC<StatBoxProps> = ({
  icon,
  label,
  value,
  color = "primary",
  onClick,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
      style={{ cursor: onClick ? "pointer" : "default", flex: 1 }}
      onClick={onClick}
    >
      <Card
        sx={{
          px: 3,
          py: 2,
          borderRadius: 4,
          boxShadow: 4,
          background: theme.palette[color].light,
          color: theme.palette[color].contrastText,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <Box>{icon}</Box>
        <Box textAlign="right">
          <Typography variant="subtitle2" fontWeight={500}>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </Card>
    </motion.div>
  );
};
