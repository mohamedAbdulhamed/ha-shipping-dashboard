import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  alpha,
  Autocomplete,
  Box,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GridColDef,
  GridListColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid-premium";

import { ApiUrls, DataGridArLocaleText, DEFAULT_PAGE_SIZE_OPTIONS } from "@/common/constants";
import { float } from "@/common/animations";

import ReceiptIcon from "@mui/icons-material/Receipt";
import VisibilityIcon from "@mui/icons-material/Visibility";

import {
  CellWithTracer,
  CustomToolbar,
  NoRowsOverlay,
} from "@/components/grid/CustomGridComponents";
import { ToggleableFiltersMenu } from "@/components/crud/FiltersMenu";
import { PrintSummary } from "@/components/ui/PrintSummary";
import { StyledDataGrid } from "@/components/grid/StyledDataGrid";
import { StatItem } from "@/components/ui/StatItem";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useGrid } from "@/hooks/useGrid";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

import { fetchAll } from "@/services/api/entities.api";
import { ROUTES } from "@/app/routes/routesConfig";

import { FetchProfitOrdersResponse } from "@/types/dtos/Report.dto";
import { FetchCustomersResponse } from "@/types/dtos/User.dto";
import { PaginatedResult } from "@/types";

import { Option, toOptions } from "@/utils";

import "../styles/reports.css";

const GRID_CONTAINER_HEIGHT = 1000;
const GRID_CONTAINER_MIN_HEIGHT = 1200;
const OVERLAY_HEIGHT = 300;
const LIST_VIEW_ROW_HEIGHT = 64;
const DEFAULT_ROW_HEIGHT = 52;
const ROW_BUFFER_PIXELS = 1000;
const COLUMN_BUFFER_PIXELS = 1000;

export function ProfitReport() {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const theme = useTheme();
  const {
    items,
    isLoading,
    totalRowCount,
    paginationModel,
    handlePaginationChange,
    handleFilterChange,
    extras: { netProfit },
  } = useGrid<FetchProfitOrdersResponse, { netProfit: number }>(
    axiosPrivate,
    ApiUrls.fetchProfitReports,
    "profitOrders",
    fetchAll
  );
  const isListView = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const rowHeight = isListView ? LIST_VIEW_ROW_HEIGHT : DEFAULT_ROW_HEIGHT;

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);
  const [isPrintMode, setIsPrintMode] = useState(false);

  const {
    data: customers,
  }: UseQueryResult<PaginatedResult<FetchCustomersResponse>> = useQuery({
    queryKey: ["customers"],
    queryFn: () =>
      fetchAll<FetchCustomersResponse>(
        axiosPrivate,
        ApiUrls.fetchAllCustomerNames
      ),
  });
  const customersOptions: Option<string>[] = toOptions(
    customers?.data ?? [],
    "name",
    "id"
  );

  const gridColDef: GridColDef<FetchProfitOrdersResponse>[] = [
    {
      field: "billOfLading",
      headerName: "رقم البوليصه",
      flex: isPrintMode ? undefined : 1,
      width: isPrintMode ? 200 : undefined,
      renderCell: (params: GridRenderCellParams<FetchProfitOrdersResponse>) => (
        <Typography
          component="a"
          href={ROUTES.ORDERS.GET_VIEW_URL_BY_ID(params.row.id)}
          onClick={(e) => {
            e.preventDefault();
            navigate(ROUTES.ORDERS.GET_VIEW_URL_BY_ID(params.row.id));
          }}
          sx={{
            color: "primary.main",
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "financialCloseDate",
      headerName: "تاريخ التقفيل",
      type: "date",
      flex: 1,
      valueGetter: (params: FetchProfitOrdersResponse["financialCloseDate"]) =>
        params ? new Date(params) : null,
      valueFormatter: (
        params: FetchProfitOrdersResponse["financialCloseDate"]
      ) => {
        return params ? new Date(params).toLocaleDateString() : "";
      },
      renderCell: (params: GridRenderCellParams<FetchProfitOrdersResponse>) => {
        return (
          <Typography color="textDisabled">
            {params.row.financialCloseDate
              ? new Date(params.row.financialCloseDate).toLocaleDateString(
                  "ar-EG",
                  {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }
                )
              : ""}
          </Typography>
        );
      },
    },
    {
      field: "codAmount",
      headerName: "التحصيل",
      type: "number",
      flex: 1,
      align: "left",
      headerAlign: "left",
      valueFormatter: (params: FetchProfitOrdersResponse["codAmount"]) => {
        return params != null ? params.toFixed(2) : "";
      },
    },
    {
      field: "shippingCost",
      headerName: "الشحن",
      type: "number",
      flex: 1,
      align: "left",
      headerAlign: "left",
      valueFormatter: (params: FetchProfitOrdersResponse["shippingCost"]) => {
        return params != null ? params.toFixed(2) : "";
      },
    },
    {
      field: "senderName",
      headerName: "الراسل",
      flex: 1,
    },
    {
      field: "receiverName",
      headerName: "المرسل اليه",
      flex: 1,
    },
    {
      field: "quantity",
      headerName: "الكمية",
      type: "number",
      align: "left",
      headerAlign: "left",
      flex: 1,
    },
    {
      field: "serviceType",
      headerName: "نوع الخدمة",
      flex: 1,
    },
    {
      field: "orderSerialNumber",
      headerName: "رقم الطلب",
      flex: 1,
    },
  ];

  const ListViewCell = function (props: GridRenderCellParams) {
    const { row } = props;
    const theme = useTheme();

    return (
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          height: "100%",
          gap: 2,
          p: 1,
          borderRadius: 2,
          backgroundColor: "background.paper",
          boxShadow: theme.shadows[1],
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: theme.shadows[3],
            transform: "translateY(-2px)",
          },
        }}
      >
        <Stack sx={{ flexGrow: 1, gap: 0.5 }}>
          <Typography variant="body2" fontWeight="bold">
            {row.receiverName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.billOfLading}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(row.createdAt).toLocaleDateString()}
          </Typography>
        </Stack>

        <Stack direction="row" sx={{ gap: 1 }}>
          <IconButton
            aria-label="View"
            onClick={() => navigate(ROUTES.ORDERS.GET_VIEW_URL_BY_ID(row.id))}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
                backgroundColor: "rgba(76, 175, 80, 0.08)",
              },
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    );
  };

  const listColDef: GridListColDef = {
    field: "listColumn",
    renderCell: (params) => <ListViewCell {...params} />,
  };

  const printSummaryDetails = useMemo(() => {
    const selectedOrders = items.filter((item) =>
      rowSelectionModel.includes(item.id)
    );

    return selectedOrders.reduce(
      (acc, order) => ({
        totalCOD: acc.totalCOD + (order.codAmount || 0),
        totalShipping: acc.totalShipping + (order.shippingCost || 0),
        totalNetProfit: acc.totalNetProfit + (order.netAmount || 0),
      }),
      { totalCOD: 0, totalShipping: 0, totalNetProfit: 0 }
    );
  }, [items, rowSelectionModel]);

  useEffect(() => {
    if (isPrintMode) {
      setTimeout(() => {
        window.print();
        setIsPrintMode(false);
      }, 1000);
    }
  }, [isPrintMode, rowSelectionModel, items]);

  return (
    <Box
      className="main-container"
      sx={(theme) => ({
        height: isPrintMode ? "auto" : GRID_CONTAINER_HEIGHT,
        maxHeight: isPrintMode ? "none" : "90vh",
        minHeight: isPrintMode ? "auto" : GRID_CONTAINER_MIN_HEIGHT,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(3),
        p: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.grey[700]
            : theme.palette.grey[200],
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[5],
        "&&& .updated": {
          transition: theme.transitions.create(
            ["background-color", "outline"],
            {
              duration: theme.transitions.duration.standard,
            }
          ),
        },
        "&&& .updating": {
          backgroundColor: "rgb(92 199 68 / 20%)",
          outline: "1px solid rgb(92 199 68 / 35%)",
          outlineOffset: "-1px",
          transition: "none",
        },
      })}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -8,
              left: 0,
              width: "60%",
              height: 4,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 2,
            },
          }}
        >
          الارباح
        </Typography>
      </Box>

      {/* Total Profit */}
      {isLoading ? (
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
            <Skeleton variant="circular" width={40} height={40} />
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Skeleton variant="text" width={120} height={30} />
              <Stack direction="row" spacing={3}>
                <Skeleton variant="rounded" width={100} height={40} />
                <Skeleton variant="rounded" width={100} height={40} />
                <Skeleton variant="rounded" width={100} height={40} />
              </Stack>
              <Skeleton variant="rounded" width={200} height={50} />
            </Stack>
          </Stack>
        </Box>
      ) : (
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
                صافي الربح
              </Typography>
              <Stack direction="row" spacing={3}>
                <StatItem
                  label="عدد الشحنات"
                  value={totalRowCount}
                  isCurrency={false}
                  icon={<span>📦</span>}
                />
              </Stack>
              <StatItem label="اجمالي صافي الربح" value={netProfit} highlight />
            </Stack>
          </Stack>
        </Box>
      )}

      {/* Filters */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ToggleableFiltersMenu<Partial<FetchProfitOrdersResponse>>
          fields={[
            {
              name: "startDate",
              label: "تاريخ بدأ التقفيل",
              type: "date",
              fieldElement: (value, onChange) => {
                return isListView ? (
                  <MobileDatePicker
                    label="تاريخ بدأ التقفيل"
                    value={value}
                    onChange={(newValue) => onChange(newValue)}
                    format="YYYY-MM-DD"
                    slotProps={{
                      textField: {
                        helperText: "YYYY-MM-DD | يوم-شهر-سنة",
                      },
                    }}
                  />
                ) : (
                  <DatePicker
                    label="تاريخ بدأ التقفيل"
                    value={value}
                    onChange={(newValue) => onChange(newValue)}
                    format="YYYY-MM-DD"
                    slotProps={{
                      textField: {
                        helperText: "YYYY-MM-DD | يوم-شهر-سنة",
                      },
                    }}
                  />
                );
              },
            },
            {
              name: "endDate",
              label: "تاريخ انتهاء التقفيل",
              type: "date",
              fieldElement: (value, onChange) => {
                return isListView ? (
                  <MobileDatePicker
                    label="تاريخ انتهاء التقفيل"
                    value={value}
                    onChange={(newValue) => onChange(newValue)}
                    format="YYYY-MM-DD"
                    slotProps={{
                      textField: {
                        helperText: "YYYY-MM-DD | يوم-شهر-سنة",
                      },
                    }}
                  />
                ) : (
                  <DatePicker
                    label="تاريخ انتهاء التقفيل"
                    value={value}
                    onChange={(newValue) => onChange(newValue)}
                    format="YYYY-MM-DD"
                    slotProps={{
                      textField: {
                        helperText: "YYYY-MM-DD | يوم-شهر-سنة",
                      },
                    }}
                  />
                );
              },
            },
            {
              name: "senderId",
              label: "اسم الراسل",
              type: "string",
              fieldElement: (value, onChange) => {
                return (
                  <Autocomplete
                    value={
                      customersOptions.find(
                        (option) => option.value === value
                      ) ?? null
                    }
                    onChange={(_, newValue) =>
                      onChange(
                        typeof newValue === "string"
                          ? newValue
                          : newValue?.value || ""
                      )
                    }
                    options={customersOptions}
                    getOptionLabel={(option) => {
                      const customer = customers?.data.find(
                        (c) => c.id === option.value
                      );
                      return customer
                        ? `${customer.name} - ${customer.phoneNumber}`
                        : option.label;
                    }}
                    clearOnEscape
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="اسم الراسل"
                        variant="outlined"
                        size="medium"
                        fullWidth
                      />
                    )}
                  />
                );
              },
            },
          ]}
          onFiltersChange={handleFilterChange}
        />
      </LocalizationProvider>

      {/* Invoice Details (for Printing) Section */}
      {isPrintMode && rowSelectionModel.length > 0 && (
        <Box className="print-summary">
          <PrintSummary printSummaryDetails={printSummaryDetails} />
        </Box>
      )}

      <StyledDataGrid
        rows={
          isPrintMode
            ? items.filter((item) => rowSelectionModel.includes(item.id))
            : items
        }
        columns={gridColDef as readonly GridColDef[]}
        sx={(theme) => ({
          backgroundColor: theme.palette.background.default,
          boxShadow: 2,
          border: 2,
          borderColor:
            theme.palette.mode === "dark"
              ? theme.palette.grey[700]
              : theme.palette.grey[200],
          "& .MuiDataGrid-row.--even-cell:not(.Mui-selected)": {
            background: `linear-gradient(95deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
          },
          "& .MuiDataGrid-cell:last-child": {
            borderRight: "none",
          },

          "--DataGrid-overlayHeight": `${OVERLAY_HEIGHT}px`,
        })}
        rowHeight={rowHeight}
        unstable_listView={isListView}
        unstable_listColumn={listColDef}
        initialState={{
          pagination: {
            paginationModel: paginationModel,
          },
          pinnedColumns: undefined,
        }}
        disableRowSelectionOnClick
        pinnedColumns={
          isListView
            ? undefined
            : {
                left: ["actions"],
                right: [GRID_CHECKBOX_SELECTION_COL_DEF.field],
              }
        }
        disableColumnPinning={isListView}
        disableVirtualization={isPrintMode}
        rowBufferPx={ROW_BUFFER_PIXELS}
        columnBufferPx={COLUMN_BUFFER_PIXELS}
        autosizeOptions={{
          includeOutliers: true,
          includeHeaders: true,
        }}
        disableColumnMenu
        disableColumnFilter
        disableColumnSorting
        // Server-side pagination, soring and filter
        pagination
        rowCount={totalRowCount}
        pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
        paginationModel={paginationModel}
        paginationMode="server"
        sortingMode="server"
        filterMode="server"
        onPaginationModelChange={handlePaginationChange}
        editMode="row"
        loading={isLoading}
        localeText={DataGridArLocaleText}
        getCellClassName={(params) =>
          Number(params.id) % 2 === 0 ? "--grey-cell" : ""
        }
        // selection
        checkboxSelection
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={(
          newRowSelectionModel: GridRowSelectionModel
          // details: GridCallbackDetails
        ) => setRowSelectionModel(newRowSelectionModel)}
        slots={{
          toolbar: () => CustomToolbar({ setIsPrintMode }),
          noRowsOverlay: NoRowsOverlay,
          noResultsOverlay: NoRowsOverlay,
          cell: CellWithTracer,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: false,
          },
          filterPanel: {
            filterFormProps: {
              logicOperatorInputProps: {
                variant: "outlined",
                size: "small",
              },
              columnInputProps: {
                variant: "outlined",
                size: "small",
                sx: { mt: "auto" },
              },
              operatorInputProps: {
                variant: "outlined",
                size: "small",
                sx: { mt: "auto" },
              },
              valueInputProps: {
                InputComponentProps: {
                  variant: "outlined",
                  size: "small",
                },
              },
            },
          },
        }}
      />
    </Box>
  );
}
