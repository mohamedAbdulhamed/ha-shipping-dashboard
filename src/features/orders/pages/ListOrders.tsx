import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  alpha,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  GRID_AGGREGATION_FUNCTIONS,
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GridActionsCellItem,
  GridAggregationFunction,
  GridColDef,
  GridListColDef,
  GridRenderCellParams,
  GridRowParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid-premium";

import { ApiUrls, DataGridArLocaleText, DEFAULT_PAGE_SIZE_OPTIONS } from "@/common/constants";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

import {
  CellWithTracer,
  CustomToolbarForBill,
  NoRowsOverlay,
} from "@/components/grid/CustomGridComponents";
import {
  FilterField,
  ToggleableFiltersMenu,
} from "@/components/crud/FiltersMenu";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGrid } from "@/hooks/useGrid";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/useToast";

import { deleteEntity, fetchAll } from "@/services/api/entities.api";
import { ROUTES } from "@/app/routes/routesConfig";

import { FetchOrdersResponse } from "@/types/dtos/Order.dto";
import { ROLES } from "@/types";
import Order from "@/entities/Order";
import { StyledDataGrid } from "@/components/grid/StyledDataGrid";
import { QueryErrorAlert } from "@/components/ui/QueryErrorAlert";
import { hasAnyRole, hasRole, toOptions } from "@/utils";
import { useAuthStore } from "@/store";
import Barcode from "react-barcode";
import {
  useCustomers,
  useFinancialStatuses,
  useShipmentStatuses,
} from "@/hooks/useDataHooks";
import { GRID_DIMENSIONS, GRID_LAYOUT } from "@/common/grid.constants";

export function ListOrders() {
  const [searchParams] = useSearchParams();
  const billOfLadings = searchParams.getAll("billOfLading");

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const { customers, isLoading: loadingCustomers } = useCustomers();
  const { financialStatuses, isLoading: loadingFinancialStatuses } =
    useFinancialStatuses();
  const { shipmentStatuses, isLoading: loadingShipmentStatuses } =
    useShipmentStatuses();

  const [selectedOrderId, setSelectedOrderId] = useState<Order["id"] | null>(
    null
  );
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);
  const [isPrintMode, setIsPrintMode] = useState(false);

  const {
    items,
    isLoading,
    isFetching,
    isError,
    refetch,
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
  const rowHeight = isListView
    ? GRID_LAYOUT.ListViewRowHeight
    : GRID_LAYOUT.DefaultRowHeight;

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

  const customersOptions = useMemo(
    () => toOptions(customers || [], "name", "id"),
    [customers]
  );
  const shipmentStatusesOptions = useMemo(
    () => toOptions(shipmentStatuses || [], "name", "id"),
    [shipmentStatuses]
  );
  const financialStatusesOptions = useMemo(
    () => toOptions(financialStatuses || [], "name", "id"),
    [financialStatuses]
  );

  const deleteMutation = useMutation({
    mutationFn: async (orderId: Order["id"]) => {
      await deleteEntity(orderId, axiosPrivate, ApiUrls.deleteOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showToast("تم حذف الشحنة بنجاح", { type: "success" });
    },
    onError: () => {
      showToast("حدث خطأ أثناء الحذف", { type: "error" });
    },
    onSettled: () => {
      setOpenDeleteDialog(false);
      setSelectedOrderId(null);
    },
  });

  // Delete handlers
  const handleDeleteClick = useCallback((orderId: Order["id"]) => {
    setSelectedOrderId(orderId);
    setOpenDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (selectedOrderId) {
      deleteMutation.mutate(selectedOrderId);
    }
  }, [selectedOrderId, deleteMutation]);

  const handleDeleteCancel = useCallback(() => {
    setOpenDeleteDialog(false);
    setSelectedOrderId(null);
  }, []);

  const gridColDef: GridColDef<FetchOrdersResponse>[] = [
    {
      field: "billOfLading",
      headerName: "رقم البوليصه",
      flex: isPrintMode ? undefined : 1,
      width: isPrintMode ? 200 : undefined,
      renderCell: (params: GridRenderCellParams<FetchOrdersResponse>) => (
        <Stack
          direction="column"
          alignItems="center"
          gap={1}
          sx={{ width: "100%" }}
        >
          {isPrintMode && (
            <Barcode
              value={params.value}
              width={1}
              height={30}
              margin={0}
              displayValue={false}
              format="CODE128"
            />
          )}
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
        </Stack>
      ),
    },
    {
      field: "createdAt",
      headerName: "التاريخ",
      type: "date",
      flex: 0.75,
      disableExport: true,
      valueGetter: (params: FetchOrdersResponse["createdAt"]) =>
        params ? new Date(params) : null,
      valueFormatter: (params: FetchOrdersResponse["createdAt"]) => {
        return params ? new Date(params).toLocaleDateString() : "";
      },
      renderCell: (params: GridRenderCellParams<FetchOrdersResponse>) => {
        return (
          <Typography color="textDisabled">
            {params.row.createdAt
              ? new Date(params.row.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : ""}
          </Typography>
        );
      },
    },
    {
      field: "codAmount",
      headerName: "التحصيل",
      type: "number",

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
      flex: 0.5,
      align: "left",
      headerAlign: "left",
      disableExport: true,
      valueFormatter: (params: FetchOrdersResponse["shippingCost"]) => {
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
      headerName: "المرسل إليه",
      flex: isPrintMode ? 2 : 1,
    },
    {
      field: "serviceType",
      headerName: "نوع الخدمة",
      flex: 1,
      disableExport: true,
    },
    {
      field: "orderSerialNumber",
      headerName: "الرقم التسلسلي",
      disableExport: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "الإجراءات",
      flex: 1,
      getActions: (params: GridRowParams) => {
        if (params.id === "auto-generated-group-footer-root" || isPrintMode) {
          return [];
        }

        const actions = [];

        if (hasAnyRole(user, [ROLES.ADMIN, ROLES.OPERATION])) {
          actions.push(
            <GridActionsCellItem
              key="edit"
              onClick={() =>
                navigate(ROUTES.ORDERS.GET_EDIT_URL_BY_ID(params.row.id))
              }
              icon={<EditIcon />}
              label="تعديل"
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(33, 150, 243, 0.08)",
                },
              }}
            />
          );
        }

        if (hasRole(user, ROLES.ADMIN)) {
          actions.push(
            <GridActionsCellItem
              key="delete"
              onClick={() => handleDeleteClick(params.row.id)}
              icon={
                deleteMutation.isPending &&
                params.row.id === selectedOrderId ? (
                  <CircularProgress size={24} sx={{ color: "error.main" }} />
                ) : (
                  <DeleteIcon />
                )
              }
              label="حذف"
              sx={{
                color: "error.main",
                "&:hover": {
                  backgroundColor: "rgba(255, 82, 82, 0.08)",
                },
              }}
            />
          );
        }

        actions.push(
          <GridActionsCellItem
            key="view"
            onClick={() =>
              navigate(ROUTES.ORDERS.GET_VIEW_URL_BY_ID(params.row.id))
            }
            icon={<VisibilityIcon />}
            label="عرض التفاصيل"
            sx={{
              "&:hover": {
                backgroundColor: "rgba(76, 175, 80, 0.08)",
              },
            }}
          />
        );

        return actions;
      },
    },
  ];

  const DeleteConfirmationDialog = (
    <Dialog
      open={openDeleteDialog}
      onClose={handleDeleteCancel}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            padding: 2,
            minWidth: "400px",
            background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
            boxShadow: 24,
          },
        },
      }}
    >
      <DialogTitle
        sx={{ textAlign: "right", fontWeight: "bold", color: "error.main" }}
      >
        <DeleteIcon sx={{ verticalAlign: "middle", mr: 1 }} />
        تأكيد الحذف
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ textAlign: "right", fontSize: "1.1rem" }}>
          هل أنت متأكد من رغبتك في حذف هذه الشحنة؟
          <br />
          <span style={{ color: theme.palette.error.main, fontWeight: 500 }}>
            لا يمكن التراجع عن هذا الإجراء!
          </span>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", padding: 2 }}>
        <Button
          onClick={handleDeleteCancel}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          إلغاء
        </Button>
        <Button
          onClick={handleDeleteConfirm}
          color="error"
          variant="contained"
          disabled={deleteMutation.isPending}
          sx={{
            borderRadius: 2,
            px: 3,
            background: "linear-gradient(45deg, #ff5252 30%, #ff867f 90%)",
            "&:hover": {
              background: "linear-gradient(45deg, #ff1744 30%, #ff616f 90%)",
              boxShadow: theme.shadows[3],
            },
            "&:disabled": {
              background: "linear-gradient(45deg, #ffcdd2 30%, #ffebee 90%)",
            },
          }}
        >
          {deleteMutation.isPending ? (
            <CircularProgress size={24} sx={{ color: "inherit" }} />
          ) : (
            "تأكيد الحذف"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const EditAction = function ({ orderId }: { orderId: Order["id"] }) {
    return (
      <IconButton
        aria-label="Edit"
        onClick={() => navigate(ROUTES.ORDERS.GET_EDIT_URL_BY_ID(orderId))}
        sx={{
          color: "primary.main",
          "&:hover": {
            backgroundColor: "rgba(33, 150, 243, 0.08)",
            transform: "scale(1.1)",
          },
          transition: "all 0.2s ease",
        }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    );
  };

  const DeleteAction = function ({ orderId }: { orderId: Order["id"] }) {
    const isDeleting = deleteMutation.isPending && orderId === selectedOrderId;

    return (
      <IconButton
        aria-label="Delete"
        onClick={() => handleDeleteClick(orderId)}
        disabled={deleteMutation.isPending}
        sx={{
          color: "error.main",
          "&:hover": {
            backgroundColor: "rgba(255, 82, 82, 0.08)",
            transform: "scale(1.1)",
          },
          transition: "all 0.2s ease",
          position: "relative",
        }}
      >
        {isDeleting ? (
          <CircularProgress size={20} sx={{ color: "inherit" }} />
        ) : (
          <DeleteIcon fontSize="small" />
        )}
      </IconButton>
    );
  };

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
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: theme.palette.primary.main,
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          {row.orderSerialNumber?.slice(0, 2) || "??"}
        </Avatar>

        <Stack sx={{ flexGrow: 1, gap: 0.5 }}>
          <Typography variant="body2" fontWeight="bold">
            {row.receiverName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.billOfLading}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(row.createdAt).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
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
          {hasAnyRole(user, [ROLES.ADMIN, ROLES.OPERATION]) && (
            <EditAction orderId={row.id} />
          )}
          {hasRole(user, ROLES.ADMIN) && <DeleteAction orderId={row.id} />}
        </Stack>
      </Stack>
    );
  };

  const listColDef: GridListColDef = {
    field: "listColumn",
    renderCell: (params) => <ListViewCell {...params} />,
  };

  // تاريخ الطباعة
  const currentDate: GridAggregationFunction<string, string | null> = {
    apply: () =>
      isPrintMode
        ? new Date().toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
        : null,
    label: "",
    valueFormatter: () =>
      isPrintMode
        ? new Date().toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : null,
    columnTypes: ["string"],
  };

  // عدد الشحنات
  const totalCount: GridAggregationFunction<string, string | null> = {
    apply: () => (isPrintMode ? `عدد الشحنات: ${items.length}` : null),
    label: "",
    valueFormatter: () => (isPrintMode ? `عدد الشحنات: ${items.length}` : null),
    columnTypes: ["string"],
  };

  return (
    <Box
      sx={(theme) => ({
        height: GRID_DIMENSIONS.FullPage.Height,
        maxHeight: "90vh",
        minHeight: GRID_DIMENSIONS.FullPage.MinHeight,
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
      {DeleteConfirmationDialog}

      {isError && <QueryErrorAlert onRetry={refetch} />}

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
          إدارة الشحنات
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(ROUTES.ORDERS.NEW.url)}
          sx={{
            px: 4,
            borderRadius: 2,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: theme.shadows[4],
            },
          }}
        >
          + إنشاء شحنة جديدة
        </Button>
      </Box>

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
          ...(hasAnyRole(user, [ROLES.ADMIN, ROLES.OPERATION])
            ? [
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
                          const customer = customers?.find(
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
                } as FilterField<Partial<FetchOrdersResponse>>,
              ]
            : []),
          {
            name: "shipmentStatus",
            label: "حاله الشحنة",
            fieldElement: (value, onChange) => (
              <TextField
                select
                label="حاله الشحنة"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="" disabled>
                  اختر الحالة
                </MenuItem>
                {shipmentStatusesOptions.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            ),
          },
          { name: "phoneNumber", label: "رقم الهاتف", type: "string" },
          {
            name: "orderSerialNumber",
            label: "رقم الطلب التسلسلي",
            type: "string",
          },
          {
            name: "financialStatus",
            label: "حالة التقفيل المالي",
            type: "string",
            fieldElement: (value, onChange) => (
              <TextField
                select
                label="حالة التقفيل المالي"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="" disabled>
                  اختر الحالة
                </MenuItem>
                {financialStatusesOptions.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            ),
          },
        ]}
        onFiltersChange={handleFilterChange}
        isLoading={
          loadingCustomers ||
          loadingFinancialStatuses ||
          loadingShipmentStatuses
        }
      />

      <StyledDataGrid
        rows={items}
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

          "--DataGrid-overlayHeight": `${GRID_LAYOUT.OverlayHeight}px`,
        })}
        rowHeight={rowHeight}
        unstable_listView={isListView}
        unstable_listColumn={listColDef}
        initialState={{
          pagination: {
            paginationModel: paginationModel,
          },
          pinnedColumns: undefined,
          aggregation: {
            model: {
              codAmount: "sum",
              shippingCost: "sum",
              senderName: "totalCount",
              receiverName: "printCurrentDate",
            },
          },
        }}
        aggregationFunctions={{
          ...GRID_AGGREGATION_FUNCTIONS,
          printCurrentDate: currentDate,
          totalCount: totalCount,
        }}
        pagination
        rowCount={totalRowCount}
        pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
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
        disableVirtualization
        rowBufferPx={GRID_LAYOUT.RowBufferPixels}
        columnBufferPx={GRID_LAYOUT.ColumnBufferPixels}
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
        onPaginationModelChange={handlePaginationChange}
        editMode="row"
        loading={isLoading}
        localeText={DataGridArLocaleText}
        getRowClassName={(params) =>
          Number(params.id) % 2 === 0 ? "--even-cell" : ""
        }
        // selection
        checkboxSelection
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={(
          newRowSelectionModel: GridRowSelectionModel
          // details: GridCallbackDetails
        ) => setRowSelectionModel(newRowSelectionModel)}
        slots={{
          toolbar: () =>
            CustomToolbarForBill({
              items,
              setIsPrintMode,
              onRefresh: refetch,
              isFetching,
            }),
          noRowsOverlay: NoRowsOverlay,
          noResultsOverlay: NoRowsOverlay,
          cell: CellWithTracer,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: false,
            printOptions: {
              hideFooter: true,
              hideToolbar: true,
              disableToolbarButton: true,
            },
          },
        }}
      />
    </Box>
  );
}
