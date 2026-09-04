import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import {
  useForkRef,
  Box,
  styled,
  Theme,
  SxProps,
  useTheme,
  Button,
  alpha,
  ButtonProps,
  lighten,
  Tooltip,
  darken,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  GridCell,
  NoRowsOverlayPropsOverrides,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarColumnsButton,
  useGridApiContext,
  useGridSelector,
  gridRowSelectionStateSelector,
} from "@mui/x-data-grid-premium";

import DescriptionIcon from "@mui/icons-material/Description";
import RefreshIcon from "@mui/icons-material/Refresh";

import { DataGridArLocaleText } from "@/common/constants";
import { FetchOrdersResponse } from "@/types/dtos/Order.dto";
import { nanoid } from "nanoid";
import { ROUTES } from "@/app/routes/routesConfig";

const TraceUpdates = forwardRef<any, any>(({ Component, ...props }, ref) => {
  const rootRef = useRef<HTMLElement>(null);
  const handleRef = useForkRef(rootRef, ref);

  useEffect(() => {
    const root = rootRef.current;
    root!.classList.add("updating");
    root!.classList.add("updated");

    const timer = setTimeout(() => {
      root!.classList.remove("updating");
    }, 360);

    return () => {
      clearTimeout(timer);
    };
  });

  return <Component ref={handleRef} {...props} />;
});

export const CellWithTracer = forwardRef((props, ref) => {
  return <TraceUpdates ref={ref} Component={GridCell} {...props} />;
}) as typeof GridCell;

const StyledGridOverlay = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  "& .no-rows-primary": {
    fill: "#3D4751",
    ...theme.applyStyles("light", {
      fill: "#AEB8C2",
    }),
  },
  "& .no-rows-secondary": {
    fill: "#1D2126",
    ...theme.applyStyles("light", {
      fill: "#E8EAED",
    }),
  },
}));

export const NoRowsOverlay: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    sx?: SxProps<Theme>;
  } & NoRowsOverlayPropsOverrides
> = (props) => {
  return (
    <StyledGridOverlay {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        width={96}
        viewBox="0 0 452 257"
        aria-hidden
        focusable="false"
      >
        <path
          className="no-rows-primary"
          d="M348 69c-46.392 0-84 37.608-84 84s37.608 84 84 84 84-37.608 84-84-37.608-84-84-84Zm-104 84c0-57.438 46.562-104 104-104s104 46.562 104 104-46.562 104-104 104-104-46.562-104-104Z"
        />
        <path
          className="no-rows-primary"
          d="M308.929 113.929c3.905-3.905 10.237-3.905 14.142 0l63.64 63.64c3.905 3.905 3.905 10.236 0 14.142-3.906 3.905-10.237 3.905-14.142 0l-63.64-63.64c-3.905-3.905-3.905-10.237 0-14.142Z"
        />
        <path
          className="no-rows-primary"
          d="M308.929 191.711c-3.905-3.906-3.905-10.237 0-14.142l63.64-63.64c3.905-3.905 10.236-3.905 14.142 0 3.905 3.905 3.905 10.237 0 14.142l-63.64 63.64c-3.905 3.905-10.237 3.905-14.142 0Z"
        />
        <path
          className="no-rows-secondary"
          d="M0 10C0 4.477 4.477 0 10 0h380c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 20 0 15.523 0 10ZM0 59c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 69 0 64.523 0 59ZM0 106c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 153c0-5.523 4.477-10 10-10h195.5c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 200c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 247c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10Z"
        />
      </svg>
      <Box sx={{ mt: 2 }}>{DataGridArLocaleText.noRowsLabel}</Box>
    </StyledGridOverlay>
  );
};

const StyledToolbarButton = styled(Button)<ButtonProps>(({ theme }) => ({
  gap: 8,
  borderRadius: 20,
  padding: "8px 16px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `1px solid ${theme.palette.divider}`,
  background: `linear-gradient(145deg, ${lighten(theme.palette.background.paper, 0.05)}, ${darken(theme.palette.background.paper, 0.02)})`,
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[2],
    background: `linear-gradient(145deg, ${lighten(theme.palette.background.paper, 0.08)}, ${darken(theme.palette.background.paper, 0.01)})`,
  },
  "&:active": {
    transform: "translateY(0)",
    boxShadow: theme.shadows[0],
  },
  "& .MuiSvgIcon-root": {
    transition: "transform 0.3s ease",
  },
  "&:hover .MuiSvgIcon-root": {
    transform: "scale(1.1)",
  },
}));

export function CustomToolbar({
  setIsPrintMode,
}: {
  setIsPrintMode?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const theme = useTheme();
  const apiRef = useGridApiContext();

  const selectedRowIds = useGridSelector(apiRef, gridRowSelectionStateSelector);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    setSelectedCount(selectedRowIds.length);
  }, [selectedRowIds]);

  const handlePrint = useCallback(() => {
    if (setIsPrintMode) {
      setIsPrintMode(true);
    } else {
      apiRef.current.exportDataAsPrint({
        fileName: `طلبات الشحن ${new Date().toLocaleDateString("ar-EG")}.pdf`,
      });
    }
  }, [apiRef, setIsPrintMode]);

  return (
    <GridToolbarContainer
      sx={{
        p: 1.5,
        gap: 2,
        backgroundColor: "transparent",
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(95deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
        backdropFilter: "blur(8px)",
        boxShadow: theme.shadows[2],
        borderRadius: "12px 12px 0 0",
        margin: "0 4px",
      }}
    >
      {/* Excel Export */}
      <Tooltip title="تصدير إلى Excel" arrow>
        <StyledToolbarButton
          size="small"
          startIcon={<DescriptionIcon color="success" />}
          onClick={() =>
            apiRef.current.exportDataAsExcel({
              fileName: `طلبات الشحن ${new Date().toLocaleDateString("ar-EG")}.xlsx`,
            })
          }
          sx={{
            color: theme.palette.success.main,
            "&:hover": {
              boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.2)}`,
            },
          }}
        >
          تصدير Excel
          {selectedCount > 0 && (
            <span style={{ marginRight: "5px" }}>({selectedCount} طلبات)</span>
          )}
        </StyledToolbarButton>
      </Tooltip>

      {/* Print */}
      <Tooltip title="طباعة البيانات" arrow>
        <StyledToolbarButton
          size="small"
          startIcon={<DescriptionIcon color="info" />}
          onClick={handlePrint}
          sx={{
            color: theme.palette.info.main,
            "&:hover": {
              boxShadow: `0 2px 8px ${alpha(theme.palette.info.main, 0.2)}`,
            },
          }}
        >
          طباعة
          {selectedCount > 0 && (
            <span style={{ marginRight: "5px" }}>({selectedCount} طلبات)</span>
          )}
        </StyledToolbarButton>
      </Tooltip>

      {/* Density Selector */}

      <GridToolbarDensitySelector />
      <GridToolbarColumnsButton />
    </GridToolbarContainer>
  );
}

interface CustomToolbarForBillProps {
  items: FetchOrdersResponse[];
  setIsPrintMode?: (value: boolean) => void;
  onRefresh?: () => void;
  isFetching?: boolean;
}

// Custom Toolbar for printing bill of lading
export function CustomToolbarForBill({
  items,
  setIsPrintMode,
  onRefresh,
  isFetching = false,
}: CustomToolbarForBillProps) {
  const theme = useTheme();
  const apiRef = useGridApiContext();

  const selectedRowIds = useGridSelector(apiRef, gridRowSelectionStateSelector);
  const [selectedCount, setSelectedCount] = useState(0);
  const [perPage, setPerPage] = useState(1);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    setSelectedCount(selectedRowIds.length);
  }, [selectedRowIds]);

  const handlePrintBillOfLadings = useCallback(() => {
    const toPrint = items.filter((o) => selectedRowIds.includes(o.id));

    const printKey = `printOrders_${nanoid()}`;

    sessionStorage.setItem(printKey, JSON.stringify(toPrint));

    const url = new URL(ROUTES.ORDERS.PRINT.url, window.location.origin);
    url.searchParams.set("printKey", printKey);
    url.searchParams.set("perPage", String(perPage));
    window.open(url.toString(), "_blank");
  }, [items, perPage, selectedRowIds]);

  const handlePrintRefunds = useCallback(() => {
    if (setIsPrintMode) {
      setIsPrintMode(true);
    }

    const currentDensity = apiRef.current.state.density;

    apiRef.current.setDensity("comfortable");

    const resetPrintMode = () => {
      if (setIsPrintMode) {
        setIsPrintMode(false);
      }
    };

    const handleAfterPrint = () => {
      resetPrintMode();

      apiRef.current.setDensity(currentDensity);
      window.removeEventListener("afterprint", handleAfterPrint);
    };

    window.addEventListener("afterprint", handleAfterPrint);

    setTimeout(() => {
      apiRef.current.exportDataAsPrint({
        fileName: `طلبات الشحن المرتجعات ${new Date().toLocaleDateString("ar-EG")}.pdf`,
      });

      setTimeout(() => {
        resetPrintMode();
        apiRef.current.setDensity(currentDensity);
      }, 3000);
    }, 1000);
  }, [apiRef, setIsPrintMode]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    await onRefresh();
    setLastRefreshed(new Date());
  }, [onRefresh]);

  // Format time as HH:mm:ss
  const formattedTime = lastRefreshed
    ? lastRefreshed.toLocaleTimeString("ar-EG", { hour12: true })
    : "";

  return (
    <GridToolbarContainer
      sx={{
        p: 1.5,
        gap: 2,
        backgroundColor: "transparent",
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(95deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
        backdropFilter: "blur(8px)",
        boxShadow: theme.shadows[2],
        borderRadius: "12px 12px 0 0",
        margin: "0 4px",
      }}
    >
      {/* Excel Export */}
      <Tooltip title="تصدير إلى Excel" arrow>
        <StyledToolbarButton
          size="small"
          startIcon={<DescriptionIcon color="success" />}
          onClick={() =>
            apiRef.current.exportDataAsExcel({
              fileName: `طلبات الشحن ${new Date().toLocaleDateString("ar-EG")}.xlsx`,
            })
          }
          sx={{
            color: theme.palette.success.main,
            "&:hover": {
              boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.2)}`,
            },
          }}
        >
          تصدير Excel
          {selectedCount > 0 && (
            <span style={{ marginRight: "5px" }}>({selectedCount} طلبات)</span>
          )}
        </StyledToolbarButton>
      </Tooltip>

      {/* Print Bill of ladings */}
      <Tooltip title="طباعة البوالص" arrow>
        <StyledToolbarButton
          size="small"
          startIcon={<DescriptionIcon color="info" />}
          onClick={() => handlePrintBillOfLadings()}
          sx={{
            color: theme.palette.info.main,
            "&:hover": {
              boxShadow: `0 2px 8px ${alpha(theme.palette.info.main, 0.2)}`,
            },
          }}
        >
          طباعة البوالص
          {selectedCount > 0 && (
            <span style={{ marginRight: "5px" }}>({selectedCount} طلبات)</span>
          )}
        </StyledToolbarButton>
      </Tooltip>

      {/* Print */}
      {/* For refunds the bill of lading should render as barcode */}
      <Tooltip title="طباعة المرتجعات" arrow>
        <StyledToolbarButton
          size="small"
          startIcon={<DescriptionIcon color="warning" />}
          onClick={handlePrintRefunds}
          sx={{
            color: theme.palette.warning.main,
            "&:hover": {
              boxShadow: `0 2px 8px ${alpha(theme.palette.warning.main, 0.2)}`,
            },
          }}
        >
          طباعة المرتجعات
          {selectedCount > 0 && (
            <span style={{ marginRight: "5px" }}>({selectedCount} طلبات)</span>
          )}
        </StyledToolbarButton>
      </Tooltip>

      {/* if is bill and selectedCount > 0 */}
      {selectedCount > 0 && (
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>الطلبات لكل صفحة</InputLabel>
          <Select
            value={perPage}
            label="الطلبات لكل صفحة"
            onChange={(e) => setPerPage(e.target.value as number)}
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={3}>3</MenuItem>
          </Select>
        </FormControl>
      )}

      {/* Density Selector */}

      <GridToolbarDensitySelector />
      <GridToolbarColumnsButton />

      <Tooltip
        title={
          isFetching
            ? "جاري التحديث..."
            : lastRefreshed
            ? `آخر تحديث: ${formattedTime}`
            : "تحديث"
        }
        arrow
      >
        <span> {/* wrapper to allow disabling */}
          <StyledToolbarButton
            size="small"
            onClick={handleRefresh}
            disabled={isFetching}
            sx={{
              color: "info.main",
              position: "relative",
            }}
            startIcon={
              isFetching ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <motion.div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  animate={isFetching ? { rotate: 360 } : { rotate: 0 }}
                  transition={
                    isFetching
                      ? { repeat: Infinity, duration: 1, ease: "linear" }
                      : {}
                  }
                >
                  <RefreshIcon />
                </motion.div>
              )
            }
          >
            تحديث
          </StyledToolbarButton>
        </span>
      </Tooltip>
    </GridToolbarContainer>
  );
}
