import { Box, Stack, Typography, useTheme } from "@mui/material";

interface PrintSummaryDetails {
  totalCOD: number;
  totalShipping: number;
  totalNetProfit: number;
}

interface PrintSummaryProps {
  printSummaryDetails: PrintSummaryDetails;
}

export const PrintSummary = ({ printSummaryDetails }: PrintSummaryProps) => {
  const theme = useTheme();
  const currentDate = new Date().toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: "center",
        p: 0,
        m: 0,
        background: `
          linear-gradient(145deg, 
            ${theme.palette.background.paper} 0%, 
            ${theme.palette.grey[100]} 100%
          )
        `,
        borderRadius: 4,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        border: `1px solid ${theme.palette.divider}`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(
            90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.3) 50%,
            rgba(255,255,255,0) 100%
          )`,
        },
      }}
    >
      {/* Logo */}
      <Box
        component="img"
        src="/wesal-logo.png"
        alt="H&A Logistics"
        sx={{
          width: { xs: 120, md: 150 },
          height: { xs: 120, md: 150 },
          filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))",
        }}
      />

      {/* Summary Details */}
      <Stack
        direction="column"
        alignItems={{ xs: "center", md: "flex-end" }}
        sx={{
          width: { xs: "100%", md: "auto" },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            bgcolor: "action.hover",
            px: 2,
            py: 1,
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            📅 {currentDate}
          </Typography>
        </Stack>

        <Stack direction="column" alignItems="flex-start" width="100%">
          {[
            {
              label: "إجمالي التحصيل",
              value: printSummaryDetails.totalCOD,
            },
            {
              label: "إجمالي الشحن",
              value: printSummaryDetails.totalShipping,
            },
            {
              label: "صافي الربح",
              value: printSummaryDetails.totalNetProfit,
            },
          ].map((metric, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                gap: 2,
                flex: 1,
                p: 3,
                borderRadius: 3,
                textAlign: "center",
                minWidth: 200,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                color="text.secondary"
              >
                {metric.label}
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="black">
                {metric.value.toFixed(2)} ج.م
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};
