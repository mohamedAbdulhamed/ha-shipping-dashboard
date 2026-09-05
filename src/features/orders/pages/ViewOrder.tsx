import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Paper,
  Step,
  StepIconProps,
  StepLabel,
  Stepper,
  styled,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  useQueryClient,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useProtectedMutation } from "@/hooks/useProtectedMutation";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store";

import {
  EntityDetailsView,
  DetailItem,
} from "@/components/crud/EntityDetailsView";
import { PageLoader } from "@/components/ui/PageLoader";
import { ApiUrls } from "@/common/constants";
import {
  AddOrderStatusRequest,
  FetchOrderResponse,
} from "@/types/dtos/Order.dto";
import { ROLES } from "@/types";

import {
  createEntity,
  deleteEntity,
  fetchById,
} from "@/services/api/entities.api";
import { ShipmentStatus } from "@/entities/Order";

import { ROUTES } from "@/app/routes/routesConfig";
import { toOptions, hasRole, handleError, hasAnyRole } from "@/utils";

import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import InventoryIcon from "@mui/icons-material/Inventory";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import TransferWithinAStationIcon from "@mui/icons-material/TransferWithinAStation";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";

import { CustomStepConnector,
} from "@/components/ui/CustomStepConnector";
import { useAllowedTransitions, useEmployees } from "@/hooks/useDataHooks";
import { OrderLocationJourney } from "../components/OrderLocationJourney";

const StepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme }) => ({
  backgroundColor: "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...theme.applyStyles("dark", {
    backgroundColor: theme.palette.grey[700],
  }),
  variants: [
    {
      props: ({ ownerState }) => ownerState.active,
      style: {
        backgroundImage:
          "linear-gradient(180deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
        boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
      },
    },
    {
      props: ({ ownerState }) => ownerState.completed,
      style: {
        backgroundImage:
          "linear-gradient(180deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
      },
    },
  ],
}));

function StepIcon(props: StepIconProps, status: ShipmentStatus) {
  const { active, completed, className } = props;

  let iconElement: React.ReactElement;
  switch (status) {
    case "طلب بيك اب":
      iconElement = <InventoryIcon />;
      break;
    case "تم استلام بيك اب":
      iconElement = <CallReceivedIcon />;
      break;
    case "لم يتم استلام بيك اب":
      iconElement = <PriorityHighIcon />;
      break;
    case "استلام في المخزن":
      iconElement = <WarehouseIcon />;
      break;
    case "ارتجاع في المخزن":
      iconElement = <KeyboardReturnIcon />;
      break;
    case "قيد التوصيل":
      iconElement = <LocalShippingIcon />;
      break;
    case "فشل التسليم":
      iconElement = <NewReleasesIcon />;
      break;
    case "تسليم ناجح":
      iconElement = <CheckCircleIcon />;
      break;
    case "شحنه ملغاه":
      iconElement = <CancelIcon />;
      break;
    case "تم الارتجاع للراسل":
      iconElement = <TransferWithinAStationIcon />;
      break;
    default:
      iconElement = <SettingsIcon />;
  }

  return (
    <StepIconRoot ownerState={{ completed, active }} className={className}>
      {iconElement}
    </StepIconRoot>
  );
}

export function ViewOrder() {
  const { orderId } = useParams<{ orderId: string }>();

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const { employees, isLoading: loadingEmployees } = useEmployees();
  const { allowedTransitions, isLoading: loadingAllowedTransitions } = useAllowedTransitions({ orderId: orderId! });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [newStatusDialogOpen, setNewStatusDialogOpen] = useState(false);

  const isAdmin = hasRole(user, ROLES.ADMIN);

  const {
    data: order,
    isLoading,
    isError,
  }: UseQueryResult<FetchOrderResponse["Result"]> = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => {
      if (!orderId) {
        throw new Error("Order ID is required");
      }
      return fetchById<FetchOrderResponse>(
        orderId,
        axiosPrivate,
        ApiUrls.fetchOrderById
      );
    },
    select: (data) => data.Result,
    enabled: !!orderId,
  });

  // const {
  //   data: allowedTransitions,
  //   isLoading: isLoadingAllowedTransitions,
  // }: UseQueryResult<FetchAllowedTransitions[]> = useQuery({
  //   queryKey: ["allowedTransitions", orderId],
  //   enabled: !!orderId,
  //   queryFn: async () => {
  //     try {
  //       const response = await axiosPrivate.get(
  //         `${ApiUrls.fetchAllowedTransitions}${orderId}`
  //       );

  //       if (response.data.Success) {
  //         return response.data.Result;
  //       } else {
  //         showToast("حدث خطأ اثناء في تحميل بيانات حالات الشحنات المتاحة");
  //         throw new Error("Failed to load allowed transitions");
  //       }
  //     } catch (error) {
  //       showToast("حدث خطأ اثناء في تحميل بيانات حالات الشحنات المتاحة");
  //       throw error;
  //     }
  //   },
  // });

  const employeesOptions = useMemo(
    () => toOptions(employees || [], "name", "id"),
    [employees]
  );
  const allowedTransitionsOptions = useMemo(
    () => toOptions(allowedTransitions || [], "name", "value"),
    [allowedTransitions]
  );

  const deleteMutation = useProtectedMutation(
    async () => {
      if (!orderId) {
        throw new Error("Order ID is required");
      }
      await deleteEntity(orderId, axiosPrivate, ApiUrls.deleteOrder);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        navigate(ROUTES.ORDERS.BASE.url);
        showToast("تم حذف الشحنة بنجاح", { type: "success" });
      },
      onError: () => {
        showToast("حدث خطأ أثناء الحذف", { type: "error" });
      },
    }
  );

  const addStatusMutation = useProtectedMutation(
    async (data: AddOrderStatusRequest) =>
      createEntity(axiosPrivate, ApiUrls.addShipmentStatus, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        queryClient.invalidateQueries({
          queryKey: ["allowedTransitions", orderId],
        });
        showToast("تم تحديث حالة الشحنة بنجاح", { type: "success" });
        setNewStatusDialogOpen(false);
      },
      onError: () => {
        showToast("حدث خطأ أثناء تحديث حالة الشحنة", { type: "error" });
      },
    }
  );

  const deleteStatusMutation = useProtectedMutation(
    async (statusId: number) =>
      deleteEntity(statusId, axiosPrivate, ApiUrls.deleteShipmentStatus),
    {
      onSuccess: () => {
        showToast("تم حذف الحالة بنجاح", { type: "success" });
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        queryClient.invalidateQueries({
          queryKey: ["allowedTransitions", orderId],
        });
      },
      onError: () => {
        showToast("حدث خطأ أثناء حذف الحالة", { type: "error" });
      },
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // reset,
  } = useForm<{
    shipmentStatus: number;
    responsiblePersonId: string;
    note: string;
  }>({
    disabled: !isAdmin,
    defaultValues: {
      shipmentStatus: allowedTransitionsOptions[0]?.value ?? 0,
      responsiblePersonId: employeesOptions[0]?.value ?? "",
      note: "",
    },
  });

  // Handle missing orderId and query errors
  useEffect(() => {
    if (!orderId || isError) {
      showToast("معرف الطلب غير صالح", { type: "error" });
      navigate(ROUTES.ORDERS.BASE.url, { replace: true });
    }
  }, [orderId, isError, navigate, showToast]);

  if (isLoading || !orderId) {
    return <PageLoader text="جاري تحميل البيانات..." />;
  }

  const onNewStatusSubmit = (data: {
    shipmentStatus: number;
    responsiblePersonId: string;
    note: string;
  }) => {
    if (!isAdmin) return;

    const payload: AddOrderStatusRequest = {
      orderId: Number(orderId),
      shipmentStatus: data.shipmentStatus,
      responsiblePersonId: data.responsiblePersonId,
      note: data.note,
    };

    addStatusMutation.mutate(payload);
    // reset();
  };

  const handleDeleteStatus = async (statusId: number) => {
    if (!isAdmin) return;

    if (!confirm("هل أنت متأكد من أنك تريد حذف هذه الحالة؟")) return;

    try {
      await deleteStatusMutation.mutateAsync(statusId); // mutation call
    } catch (error) {
      console.error("فشل الحذف:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!isAdmin) return;
    setOpenDeleteDialog(false);

    try {
      await deleteMutation.mutateAsync(undefined);
    } catch (error) {
      handleError(error);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  const getEmployeeNameById = (id: string) => {
    const employee = employees?.find((emp) => emp.id === id);
    return employee ? employee.name : "غير معروف";
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "غير متوفر";
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
    }).format(value);
  };

  const details: DetailItem[] = [
    {
      label: "رقم بوليصة الشحن",
      value: order?.billOfLading,
      fullWidth: false,
      sx: {
        p: 2,
        borderRadius: 2,
        backgroundColor: "rgba(33, 150, 243, 0.1)", // light blue
        border: "2px solid #2196F3",
        boxShadow: 1,
        fontWeight: 600,
        mb: 2,
      },
    },
    {
      label: "اسم الراسل",
      value: order?.senderName,
      fullWidth: false,
      sx: {
        p: 2,
        borderRadius: 2,
        backgroundColor: "rgba(76, 175, 80, 0.1)", // light green
        border: "2px solid #4CAF50",
        boxShadow: 1,
        fontWeight: 600,
        mb: 2,
      },
    },
    { label: "اسم العميل", value: order?.receiverName },
    { label: "رقم موبايل أول", value: order?.phoneNumber1 },
    { label: "رقم موبايل ثاني", value: order?.phoneNumber2 },
    { label: "الكمية", value: order?.quantity },
    {
      label: "قيمة الشحن",
      value: formatCurrency(order?.shippingCost),
    },
    {
      label: "قيمة التحصيل (COD)",
      value: formatCurrency(order?.codAmount),
      fullWidth: false,
      sx: {
        p: 2,
        borderRadius: 2,
        backgroundColor: "rgba(255, 152, 0, 0.1)", // light amber
        border: "2px solid #FF9800",
        boxShadow: 1,
        fontWeight: 600,
        mb: 2,
        textAlign: "right", // if you want the number to align
      },
    },
    {
      label: "وصف الطلب",
      value: order?.description,
      fullWidth: true,
      sx: { gridColumn: "1 / 4" },
    },
    {
      label: "تاريخ الإنشاء",
      value: order?.createdAt
        ? new Date(order.createdAt).toLocaleString("ar-EG", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "",
    },
  ];

  const handleEdit = () => {
    if (!isAdmin) return;

    if (!orderId) {
      showToast("لا يمكن التعديل بدون معرف الطلب", { type: "error" });
      return;
    }
    navigate(ROUTES.ORDERS.GET_EDIT_URL_BY_ID(orderId));
  };

  const actions = (
    <Fragment>
      {/* Edit Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleEdit}
        sx={{
          background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: theme.shadows[3],
          },
          transition: "all 0.2s ease",
        }}
      >
        تعديل
      </Button>

      {/* Print Button */}
      <Button
        variant="contained"
        startIcon={<PrintIcon />}
        onClick={() => window.print()}
        className="no-print"
        sx={{
          background: "linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)",
          color: "#fff",
          "&:hover": {
            background: "linear-gradient(45deg, #757575 30%, #9e9e9e 90%)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.2s ease",
        }}
      >
        طباعة
      </Button>

      {/* New Status Dialog */}
      <Dialog
        open={newStatusDialogOpen}
        onClose={() => setNewStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "right" }}>
          <AddIcon sx={{ mr: 1 }} />
          تحديث حالة الشحنة
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: "right", mb: 2 }}>
            اختر الحالة الجديدة للشحنة وقم بتحديد المسؤول وإضافة ملاحظة
            (اختياري)
          </DialogContentText>
          <Box
            component="form"
            onSubmit={handleSubmit(onNewStatusSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            noValidate
          >
            <TextField
              select
              label="حالة الشحنة"
              disabled={
                allowedTransitionsOptions?.length <= 0 &&
                !loadingAllowedTransitions
              }
              {...register("shipmentStatus", { required: "مطلوب" })}
              error={!!errors.shipmentStatus}
              helperText={errors.shipmentStatus?.message}
              fullWidth
            >
              {allowedTransitionsOptions &&
                allowedTransitionsOptions.map((transition) => (
                  <MenuItem key={transition.value} value={transition.value}>
                    {transition.label}
                  </MenuItem>
                ))}
              {allowedTransitionsOptions.length <= 0 &&
                loadingAllowedTransitions && (
                  <MenuItem disabled>جاري تحميل الحالات...</MenuItem>
                )}
            </TextField>

            <TextField
              select
              label="المسؤول"
              disabled={employeesOptions?.length <= 0 && !loadingEmployees}
              {...register("responsiblePersonId", { required: "مطلوب" })}
              error={!!errors.responsiblePersonId}
              helperText={errors.responsiblePersonId?.message}
              fullWidth
            >
              {employeesOptions &&
                employeesOptions.map((employee) => (
                  <MenuItem key={employee.value} value={employee.value}>
                    {employee.label}
                  </MenuItem>
                ))}
              {employeesOptions.length <= 0 && loadingEmployees && (
                <MenuItem disabled>جاري تحميل العملاء...</MenuItem>
              )}
            </TextField>

            <TextField
              label="ملاحظة"
              {...register("note")}
              fullWidth
              multiline
              rows={3}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                onClick={() => setNewStatusDialogOpen(false)}
                variant="outlined"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={
                  isSubmitting || addStatusMutation.status === "pending"
                }
              >
                حفظ التغييرات
                {isSubmitting ||
                  (addStatusMutation.status === "pending" && (
                    <CircularProgress
                      size={24}
                      sx={{ ml: 1, color: "inherit" }}
                    />
                  ))}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Button */}
      <Button
        variant="contained"
        onClick={() => setOpenDeleteDialog(true)}
        disabled={deleteMutation.isPending}
        sx={{
          background: "linear-gradient(45deg, #ff5252 30%, #ff867f 90%)",
          "&:hover": {
            background: "linear-gradient(45deg, #ff1744 30%, #ff616f 90%)",
            transform: "translateY(-1px)",
          },
          "&:disabled": {
            background: "linear-gradient(45deg, #ffcdd2 30%, #ffebee 90%)",
          },
          transition: "all 0.2s ease",
          position: "relative",
        }}
      >
        {deleteMutation.isPending ? (
          <CircularProgress size={24} sx={{ color: "inherit" }} />
        ) : (
          "حذف"
        )}
      </Button>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        // slotProps.paper
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              padding: 2,
              minWidth: "400px",
            },
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "right", fontWeight: "bold" }}>
          تأكيد الحذف
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: "right", fontSize: "1.1rem" }}>
            هل أنت متأكد من رغبتك في حذف هذه الشحنة؟
            <br />
            <span style={{ color: theme.palette.error.main }}>
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
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{
              background: "linear-gradient(45deg, #ff5252 30%, #ff867f 90%)",
              borderRadius: 2,
              "&:hover": {
                background: "linear-gradient(45deg, #ff1744 30%, #ff616f 90%)",
                boxShadow: theme.shadows[2],
              },
            }}
          >
            تأكيد الحذف
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );

  const StatusTimeline = () => {
    const sortedHistory = useMemo(() => {
      return (order?.orderStatusHistory ?? [])
        .slice()
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    }, [order?.orderStatusHistory]);

    return (
    <Paper
      sx={{
        p: 3,
        mt: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
        color="text.secondary"
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <LocalShippingIcon color="primary" />
          سلسلة حالة الشحنة
        </Typography>

        {/* New Status Button */}
        {hasAnyRole(user, [ROLES.ADMIN, ROLES.REPRESENT]) && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => setNewStatusDialogOpen(true)}
            sx={{
              background: "linear-gradient(45deg, #4CAF50 30%, #81C784 90%)",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: theme.shadows[3],
              },
            }}
          >
            تحديث الحالة
          </Button>
        )}
      </Box>

      <Stepper
        orientation="vertical"
        activeStep={(order?.orderStatusHistory?.length ?? 0) - 1}
        connector={<CustomStepConnector />}
      >
        {sortedHistory.map((status, index, arr) => {
            const isLast = index === arr.length - 1;

            return (
              <Step key={index} active={true}>
                <StepLabel
                  slots={{
                    stepIcon: (props) => StepIcon(props, status.shipmentStatus),
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Typography variant="subtitle1">
                      {status.shipmentStatus}
                    </Typography>
                    <Chip
                      label={new Date(status.createdAt).toLocaleDateString(
                        "ar-EG"
                      )}
                      size="small"
                      variant="outlined"
                    />
                    {status.responsiblePersonId && (
                      <Typography variant="body1" color="text.secondary">
                        المسؤول:{" "}
                        {getEmployeeNameById(status.responsiblePersonId)}
                      </Typography>
                    )}
                    {status.note && (
                      <Typography variant="body1" color="text.secondary">
                        ملاحظة: {status.note}
                      </Typography>
                    )}

                    {/* Delete Button for Last Status */}
                    {isLast && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        disabled={deleteStatusMutation.isPending}
                        onClick={() => handleDeleteStatus(status.id)}
                        sx={{
                          alignSelf: "flex-start",
                          mt: 1,
                        }}
                      >
                        حذف آخر حالة
                      </Button>
                    )}
                  </Box>
                </StepLabel>
              </Step>
            );
          })}
      </Stepper>

      {(!order?.orderStatusHistory ||
        order.orderStatusHistory.length === 0) && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          لا يوجد سجل حالة متاح
        </Typography>
      )}
    </Paper>
  );
  }

  return (
    <Box>
      {order && <OrderLocationJourney order={order} />}
      <EntityDetailsView
        title="بيانات الشحنة"
        details={details}
        actions={isAdmin ? actions : undefined}
        density="compact"
        sx={{
          maxWidth: "100%",
          mt: 4,
        }}
      />

      <StatusTimeline />
    </Box>
  );
}
