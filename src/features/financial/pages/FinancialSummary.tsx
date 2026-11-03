import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GridActionsCellItem,
  GridCellParams,
  GridColDef,
  GridListColDef,
  GridRenderCellParams,
  GridRowParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid-premium";

import { ApiUrls, DataGridArLocaleText, DEFAULT_PAGE_SIZE_OPTIONS } from "@/common/constants";
import { float, pulse } from "@/common/animations";

import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import PaidIcon from "@mui/icons-material/Paid";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import EventIcon from "@mui/icons-material/Event";

import {
  CellWithTracer,
  CustomToolbar,
  NoRowsOverlay,
} from "@/components/grid/CustomGridComponents";
import { ToggleableFiltersMenu } from "@/components/crud/FiltersMenu";
import { StyledDataGrid } from "@/components/grid/StyledDataGrid";
import { InvoiceSummaryBar } from "@/components/ui/InvoiceSummaryBar";

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useGrid } from "@/hooks/useGrid";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/useToast";

import { fetchAll } from "@/services/api/entities.api";

import Order, { FinancialStatus } from "@/entities/Order";
import {
  FetchFinancialStatusesResponse,
  FetchOrdersResponse,
} from "@/types/dtos/Order.dto";
import { PaginatedResult } from "@/types";
import { FetchCustomersResponse } from "@/types/dtos/User.dto";

import { ROUTES } from "@/app/routes/routesConfig";
import { Option, toOptions } from "@/utils";
import { PrintSummary } from "@/components/ui/PrintSummary";
import { QueryErrorAlert } from "@/components/ui/QueryErrorAlert";

const GRID_CONTAINER_HEIGHT = 1000;
const GRID_CONTAINER_MIN_HEIGHT = 900;
const OVERLAY_HEIGHT = 300;
const LIST_VIEW_ROW_HEIGHT = 64;
const DEFAULT_ROW_HEIGHT = 52;
const ROW_BUFFER_PIXELS = 1000;
const COLUMN_BUFFER_PIXELS = 1000;

interface CollectType {
  selectedOrderIds: Order["id"][];
}

export function FinancialSummary() {
  const [searchParams] = useSearchParams();
  const billOfLadings = searchParams.getAll("billOfLading");

  const axiosPrivate = useAxiosPrivate();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);
  const [isPrintMode, setIsPrintMode] = useState(false);

  const {
    items,
    isLoading,
    isError: ordersError,
    refetch: refetchOrders,
    totalRowCount,
    paginationModel,
    handlePaginationChange,
    handleFilterChange,
  } = useGrid<FetchOrdersResponse>(
    axiosPrivate,
    ApiUrls.fetchAllOrders,
    "orders",
    fetchAll
  );
  const isListView = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const rowHeight = isListView ? LIST_VIEW_ROW_HEIGHT : DEFAULT_ROW_HEIGHT;

  const {
    data: financialStatuses,
    isError: financialStatusesError,
    refetch: refetchFinancialStatuses,
  }: UseQueryResult<PaginatedResult<FetchFinancialStatusesResponse>> = useQuery(
    {
      queryKey: ["financialStatuses"],
      queryFn: () =>
        fetchAll<FetchFinancialStatusesResponse>(
          axiosPrivate,
          ApiUrls.fetchAllFinancialStatuses
        ),
    }
  );
  const {
    data: customers,
    isError: customersError,
    refetch: refetchCustomers,
  }: UseQueryResult<PaginatedResult<FetchCustomersResponse>> = useQuery({
    queryKey: ["customers"],
    queryFn: () =>
      fetchAll<FetchCustomersResponse>(
        axiosPrivate,
        ApiUrls.fetchAllCustomerNames
      ),
  });

  // bill of ladings params filter
  useEffect(() => {
    if (billOfLadings.length > 0) {
      handleFilterChange({
        filters: [
          {
            field: "billOfLadings",
            value: billOfLadings,
          },
        ],
      });
    }
    // only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const financialStatusesOptions: Option<number>[] = toOptions(
    financialStatuses?.data ?? [],
    "name",
    "id"
  );
  const customersOptions: Option<string>[] = toOptions(
    customers?.data ?? [],
    "name",
    "id"
  );

  const collectMutation = useMutation({
    mutationFn: async ({ selectedOrderIds }: CollectType) => {
      return await axiosPrivate.put(ApiUrls.collectOrders, {
        orderIds: selectedOrderIds,
      });
    },
    onSuccess: () => {
      setRowSelectionModel([]);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showToast("تم تحصيل الاوردرات بنجاح", { type: "success" });
    },
    onError: () =>
      showToast(
        "تعذر تحصيل الشحنات. تم الاحتفاظ بالتحديد لتتمكن من المحاولة مرة أخرى.",
        { type: "error" }
      ),
  });

  const invoiceDetails = useMemo(() => {
    const selectedCollectableOrders = items
      .filter((item) => rowSelectionModel.includes(item.id))
      .filter((order) => order.financialStatus === FinancialStatus.Collectable);

    const totals = selectedCollectableOrders.reduce(
      (acc, order) => ({
        totalCOD: acc.totalCOD + (order.codAmount || 0),
        totalShipping: acc.totalShipping + (order.shippingCost || 0),
        totalReceived: acc.totalReceived + (order.netAmount || 0),
        selectedCount: selectedCollectableOrders.length,
      }),
      { totalCOD: 0, totalShipping: 0, totalReceived: 0, selectedCount: 0 }
    );
    return {
      ...totals,
      selectedOrderIds: selectedCollectableOrders.map((order) => order.id),
    };
  }, [items, rowSelectionModel]);

  const handleGridPaginationChange = useCallback(
    (model: typeof paginationModel) => {
      setRowSelectionModel([]);
      handlePaginationChange(model);
    },
    [handlePaginationChange]
  );

  const handleGridFilterChange = useCallback(
    (model: Parameters<typeof handleFilterChange>[0]) => {
      setRowSelectionModel([]);
      handleFilterChange(model);
    },
    [handleFilterChange]
  );

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
 
  const gridColDef: GridColDef<FetchOrdersResponse>[] = [
    {
      field: "financialStatus",
      headerName: "حالة التقفيل",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          sx={{
            fontWeight: 700,
            backgroundColor:
              params.value === FinancialStatus.Collected
                ? theme.palette.success.light // collected
                : params.value === FinancialStatus.Collectable
                  ? theme.palette.warning.light // collectable
                  : theme.palette.error.light, // not collected
            color:
              params.value === FinancialStatus.Collected
                ? theme.palette.success.contrastText
                : theme.palette.error.contrastText,
            boxShadow: theme.shadows[1],
            animation: `${params.value === FinancialStatus.Collected ? pulse : float} 2s infinite`,
          }}
        />
      ),
    },
    {
      field: "billOfLading",
      headerName: "رقم البوليصه",
      flex: 1,
      renderCell: (params: GridRenderCellParams<FetchOrdersResponse>) => (
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
      field: "createdAt",
      headerName: "التاريخ",
      type: "date",
      flex: 1,
      valueGetter: (params: FetchOrdersResponse["createdAt"]) =>
        params ? new Date(params) : null,
      valueFormatter: (params: FetchOrdersResponse["createdAt"]) => {
        return params ? new Date(params).toLocaleDateString() : "";
      },
    },
    {
      field: "codAmount",
      headerName: "مبلغ التحصيل ",
      type: "number",
      flex: 1,
      align: "left",
      headerAlign: "left",
      valueFormatter: (params: FetchOrdersResponse["codAmount"]) => {
        return params != null ? params.toFixed(2) : "";
      },
    },
    {
      field: "shippingCost",
      headerName: "قيمة الشحن",
      type: "number",
      flex: 1,
      align: "left",
      headerAlign: "left",
      valueFormatter: (params: FetchOrdersResponse["shippingCost"]) => {
        return params != null ? params.toFixed(2) : "";
      },
    },
    {
      field: "senderName",
      headerName: "اسم الراسل",
      flex: 1,
    },
    {
      field: "receiverName",
      headerName: "اسم المستلم",
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
    {
      field: "actions",
      type: "actions",
      headerName: "الإجراءات",
      flex: 1,
      getActions: (params: GridRowParams) => [
        <Tooltip key="collect-tooltip" title={isCollectable(params.row.id) ? "تحصيل الاوردر" : "غير قابل للتحصيل"}>
          <span>
            <GridActionsCellItem
              key="collect"
              onClick={() => handleCollectClick(params.row.id as Order["id"])}
              disabled={!isCollectable(params.row.id)}
              icon={<PriceCheckIcon />}
              label="تحصيل"
              sx={{
                color: "gold",
                backgroundColor: theme.palette.action.active,
                "&.Mui-disabled": {
                  color: "text.disabled",
                },
                "&:hover": {
                  color: theme.palette.text.primary,
                  backgroundColor: "rgb(92 199 68 / 20%)",
                },
              }}
            />
          </span>
        </Tooltip>,
      ],
    },
  ];

  const handleCollectClick = (orderId: Order["id"]) => {
    collectMutation.mutate({ selectedOrderIds: [orderId] });
  };

  const isCollectable = (orderId: Order["id"]): boolean => {
    // Find the order by its id
    const order = items.find((o) => o.id === orderId);
    if (!order) return false;

    return order.financialStatus === FinancialStatus.Collectable;
  };

  const CollectAction = function ({ orderId }: { orderId: Order["id"] }) {
    const isCollecting = collectMutation.isPending;

    return (
      <IconButton
        aria-label="Collect"
        onClick={() => handleCollectClick(orderId)}
        disabled={collectMutation.isPending || !isCollectable(orderId)}
        sx={{
          color: "error.main",
          backgroundColor: theme.palette.action.active,
          "&:hover": {
            backgroundColor: "rgba(255, 82, 82, 0.08)",
            transform: "scale(1.1)",
          },
          transition: "all 0.2s ease",
          position: "relative",
        }}
      >
        {isCollecting ? (
          <CircularProgress size={20} sx={{ color: "inherit" }} />
        ) : (
          <PriceCheckIcon fontSize="small" />
        )}
      </IconButton>
    );
  };

  const ListViewCell = function (
    props: GridRenderCellParams<FetchOrdersResponse>
  ) {
    const { row } = props;
    const theme = useTheme();
    const isCollected = row.financialStatus === FinancialStatus.Collected;
    const isCollectable = row.financialStatus === FinancialStatus.Collectable;

    const cellContent = useMemo(
      () => (
        <Stack
          width="100%"
          direction="row"
          alignItems="center"
          // spacing={1}
          sx={{
            position: "relative",
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            opacity: isCollected ? 0.85 : 1,
            overflow: "hidden",
          }}
        >
          {/* Status Ribbon */}
          <Chip
            label={row.financialStatus}
            sx={{
              background: isCollected
                ? theme.palette.success.main
                : isCollectable
                  ? theme.palette.warning.main
                  : theme.palette.error.main,
              color: "#fff",
              fontWeight: "bold",
            }}
          />

          {/* Main Content */}
          <Stack sx={{ flexGrow: 1, pl: 2 }} spacing={0.5}>
            {/* Title Row */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant={"subtitle2"} fontWeight="bold">
                {row.senderName}
              </Typography>
              <Typography
                variant={"caption"}
                fontWeight="bold"
                color={theme.palette.primary.main}
              >
                {row.serviceType}
              </Typography>
            </Stack>

            {/* Details Row */}
            <Stack direction="row" spacing={1}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <AssignmentIcon fontSize={"small"} color="action" />
                <Typography variant="body2" color="text.secondary">
                  {row.billOfLading}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <EventIcon fontSize={"small"} color="action" />
                <Typography variant="body2" color="text.secondary">
                  {row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString()
                    : ""}
                </Typography>
              </Stack>
            </Stack>

            {/* Financials Row */}
            <Stack direction="row" spacing={1}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <PaidIcon fontSize={"small"} color="action" />
                <Typography variant="body2" fontWeight="medium">
                  {row.codAmount?.toFixed(2)} جنيه
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <LocalShippingIcon fontSize={"small"} color="action" />
                <Typography variant="body2" fontWeight="medium">
                  {row.shippingCost?.toFixed(2)} جنيه
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {/* Actions */}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ pr: 1 }}
          >
            <CollectAction orderId={row.id} />
          </Stack>
        </Stack>
      ),
      [row, theme, isCollected, isCollectable]
    );

    return cellContent;
  };

  const listColDef: GridListColDef = {
    field: "listColumn",
    renderCell: (params) => <ListViewCell {...params} />,
  };

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
      sx={(theme) => ({
        height: GRID_CONTAINER_HEIGHT,
        maxHeight: "90vh",
        minHeight: GRID_CONTAINER_MIN_HEIGHT,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(3),
        p: isMobile ? 0 : theme.spacing(1),
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
      {(ordersError || financialStatusesError || customersError) && (
        <QueryErrorAlert
          onRetry={() =>
            Promise.all([
              refetchOrders(),
              refetchFinancialStatuses(),
              refetchCustomers(),
            ])
          }
        />
      )}

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
          التقفيل و التحصيل
        </Typography>
      </Box>

      {/* Invoice Details (for Closing/Collecting) Section */}
      {invoiceDetails.selectedCount > 0 && (
        <InvoiceSummaryBar
          invoiceDetails={invoiceDetails}
          loading={collectMutation.isPending}
          onCollect={() =>
            collectMutation.mutate({
              selectedOrderIds: invoiceDetails.selectedOrderIds,
            })
          }
          rowCount={invoiceDetails.selectedCount}
        />
      )}

      {/* Filters Section */}
      <ToggleableFiltersMenu<Partial<FetchOrdersResponse>>
        fields={[
          {
            name: "billOfLadings",
            label: "رقم البوليصه",
            type: "string",
            defaultValue: billOfLadings,
            fieldElement: (value: string[], onChange) => {
              // ensure it is array
              const valuesArray = Array.isArray(value) ? value : [];

              return (
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={valuesArray}
                  onChange={(_, newValues) => {
                    // newValues is string[]
                    onChange(newValues);
                  }}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, idx) => {
                      const { key: _ignore, ...chipProps } = getTagProps({
                        index: idx,
                      });
                      return (
                        <Chip
                          key={`${option}-${idx}`}
                          label={option}
                          {...chipProps}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="رقم البوليصه"
                      placeholder="اضغط Enter بعد كل رقم"
                      size="small"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                  sx={{
                    maxHeight: "100%",
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
                    customersOptions.find((option) => option.value === value) ??
                    null
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
                      size="small"
                      fullWidth
                    />
                  )}
                />
              );
            },
          },
          {
            name: "financialStatus",
            label: "حالة التقفيل",
            fieldElement: (value, onChange) => (
              <TextField
                select
                label="حالة التقفيل"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="" disabled>
                  اختر الفرع
                </MenuItem>
                {financialStatusesOptions.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
                {financialStatusesOptions.length <= 0 && (
                  <MenuItem disabled>جاري تحميل الحالات...</MenuItem>
                )}
              </TextField>
            ),
          },
        ]}
        onFiltersChange={handleGridFilterChange}
      />

      <Box className="print-table-container">
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
          // isRowSelectable={(params: GridRowParams) =>
          //   params.row.financialStatus === FinancialStatus.Collectable
          // }
          onRowSelectionModelChange={(
            newRowSelectionModel: GridRowSelectionModel
            //   details: GridCallbackDetails
          ) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          rowSelectionModel={rowSelectionModel}
          sx={(theme) => ({
            backgroundColor: theme.palette.background.default,
            boxShadow: 2,
            border: 2,
            borderColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[700]
                : theme.palette.grey[200],
            "& .MuiDataGrid-cell.--success": !isMobile
              ? {
                  backgroundColor: "#71ca76",
                }
              : undefined,
            "& .MuiDataGrid-cell.--warning": !isMobile
              ? {
                  backgroundColor: "#aaab40",
                }
              : undefined,
            "& .MuiDataGrid-cell.--danger": !isMobile
              ? {
                  backgroundColor: "#ff6b6b",
                }
              : undefined,
            "& .MuiDataGrid-cell:last-child": {
              borderRight: "none",
            },

            "--DataGrid-overlayHeight": `${OVERLAY_HEIGHT}px`,
          })}
          columnVisibilityModel={{
            actions: !isPrintMode,
          }}
          rowHeight={rowHeight}
          unstable_listView={isListView}
          unstable_listColumn={listColDef}
          initialState={{
            pagination: {
              paginationModel: paginationModel,
            },
            pinnedColumns: undefined,
          }}
          pagination
          rowCount={totalRowCount}
          pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
          checkboxSelection
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
          // disableVirtualization
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
          paginationModel={paginationModel}
          paginationMode="server"
          sortingMode="server"
          filterMode="server"
          onPaginationModelChange={handleGridPaginationChange}
          editMode="row"
          loading={isLoading}
          localeText={DataGridArLocaleText}
          getCellClassName={(params: GridCellParams<FetchOrdersResponse>) =>
            params.row.financialStatus === FinancialStatus.Collected
              ? "--success"
              : params.row.financialStatus === FinancialStatus.Collectable
                ? "--warning"
                : "--danger"
          }
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
    </Box>
  );
}
