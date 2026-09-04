import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  Box,
  Grid2,
  Typography,
  useTheme,
  Divider,
  Skeleton,
  Stack,
} from "@mui/material";
import { BarChart, PieChart } from "@mui/x-charts";
import { StatBox } from "@/components/ui/StatBox";
import { ROUTES } from "@/app/routes/routesConfig";

import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import DataUsageIcon from "@mui/icons-material/DataUsage";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inProgressOrders: number;
  allowedToCloseOrders: number;
  closedOrders: number;
  totalBranches: number;
}

function StatBoxSkeleton() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: theme.shadows[1],
        gap: 1.5,
      }}
    >
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="text" width="60%" height={28} />
      <Skeleton variant="text" width="40%" height={24} />
    </Box>
  );
}

export function DashboardPage() {
  const theme = useTheme();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const { data: stats, isLoading }: UseQueryResult<DashboardStats> = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const safeFetch = async (url: string): Promise<number> => {
        try {
          const res = await axiosPrivate.get<{ Result: number }>(url);
          return res.data.Result;
        } catch {
          return 0;
        }
      };

      const [
        totalUsers,
        activeUsers,
        inProgressOrders,
        allowedToCloseOrders,
        closedOrders,
        totalBranches,
      ] = await Promise.all([
        safeFetch("/Account/total-count"),
        safeFetch("/Account/active-count"),
        safeFetch("/Orders/total-in-progress"),
        safeFetch("/Orders/total-allow-to-close"),
        safeFetch("/Orders/total-closed"),
        safeFetch("/Branchs/total-count"),
      ]);

      return {
        totalUsers,
        activeUsers,
        inProgressOrders,
        allowedToCloseOrders,
        closedOrders,
        totalBranches,
      };
    },
  });

  const cards = [
    {
      icon: <PeopleIcon fontSize="large" />,
      label: "إجمالي المستخدمين",
      value: stats?.totalUsers ?? 0,
      color: "primary" as const,
      onClick: () => navigate(ROUTES.USERS.BASE.url),
    },
    {
      icon: <PeopleIcon fontSize="large" />,
      label: "المستخدمين النشطين",
      value: stats?.activeUsers ?? 0,
      color: "success" as const,
      onClick: () => navigate(ROUTES.USERS.BASE.url),
    },
    {
      icon: <AssignmentIcon fontSize="large" />,
      label: "الطلبات الجارية",
      value: stats?.inProgressOrders ?? 0,
      color: "warning" as const,
      onClick: () => navigate(ROUTES.ORDERS.BASE.url),
    },
    {
      icon: <TrendingUpIcon fontSize="large" />,
      label: "قابل للتقفيل",
      value: stats?.allowedToCloseOrders ?? 0,
      color: "info" as const,
      onClick: () => navigate(ROUTES.FINANCE.BASE.url),
    },
    {
      icon: <DoneAllIcon fontSize="large" />,
      label: "الطلبات المغلقة",
      value: stats?.closedOrders ?? 0,
      color: "error" as const,
      onClick: () => navigate(ROUTES.FINANCE.BASE.url),
    },
    {
      icon: <WarehouseIcon fontSize="large" />,
      label: "إجمالي الفروع",
      value: stats?.totalBranches ?? 0,
      color: "secondary" as const,
      onClick: () => navigate(ROUTES.BRANCHES.BASE.url),
    },
  ];

  // Data for Bar Chart (single entry with all metrics as separate fields)
  const barChartData = [
    {
      totalUsers: stats?.totalUsers ?? 0,
      activeUsers: stats?.activeUsers ?? 0,
      inProgressOrders: stats?.inProgressOrders ?? 0,
      allowedToCloseOrders: stats?.allowedToCloseOrders ?? 0,
      closedOrders: stats?.closedOrders ?? 0,
      totalBranches: stats?.totalBranches ?? 0,
      category: "المقاييس", // Single category for all bars
    },
  ];

  // Series for Bar Chart
  const barSeries = [
    {
      dataKey: "totalUsers",
      label: "إجمالي المستخدمين",
      color: theme.palette.primary.main,
    },
    {
      dataKey: "activeUsers",
      label: "المستخدمين النشطين",
      color: theme.palette.success.main,
    },
    {
      dataKey: "inProgressOrders",
      label: "الطلبات الجارية",
      color: theme.palette.warning.main,
    },
    {
      dataKey: "allowedToCloseOrders",
      label: "قابل للتقفيل",
      color: theme.palette.info.main,
    },
    {
      dataKey: "closedOrders",
      label: "الطلبات المغلقة",
      color: theme.palette.error.main,
    },
    {
      dataKey: "totalBranches",
      label: "إجمالي الفروع",
      color: theme.palette.secondary.main,
    },
  ];

  // Data for Pie Chart (User Engagement)
  const pieChartData = [
    { label: "نشط", value: stats?.activeUsers ?? 0 },
    {
      label: "غير نشط",
      value: (stats?.totalUsers ?? 0) - (stats?.activeUsers ?? 0),
    },
  ];

  // Colors for Pie Chart
  const pieColors = [theme.palette.success.main, theme.palette.grey[400]];

  return (
    <Box
      className="dashboard-container"
      sx={{
        p: 4,
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        لوحة التحكم
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        نظرة عامة على حالة النظام
      </Typography>

      {/* Stat Cards */}
      <Grid2 container spacing={3}>
        {cards.map((stat, i) => (
          <Grid2
            key={i}
            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            sx={{ height: "100%" }}
          >
            {isLoading ? <StatBoxSkeleton /> : <StatBox {...stat} />}
          </Grid2>
        ))}
      </Grid2>

      <Divider sx={{ my: 5 }} />

      {/* Charts Section */}
      <Box
        sx={{
          p: 3,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 4,
          boxShadow: theme.shadows[2],
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <DataUsageIcon color="info" />
          <Typography variant="h6" fontWeight={600}>
            تحليلات الأداء
          </Typography>
        </Stack>

        {isLoading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={300}
            sx={{ mt: 2 }}
          />
        ) : (
          <Grid2 container spacing={3} sx={{ mt: 2 }}>
            {/* Bar Chart: Compare All Metrics */}
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" fontWeight={500} mb={2}>
                نظرة عامة على المقاييس
              </Typography>
              <BarChart
                dataset={barChartData}
                xAxis={[
                  {
                    scaleType: "band",
                    dataKey: "category",
                    tickLabelStyle: {
                      angle: -45,
                      textAnchor: "end",
                      fontSize: 12,
                    },
                  },
                ]}
                series={barSeries}
                height={300}
                margin={{ top: 20, bottom: 60, left: 40, right: 20 }}
                sx={{
                  "& .MuiChartsAxis-tickLabel": {
                    fontFamily: theme.typography.fontFamily,
                  },
                }}
              />
            </Grid2>

            {/* Pie Chart: User Engagement */}
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" fontWeight={500} mb={2}>
                تفاصيل المستخدمين
              </Typography>
              <PieChart
                series={[
                  {
                    data: pieChartData.map((item, index) => ({
                      id: index,
                      value: item.value,
                      label: item.label,
                      color: pieColors[index],
                    })),
                    innerRadius: 30, // Makes it a donut chart
                    paddingAngle: 2,
                    cornerRadius: 5,
                  },
                ]}
                height={300}
                margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
                slotProps={{
                  legend: {
                    direction: "horizontal",
                    position: { vertical: "bottom", horizontal: "center" },
                    // padding: 0,
                  },
                }}
              />
            </Grid2>
          </Grid2>
        )}
      </Box>
    </Box>
  );
}
