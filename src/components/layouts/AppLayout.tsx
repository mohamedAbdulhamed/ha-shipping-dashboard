import { memo, useCallback, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import ToastNotification from "@/components/ui/ToastNotification";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

import { fadeIn } from "@/common/animations";

import {
  AppProvider,
  PageContainer,
  DashboardLayout,
  SidebarFooterProps,
  Session,
  type Navigation,
  NavigationItem,
  Account,
} from "@toolpad/core";
import useCustomRouter from "@/hooks/useCustomRouter";
import { useAuthStore } from "@/store";
import { usePageTitleStore } from "@/store";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/useToast";

import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import { PageLoader } from "../ui/PageLoader";
import { ROUTES } from "@/app/routes/routesConfig";
import { hasAnyRole, hasRole } from "@/utils";
import { ApiResponse, ROLES } from "@/types";
import Order from "@/entities/Order";
import useLocalStorageState from "@/hooks/useLocalStorageState";

const CustomAppTitle = memo(function CustomAppTitle() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleClick = () => {
    navigate(
      hasRole(user, ROLES.ADMIN) ? ROUTES.DASHBOARD.url : ROUTES.ORDERS.BASE.url
    );
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      onClick={handleClick}
      sx={{
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-1px)",
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 48, // Fits within a 64px toolbar (with padding)
          width: 48,
        }}
      >
        <Box
          component="img"
          src="/wesal-logo.png"
          alt="H&A Logistics"
          sx={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.1)",
            },
          }}
        />
      </Box>

      {/* Text and Slogan */}
      <Stack direction="column" spacing={0}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.02em",
            color: (theme) => theme.palette.text.primary,
          }}
        >
          H&A Logistics
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 400,
            color: (theme) => theme.palette.text.secondary,
            lineHeight: 1.2,
          }}
        >
          Your Cargo, Our Commitment
        </Typography>
      </Stack>
    </Stack>
  );
});

const SidebarFooter = memo(function SidebarFooter({
  mini,
}: SidebarFooterProps) {
  return (
    <Typography
      variant="caption"
      sx={{
        m: 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
        direction: "ltr",
      }}
    >
      {mini
        ? "© H&A"
        : `H&A Experts in Logistics and Supply Chain © ${new Date().getFullYear()}`}
    </Typography>
  );
});

const UserAccount = memo(() => (
  <Account
    localeText={{
      accountSignInLabel: "تسجيل الدخول",
      accountSignOutLabel: "تسجيل الخروج",
    }}
  />
));

export default function AppLayout() {
  const router = useCustomRouter();
  const { user, logout } = useAuthStore();
  const { title } = usePageTitleStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const axiosPrivate = useAxiosPrivate();
  const { showToast } = useToast();
    const [, , { remove }] = useLocalStorageState<boolean>(
      "persist",
      false
    );

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState<Order["billOfLading"]>("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const toggleSearchBar = () => setShowSearchBar((v) => !v);

  const handleSearch = useCallback(async () => {
    navigate(`${ROUTES.ORDERS.BASE.url}?billOfLading=${searchTerm}`);
  }, [searchTerm, navigate]);

  const NAVIGATION: Navigation = [
    // dashboard
    ...(hasRole(user, ROLES.ADMIN)
      ? [
          {
            kind: "header",
            title: "لوحة التحكم",
          } as NavigationItem,
          {
            title: "لوحة التحكم",
            segment: ROUTES.DASHBOARD.segment,
            icon: <DashboardIcon />,
          },
        ]
      : []),

    // users
    ...(hasAnyRole(user, [ROLES.ADMIN, ROLES.OPERATION])
      ? [
          {
            kind: "header",
            title: "المستخدمين",
          } as NavigationItem,
          {
            title: "المستخدمين",
            segment: ROUTES.USERS.segment,
            pattern: ROUTES.USERS.pattern,
            icon: <PeopleIcon />,
            children: [
              {
                title: "إدارة المستخدمين",
                icon: <PeopleIcon />,
              },
              {
                title: "إضافة مستخدم",
                segment: ROUTES.USERS.NEW.segment,
                icon: <PersonAddAltIcon />,
              },
            ],
          },
          {
            kind: "divider",
          } as NavigationItem,
        ]
      : []),

    // orders
    {
      kind: "header",
      title: "الشحنات",
    },
    {
      title: "الشحنات",
      segment: ROUTES.ORDERS.segment,
      pattern: ROUTES.ORDERS.pattern,
      icon: <LocalShippingIcon />,
      children: [
        {
          title: "إدارة الشحنات",
          icon: <InventoryIcon />,
        },
        ...(hasAnyRole(user, [ROLES.ADMIN, ROLES.OPERATION, ROLES.SENDER])
          ? [
              {
                title: "شحنة جديدة",
                segment: ROUTES.ORDERS.NEW.segment,
                icon: <ControlPointIcon />,
              },
            ]
          : []),
        ...(hasRole(user, ROLES.ADMIN)
          ? [
              {
                title: "قراءة الباركود للشحنات",
                segment: ROUTES.ORDERS.BARCODE.segment,
                icon: <QrCodeScannerIcon />,
              },
            ]
          : []),
      ],
    },

    // finance
    ...(hasRole(user, ROLES.ADMIN)
      ? [
          {
            kind: "divider",
          } as NavigationItem,
          {
            kind: "header",
            title: "التقفيل والتحصيل",
          } as NavigationItem,
          {
            title: "توريدات",
            segment: ROUTES.FINANCE.BASE.segment,
            icon: <AttachMoneyIcon />,
          },
          {
            title: "قراءة الباركود للتقفيل",
            segment: ROUTES.FINANCE.BARCODE.segment,
            icon: <QrCodeScannerIcon />,
          },
        ]
      : []),

    // branches
    ...(hasRole(user, ROLES.ADMIN)
      ? [
          {
            kind: "divider",
          } as NavigationItem,
          {
            kind: "header",
            title: "الفروع",
          } as NavigationItem,
          {
            title: "الفروع",
            segment: ROUTES.BRANCHES.BASE.segment,
            pattern: ROUTES.BRANCHES.pattern,
            icon: <WarehouseIcon />,
            children: [
              {
                title: "الفروع",
                segment: "",
                icon: <WarehouseIcon />,
              },
              {
                title: "اضف فرع جديد",
                segment: ROUTES.BRANCHES.NEW.segment,
                icon: <DomainAddIcon />,
              },
            ],
          },
        ]
      : []),

    // reports and profits
    ...(hasAnyRole(user, [ROLES.ADMIN])
      ? [
          {
            kind: "divider",
          } as NavigationItem,
          {
            kind: "header",
            title: "تقارير وارباح",
          } as NavigationItem,
        ]
      : []),
    ...(hasRole(user, ROLES.ADMIN)
      ? [
          {
            title: "الارباح",
            segment: ROUTES.REPORTS.PROFITS.segment,
            icon: <PriceCheckIcon />,
          },
        ]
      : []),
    ...(hasAnyRole(user, [ROLES.ADMIN])
      ? [
          {
            title: "تقرير مالي للعميل",
            segment: ROUTES.REPORTS.USER_PROFITS.segment,
            icon: <AccountBalanceWalletIcon />,
          },
        ]
      : []),
  ] as const;

  const apiLogout = useCallback(() => {
    setIsLoggingOut(true);

    axiosPrivate
      .get<ApiResponse>("/Account/logout")
      .then((res) => {
        if (res.data.Success) {
          logout();
          navigate(ROUTES.LOGIN.url);
        } else {
          console.error("Logout error", res.data.ErrorMessage);
        }
      })
      .catch((error) => {
        console.error("Logout error", error);
        showToast("فشل تسجيل الخروج", { type: "error" });
      })
      .finally(() => {
        remove();
        setIsLoggingOut(false);
      });
  }, [axiosPrivate, logout, navigate, showToast, remove]);

  const session = useMemo<Session | null>(
    () =>
      user
        ? {
            user: {
              name: `${user.fullName} - ${user.phoneNumber}`,
              email: user.role,
              image: "https://www.gravatar.com/avatar/?d=mp&s=64",
            },
          }
        : null,
    [user]
  );

  const authentication = useMemo(
    () => ({
      signIn: () => navigate(ROUTES.LOGIN.url),
      signOut: apiLogout,
    }),
    [navigate, apiLogout]
  );

  if (isLoggingOut) return <PageLoader text="جاري تسجيل الخروج" />;

  return (
    <Box className="app">
      <AppProvider
        navigation={NAVIGATION}
        router={router}
        theme={theme}
        session={session}
        authentication={authentication}
      >
        <DashboardLayout
          slots={{
            appTitle: CustomAppTitle,
            toolbarActions: () => (
              <>
                <IconButton
                  onClick={toggleSearchBar}
                  aria-label="Toggle Search"
                  sx={{ color: "inherit" }}
                >
                  <SearchIcon />
                </IconButton>
                <ThemeSwitcher />
              </>
            ),
            sidebarFooter: SidebarFooter,
            toolbarAccount: UserAccount,
          }}
        >
          <Box className="main-content">
            {showSearchBar && (
              <Box
                sx={{
                  position: "fixed",
                  top: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: theme.zIndex.modal + 1,
                  animation: `${fadeIn} 0.3s ease-out`,
                  width: "90vw",
                  maxWidth: 600,
                  backdropFilter: "blur(8px)",
                  borderRadius: 4,
                  boxShadow: theme.shadows[6],
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                  p: 1,
                  "&:hover": {
                    boxShadow: theme.shadows[10],
                    transform: "translateX(-50%) translateY(-2px)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  size="medium"
                  placeholder="ابحث برقم البوليصه..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleSearchBar}
                          sx={{
                            color: "text.secondary",
                            "&:hover": { color: "primary.main" },
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      borderRadius: 3,
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                        boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
                      },
                    },
                  }}
                  sx={{
                    "&:hover": {
                      "& .MuiInputBase-input": {
                        transform: "translateY(-1px)",
                      },
                    },
                  }}
                />
              </Box>
            )}
            <PageContainer
              title={title || ""}
              sx={{
                maxWidth: {
                  xs: "100%", // Full width on mobile
                  sm: "800px", // 800px on small tablets
                  md: "1000px", // 1000px on medium screens
                  lg: "1200px", // 1200px on large screens
                  xl: "1400px", // 1400px on extra large screens
                },
                mx: "auto",
                px: {
                  xs: 2, // 16px on mobile
                  sm: 3, // 24px on tablets
                  md: 4, // 32px on desktop
                },
                transition: "all 0.3s ease",
              }}
            >
              <Box className="content">
                <Outlet />
              </Box>
            </PageContainer>

            <ToastNotification theme={theme.palette.mode} />
          </Box>
        </DashboardLayout>
      </AppProvider>
    </Box>
  );
}
