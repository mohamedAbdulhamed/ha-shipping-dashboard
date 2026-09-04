import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  alpha,
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
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GridActionsCellItem,
  GridColDef,
  GridListColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid-premium";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CircleIcon from "@mui/icons-material/FiberManualRecord";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useGrid } from "@/hooks/useGrid";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/useToast";

import { ApiUrls, DataGridArLocaleText, DEFAULT_PAGE_SIZE_OPTIONS } from "@/common/constants";

import {
  CellWithTracer,
  CustomToolbar,
  NoRowsOverlay,
} from "@/components/grid/CustomGridComponents";
import { ToggleableFiltersMenu } from "@/components/crud/FiltersMenu";

import {
  deleteEntity,
  fetchAll,
  toggleEntityStatus,
} from "@/services/api/entities.api";
import { FetchRolesResponse, FetchUsersResponse } from "@/types/dtos/User.dto";
import { PaginatedResult } from "@/types";
import { ROUTES } from "@/app/routes/routesConfig";
import User from "@/entities/User";
import { FetchBranchesResponse } from "@/types/dtos/Branch.dto";
import { useAuthStore } from "@/store";
import { StyledDataGrid } from "@/components/grid/StyledDataGrid";
import { tokens } from "@/app/theme";
import { toOptions } from "@/utils";
import { useBranches } from "@/hooks/useDataHooks";

const GRID_CONTAINER_HEIGHT = 1000;
const GRID_CONTAINER_MIN_HEIGHT = 900;
const OVERLAY_HEIGHT = 300;
const LIST_VIEW_ROW_HEIGHT = 64;
const DEFAULT_ROW_HEIGHT = 52;
const ROW_BUFFER_PIXELS = 1000;
const COLUMN_BUFFER_PIXELS = 1000;

export function ListUsers() {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const { branches, isLoading: loadingBranches } = useBranches();

  const [selectedUserId, setSelectedUserId] = useState<User["id"] | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const {
    items,
    isLoading,
    totalRowCount,
    paginationModel,
    handlePaginationChange,
    handleFilterChange,
  } = useGrid<FetchUsersResponse>(
    axiosPrivate,
    ApiUrls.fetchAllUsers,
    "users",
    fetchAll
  );
  const isListView = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const rowHeight = isListView ? LIST_VIEW_ROW_HEIGHT : DEFAULT_ROW_HEIGHT;
  const {
    data: roles,
    isLoading: isLoadingRoles,
  }: UseQueryResult<PaginatedResult<FetchRolesResponse>> = useQuery({
    queryKey: ["roles"],
    queryFn: () =>
      fetchAll<FetchRolesResponse>(axiosPrivate, ApiUrls.fetchAllRoles),
  });
  const branchOptions = useMemo(
    () => toOptions(branches || [], "name", "id"),
    [branches]
  );

  const toggleActiveMutation = useMutation({
    mutationFn: async (userId: User["id"]) =>
      toggleEntityStatus(userId, axiosPrivate, ApiUrls.toggleUserActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("تم تحديث حالة المستخدم بنجاح", { type: "success" });
    },
    onError: () => {
      showToast("حدث خطأ أثناء تحديث الحالة", { type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: User["id"]) => {
      await deleteEntity(userId, axiosPrivate, ApiUrls.deleteUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("تم حذف المستخدم بنجاح", { type: "success" });
    },
    onError: () => {
      showToast("حدث خطأ أثناء الحذف", { type: "error" });
    },
    onSettled: () => {
      setOpenDeleteDialog(false);
      setSelectedUserId(null);
    },
  });

  // Delete handlers
  const handleDeleteClick = useCallback((userId: User["id"]) => {
    setSelectedUserId(userId);
    setOpenDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (selectedUserId) {
      deleteMutation.mutate(selectedUserId);
    }
  }, [selectedUserId, deleteMutation]);

  const handleDeleteCancel = useCallback(() => {
    setOpenDeleteDialog(false);
    setSelectedUserId(null);
  }, []);

  const handleToggleActive = useCallback(
    (userId: User["id"]) => {
      toggleActiveMutation.mutate(userId);
    },
    [toggleActiveMutation]
  );

  const isCurrentUser = useCallback(
    (phoneNumber: User["phoneNumber"]) => phoneNumber === user?.phoneNumber,
    [user]
  );

  const gridColDef: GridColDef<FetchUsersResponse>[] = [
    {
      field: "fullName",
      headerName: "الاسم الكامل",
      flex: 2,
      renderCell: (params) => (
        <Typography fontWeight="600" color="primary.main">
          {params.value}{" "}
          {isCurrentUser(params.row.phoneNumber) && (
            <span style={{ fontWeight: "bold", color: colors.blueAccent[500] }}>{"(أنت)"}</span>
          )}
        </Typography>
      ),
    },
    {
      field: "membershipCode",
      headerName: "كود العضوية",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          sx={{
            color: (theme) => theme.palette.primary.main,
            backgroundColor: (theme) => theme.palette.grey[200],
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: "phoneNumber",
      headerName: "رقم الهاتف",
      flex: 1,
    },
    {
      field: "isActive",
      headerName: "الحالة",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: params.value ? "success.main" : "error.main",
          }}
        >
          <CircleIcon
            fontSize="small"
            color={params.value ? "success" : "error"}
          />
          <Typography>{params.value ? "نشط" : "غير نشط"}</Typography>
        </Box>
      ),
    },
    {
      field: "role",
      headerName: "الدور",
      flex: 1,
    },
    {
      field: "branchId",
      headerName: "الفرع",
      flex: 1,
      valueFormatter: (params) => {
        return (
          branches?.find((b) => b.id === params)?.name || "غير معروف"
        );
      },
    },
    {
      field: "createdAt",
      headerName: "تاريخ الإنشاء",
      flex: 1,
      type: "date",
      valueGetter: (params: FetchBranchesResponse["createdAt"]) =>
        params ? new Date(params) : null,
      valueFormatter: (params) => new Date(params).toLocaleDateString("ar-EG"),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "الإجراءات",
      flex: 2,
      getActions: (params) =>
        !isCurrentUser(params.row.phoneNumber)
          ? [
              <GridActionsCellItem
                key="edit"
                icon={<EditIcon />}
                label="تعديل"
                sx={{
                  color: "primary.main",
                  "&:hover": { backgroundColor: "rgba(33, 150, 243, 0.08)" },
                }}
                onClick={() =>
                  navigate(ROUTES.USERS.GET_EDIT_URL_BY_ID(params.row.id))
                }
              />,
              <GridActionsCellItem
                key="toggle-active"
                icon={
                  params.row.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />
                }
                label={params.row.isActive ? "تعطيل" : "تفعيل"}
                sx={{
                  color: params.row.isActive
                    ? "success.main"
                    : "text.secondary",
                  "&:hover": { backgroundColor: "rgba(76, 175, 80, 0.08)" },
                }}
                onClick={() => handleToggleActive(params.row.id)}
              />,
              <GridActionsCellItem
                key="delete"
                icon={<DeleteIcon />}
                label="حذف"
                sx={{
                  color: "error.main",
                  "&:hover": { backgroundColor: "rgba(255, 82, 82, 0.08)" },
                }}
                onClick={() => handleDeleteClick(params.row.id)}
              />,
              <GridActionsCellItem
                key="view"
                icon={<VisibilityIcon />}
                label="عرض"
                sx={{
                  color: "text.secondary",
                  "&:hover": { backgroundColor: "rgba(76, 175, 80, 0.08)" },
                }}
                onClick={() =>
                  navigate(ROUTES.USERS.GET_VIEW_URL_BY_ID(params.row.id))
                }
              />,
            ]
          : [],
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
          هل أنت متأكد من رغبتك في حذف هذا المستخدم؟
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

  const EditAction = function ({ userId }: { userId: User["id"] }) {
    return (
      <IconButton
        aria-label="Edit"
        onClick={() => navigate(ROUTES.USERS.GET_EDIT_URL_BY_ID(userId))}
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

  const DeleteAction = function ({ userId }: { userId: User["id"] }) {
    const isDeleting = deleteMutation.isPending && userId === selectedUserId;

    return (
      <IconButton
        aria-label="Delete"
        onClick={() => handleDeleteClick(userId)}
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
          p: 1.5,
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
            width: 48,
            height: 48,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.common.white,
            fontSize: "1.1rem",
            fontWeight: "bold",
          }}
        >
          {row.fullName?.slice(0, 2) || "??"}
        </Avatar>

        <Stack sx={{ flexGrow: 1, gap: 0.5 }}>
          <Typography variant="subtitle1" fontWeight="600">
            {row.fullName}
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={`كود: ${row.membershipCode}`}
              size="small"
              sx={{
                bgcolor: theme.palette.grey[200],
                fontWeight: 500,
              }}
            />

            <Typography variant="caption" color="text.secondary">
              {row.phoneNumber}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: row.isActive ? "success.main" : "error.main",
              }}
            >
              <CircleIcon sx={{ fontSize: "1rem" }} />
              <Typography variant="caption">
                {row.isActive ? "نشط" : "غير نشط"}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              الدور: {row.role}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              الفرع:{" "}
              {branches?.find((b) => b.id === row.branchId)?.name ||
                "غير معروف"}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {new Date(row.createdAt).toLocaleDateString("ar-EG")}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" sx={{ gap: 1 }}>
          <IconButton
            aria-label="View"
            onClick={() => navigate(ROUTES.USERS.GET_VIEW_URL_BY_ID(row.id))}
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
          <EditAction userId={row.id} />
          <DeleteAction userId={row.id} />
        </Stack>
      </Stack>
    );
  };

  const listColDef: GridListColDef = {
    field: "listColumn",
    renderCell: (params) => <ListViewCell {...params} />,
  };

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
          إدارة المستخدمين
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(ROUTES.USERS.NEW.url)}
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
          + إنشاء مستخدم جديدة
        </Button>
      </Box>

      <ToggleableFiltersMenu<Partial<FetchUsersResponse>>
        fields={[
          { name: "fullName", label: "الاسم الكامل", type: "string" },
          { name: "phoneNumber", label: "رقم الهاتف", type: "string" },
          {
            name: "role",
            label: "الاسم الاخير",
            fieldElement: (value, onChange) => (
              <TextField
                select
                label="الدور"
                value={value ?? ""}
                onChange={(event) => onChange(event.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="" disabled>
                  اختر دور المستخدم
                </MenuItem>
                {roles?.data?.map((role) => (
                  <MenuItem key={role.id} value={role.name}>
                    {role.name}
                  </MenuItem>
                ))}
                {(roles === undefined || roles?.data === undefined) &&
                  isLoadingRoles && (
                    <MenuItem disabled>جاري تحميل الأدوار...</MenuItem>
                  )}
                {(roles === undefined || roles?.data === undefined) &&
                  !isLoadingRoles && (
                    <MenuItem disabled>لا يوجد أدوار متاحة</MenuItem>
                  )}
              </TextField>
            ),
          },
          {
            name: "branchId",
            label: "الفرع",
            fieldElement: (value, onChange) => (
              <TextField
                select
                label="الفرع"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="" disabled>
                  اختر الفرع
                </MenuItem>
                {branchOptions.map((branch) => (
                  <MenuItem key={branch.value} value={branch.value}>
                    {branch.label}
                  </MenuItem>
                ))}
                {branchOptions.length <= 0 && loadingBranches && (
                  <MenuItem disabled>جاري تحميل الفروع...</MenuItem>
                )}
                {branchOptions.length <= 0 && !loadingBranches && (
                  <MenuItem disabled>لا يوجد فروع متاحة</MenuItem>
                )}
              </TextField>
            ),
          },
          {
            name: "isActive",
            label: "الحالة",
            type: "boolean",
            fieldElement: (value, onChange) => (
              <TextField
                select
                label="الحالة"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                size="small"
                fullWidth
                required
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value={"true"}>نشط</MenuItem>
                <MenuItem value={"false"}>غير نشط</MenuItem>
              </TextField>
            ),
          },
        ]}
        onFiltersChange={handleFilterChange}
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
        onPaginationModelChange={handlePaginationChange}
        editMode="row"
        loading={isLoading}
        localeText={DataGridArLocaleText}
        getRowClassName={(params) =>
          Number(params.id) % 2 === 0 ? "--even-cell" : ""
        }
        slots={{
          toolbar: () => CustomToolbar({}),
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
