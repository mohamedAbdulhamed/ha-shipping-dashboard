import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
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
  GridRowParams,
  GridToolbar,
} from "@mui/x-data-grid-premium";

import { ApiUrls, DataGridArLocaleText, DEFAULT_PAGE_SIZE_OPTIONS } from "@/common/constants";

import DeleteIcon from "@mui/icons-material/Delete";
import CircleIcon from "@mui/icons-material/FiberManualRecord";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

import {
  CellWithTracer,
  NoRowsOverlay,
} from "@/components/grid/CustomGridComponents";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGrid } from "@/hooks/useGrid";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/useToast";

import { deleteEntity, fetchAll } from "@/services/api/entities.api";
import { ROUTES } from "@/app/routes/routesConfig";

import { Branch } from "@/entities/Order";
import { StyledDataGrid } from "@/components/grid/StyledDataGrid";
import { FetchBranchesResponse } from "@/types/dtos/Branch.dto";

const GRID_CONTAINER_HEIGHT = 1000;
const GRID_CONTAINER_MIN_HEIGHT = 900;
const OVERLAY_HEIGHT = 300;
const LIST_VIEW_ROW_HEIGHT = 64;
const DEFAULT_ROW_HEIGHT = 52;
const ROW_BUFFER_PIXELS = 1000;
const COLUMN_BUFFER_PIXELS = 1000;

export function ListBranches() {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // For delete
  const [selectedBranchId, setSelectedBranchId] = useState<Branch["id"] | null>(
    null
  );
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const {
    items,
    isLoading,
    totalRowCount,
    paginationModel,
    handlePaginationChange,
  } = useGrid<FetchBranchesResponse>(
    axiosPrivate,
    ApiUrls.fetchAllBranches,
    "branches",
    fetchAll
  );
  const isListView = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const rowHeight = isListView ? LIST_VIEW_ROW_HEIGHT : DEFAULT_ROW_HEIGHT;

  const deleteMutation = useMutation({
    mutationFn: async (branchId: Branch["id"]) => {
      await deleteEntity(branchId, axiosPrivate, ApiUrls.deleteBranchRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      showToast("تم حذف الفرع بنجاح", { type: "success" });
    },
    onError: () => {
      showToast("حدث خطأ أثناء الحذف", { type: "error" });
    },
    onSettled: () => {
      setOpenDeleteDialog(false);
      setSelectedBranchId(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (branchId: Branch["id"]) => {
      throw new Error(
        `Can't toggle Branch: ${branchId}, Because toggle functionallity is not yet implemented on the server`
      );
    },
    // toggleEntityStatus(branchId, axiosPrivate, ApiUrls.toggleBranchActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      showToast("تم تحديث حالة الفرع بنجاح", { type: "success" });
    },
    onError: () => {
      showToast("حدث خطأ أثناء تحديث الحالة", { type: "error" });
    },
  });

  // Delete handlers
  const handleDeleteClick = useCallback((branchId: Branch["id"]) => {
    setSelectedBranchId(branchId);
    setOpenDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (selectedBranchId) {
      deleteMutation.mutate(selectedBranchId);
    }
  }, [selectedBranchId, deleteMutation]);

  const handleDeleteCancel = useCallback(() => {
    setOpenDeleteDialog(false);
    setSelectedBranchId(null);
  }, []);

  const handleToggleActive = useCallback(
    (branchId: Branch["id"]) => {
      toggleActiveMutation.mutate(branchId);
    },
    [toggleActiveMutation]
  );

  const gridColDef: GridColDef<FetchBranchesResponse>[] = [
    {
      field: "name",
      headerName: "اسم الفرع",
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "التاريخ",
      type: "date",
      flex: 1,
      valueGetter: (params: FetchBranchesResponse["createdAt"]) =>
        params ? new Date(params) : null,
      valueFormatter: (params: FetchBranchesResponse["createdAt"]) => {
        return params ? new Date(params).toLocaleDateString() : "";
      },
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
      field: "actions",
      type: "actions",
      headerName: "الإجراءات",
      flex: 2,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="toggle-active"
          disabled={true}
          icon={params.row.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
          label={params.row.isActive ? "تعطيل" : "تفعيل"}
          sx={{
            color: params.row.isActive ? "success.main" : "text.secondary",
            "&:hover": { backgroundColor: "rgba(76, 175, 80, 0.08)" },
          }}
          onClick={() => handleToggleActive(params.row.id)}
        />,
        <GridActionsCellItem
          key="delete"
          onClick={() => handleDeleteClick(params.row.id)}
          icon={
            deleteMutation.isPending && params.row.id === selectedBranchId ? (
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
        />,
      ],
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
          هل أنت متأكد من رغبتك في حذف هذا الفرع؟
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

  const DeleteAction = function ({ branchId }: { branchId: Branch["id"] }) {
    const isDeleting =
      deleteMutation.isPending && branchId === selectedBranchId;

    return (
      <IconButton
        aria-label="Delete"
        onClick={() => handleDeleteClick(branchId)}
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

  const ListViewCell = function (
    props: GridRenderCellParams<FetchBranchesResponse>
  ) {
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
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(row.createdAt).toLocaleDateString()}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: row.isActive ? "success.main" : "error.main",
            }}
          >
            <CircleIcon
              fontSize="small"
              color={row.isActive ? "success" : "error"}
            />
            <Typography>{row.isActive ? "نشط" : "غير نشط"}</Typography>
          </Box>
        </Stack>

        <Stack direction="row" sx={{ gap: 1 }}>
          <DeleteAction branchId={row.id} />
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
        backgroundColor: theme.palette.background.default,
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
          الفروع
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
          + إنشاء فرع جديد
        </Button>
      </Box>

      <StyledDataGrid
        rows={items}
        columns={gridColDef as readonly GridColDef[]}
        sx={(theme) => ({
          boxShadow: 2,
          border: 2,
          borderColor:
            theme.palette.mode === "dark"
              ? theme.palette.grey[700]
              : theme.palette.grey[200],
          "& .MuiDataGrid-cell.--grey-cell": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[900]
                : theme.palette.grey[200],
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
        getCellClassName={(params) =>
          Number(params.id) % 2 === 0 ? "--grey-cell" : ""
        }
        slots={{
          toolbar: GridToolbar,
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
