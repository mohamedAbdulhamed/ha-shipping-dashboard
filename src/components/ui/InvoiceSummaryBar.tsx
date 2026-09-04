import { Box, Button, CircularProgress, Stack, Typography, useTheme } from "@mui/material";
import { memo } from "react";
import { StatItem } from "./StatItem";
import { float, pulse } from "@/common/animations";

import PaidIcon from "@mui/icons-material/Paid";
import ReceiptIcon from "@mui/icons-material/Receipt";

export const InvoiceSummaryBar = memo(function InvoiceSummaryBar({
    invoiceDetails,
    rowCount,
    onCollect,
    loading,
  }: {
    invoiceDetails: { totalCOD: number; totalShipping: number; totalReceived: number; selectedCount: number };
    rowCount: number;
    onCollect: () => void;
    loading: boolean;
  }) {
    const theme = useTheme();

    return (
    <Box
    sx={{
      position: "sticky",
      top: 0,
      zIndex: 1,
      p: 3,
      mb: 2,
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      borderRadius: 2,
      boxShadow: theme.shadows[6],
      animation: `${float} 3s ease-in-out infinite`,
      backdropFilter: "blur(10px)",
    }}
  >
    <Stack direction="row" spacing={4} alignItems="center">
      <ReceiptIcon
        sx={{
          fontSize: 40,
          color: "white",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
        }}
      />

      <Stack spacing={1} sx={{ color: "white" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          الفاتورة المحددة
        </Typography>
        <Stack direction="row" spacing={3}>
          <StatItem
            label="عدد الشحنات"
            value={invoiceDetails.selectedCount}
            isCurrency={false}
          />
          <StatItem label="إجمالي COD" value={invoiceDetails.totalCOD} />
          <StatItem
            label="إجمالي الشحن"
            value={invoiceDetails.totalShipping}
          />
        </Stack>
        <StatItem
          label="الإجمالي المستحق"
          value={invoiceDetails.totalReceived}
          highlight
        />
      </Stack>

      <Stack
        direction="column"
        spacing={4}
        alignItems="center"
        justifyContent="center"
      >
        <Button
          variant="contained"
          color="secondary"
          onClick={onCollect}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              <PaidIcon />
            )
          }
          sx={{
            width: "100%",
            ml: "auto",
            px: 4,
            borderRadius: 2,
            fontWeight: 700,
            background: "rgba(255, 255, 255, 0.2)",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: theme.shadows[4],
            },
            animation: `${pulse} 2s infinite`,
            transition: "all 0.3s ease",
          }}
        >
          تحصيل ({rowCount}){" "}
          {rowCount > 1 ? "اوردرات" : "اوردر"}
        </Button>
      </Stack>
    </Stack>
  </Box>
    );
  });
  