import React, { ReactNode, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid2,
  Stack,
  SvgIconProps,
  SxProps,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";

import {
  Email,
  Phone,
  Person,
  Badge,
  CalendarToday,
  Edit,
  Delete,
  Work,
  ToggleOn,
  ToggleOff,
} from "@mui/icons-material";

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { FetchUserResponse } from "@/types/dtos/User.dto";
import { ApiUrls } from "@/common/constants";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { deleteEntity, fetchById, toggleEntityStatus } from "@/services/api/entities.api";
import { PageLoader } from "@/components/ui/PageLoader";
import { useToast } from "@/hooks/useToast";
import { ROUTES } from "@/app/routes/routesConfig";
import User, { UserRole } from "@/entities/User";

export function ViewUser() {
  const { userId } = useParams<{ userId: string }>();

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const {
    data: user,
    isLoading,
    isError,
  }: UseQueryResult<FetchUserResponse['Result']> = useQuery({
    queryKey: ["user", userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      return fetchById(userId, axiosPrivate, ApiUrls.fetchUserById);
    },
    enabled: !!userId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      return deleteEntity(userId, axiosPrivate, ApiUrls.deleteUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate(ROUTES.USERS.BASE.url);
      showToast("تم حذف المستخدم بنجاح", { type: "success" });
    },
    onError: () => {
      showToast("حدث خطأ أثناء الحذف", { type: "error" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (userId: User["id"]) =>
      toggleEntityStatus(userId, axiosPrivate, ApiUrls.toggleUserActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      showToast("تم تحديث حالة المستخدم بنجاح", { type: "success" });
    },
    onError: () => {
      showToast("حدث خطأ أثناء تحديث الحالة", { type: "error" });
    },
  });

  // Handle missing userId and query errors
  useEffect(() => {
    if (!userId || isError) {
      showToast("معرف المستخدم غير صالح", { type: "error" });
      navigate(ROUTES.USERS.BASE.url, { replace: true });
    }
  }, [userId, isError, navigate, showToast]);

  if (isLoading || !userId || !user) {
    return <PageLoader text="جاري تحميل البيانات..." />;
  }

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?";

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "Admin":
        return "primary";
      case "Operation":
        return "secondary";
      case "Courier":
        return "success";
      case "Sender":
        return "warning";
      case "Company":
        return "info";
      default:
        return "default";
    }
  };

  const handleToggleStatus = () => {
    if (user) {
      toggleActiveMutation.mutate(userId);
    }
  };

  const handleEdit = () => navigate(ROUTES.USERS.GET_EDIT_URL_BY_ID(userId));

  const handleDeleteConfirm = async () => {
    setOpenDeleteDialog(false);
    await deleteMutation.mutateAsync();
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      {/* Profile Header */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: 3,
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 30%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <CardContent>
          <Grid2 container spacing={4} alignItems="center">
            <Grid2
              // size={{ xs: 12, md: 6 }}
              size="grow"
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Avatar
                sx={{
                  width: 150,
                  height: 150,
                  fontSize: "3rem",
                  bgcolor: theme.palette.secondary.main,
                  boxShadow: 3,
                }}
              >
                {initials}
              </Avatar>
            </Grid2>

            <Grid2 size={{ xs: 12, md: 9 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={5}>
                <Typography variant="h3" fontWeight="bold">
                  {user.fullName}
                </Typography>
                <Chip
                  label={user.role}
                  color={getRoleColor(user.role)}
                  sx={{
                    fontSize: "1rem",
                    px: 2,
                    borderRadius: 2,
                    textTransform: "capitalize",
                  }}
                />
              </Stack>

              <Stack direction="row" spacing={4}>
                <Button
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  variant="contained"
                  sx={{
                    background:
                      "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                    borderRadius: 2,
                    px: 4,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 3,
                    },
                  }}
                >
                  تعديل الملف
                </Button>

                <Button
                  startIcon={user.isActive ? <ToggleOn /> : <ToggleOff />}
                  onClick={handleToggleStatus}
                  variant="contained"
                  color={user.isActive ? "success" : "error"}
                  disabled={toggleActiveMutation.isPending}
                  sx={{
                    background: user.isActive
                      ? "linear-gradient(45deg, #4CAF50 30%, #81C784 90%)"
                      : "linear-gradient(45deg, #f44336 30%, #ef9a9a 90%)",
                    borderRadius: 2,
                    px: 4,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 3,
                    },
                    "&:disabled": {
                      background: "#e0e0e0",
                    },
                  }}
                >
                  {toggleActiveMutation.isPending ? (
                    <CircularProgress size={24} sx={{ color: "inherit" }} />
                  ) : user.isActive ? (
                    "تعطيل الحساب"
                  ) : (
                    "تفعيل الحساب"
                  )}
                </Button>

                <Button
                  startIcon={<Delete />}
                  onClick={() => setOpenDeleteDialog(true)}
                  variant="contained"
                  sx={{
                    background:
                      "linear-gradient(45deg, #ff5252 30%, #ff867f 90%)",
                    borderRadius: 2,
                    px: 4,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 3,
                    },
                  }}
                >
                  حذف الحساب
                </Button>
              </Stack>
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Grid2 container spacing={4}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography
                variant="h5"
                mb={3}
                fontWeight="bold"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: theme.palette.primary.main,
                }}
              >
                <Person fontSize="large" />
                المعلومات الشخصية
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Stack spacing={3}>
                <DetailItem
                  icon={<Badge />}
                  label="كود العضوية"
                  value={user.membershipCode}
                />

                <DetailItem
                  icon={<Phone />}
                  label="رقم الهاتف"
                  value={user.phoneNumber}
                />

                <DetailItem
                  icon={<CalendarToday />}
                  label="تاريخ الانضمام"
                  value={new Date(user.createdAt).toLocaleDateString()}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography
                variant="h5"
                mb={3}
                fontWeight="bold"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: theme.palette.primary.main,
                }}
              >
                <Work fontSize="large" />
                معلومات الحساب
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Stack spacing={3}>
                <DetailItem
                  icon={<Email />}
                  label="البريد الإلكتروني"
                  value={user.email || "غير متوفر"}
                />

                <DetailItem
                  icon={<Person />}
                  label="حالة الحساب"
                  value={
                    <Chip
                      label={user.isActive ? "نشط" : "غير نشط"}
                      color={user.isActive ? "success" : "error"}
                      sx={{
                        borderRadius: 2,
                        cursor: "pointer",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                        transition: "all 0.2s ease",
                      }}
                      onClick={handleToggleStatus}
                    />
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 3,
            background: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle
          sx={{ textAlign: "center", fontWeight: "bold", fontSize: "1.5rem" }}
        >
          ⚠️ تأكيد الحذف
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ textAlign: "center", fontSize: "1.1rem" }}>
            هل أنت متأكد من رغبتك في حذف هذا المستخدم؟
            <br />
            <Box
              component="span"
              sx={{ color: theme.palette.error.main, fontWeight: "bold" }}
            >
              سيتم فقدان جميع البيانات المرتبطة بهذا الحساب بشكل دائم!
            </Box>
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", gap: 3, p: 3 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            sx={{
              px: 4,
              borderRadius: 2,
              "&:hover": { backgroundColor: theme.palette.action.hover },
            }}
          >
            إلغاء
          </Button>

          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{
              px: 4,
              borderRadius: 2,
              background: "linear-gradient(45deg, #ff5252 30%, #ff867f 90%)",
              "&:hover": { transform: "translateY(-2px)" },
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
    </Box>
  );
}

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) => (
  <Stack direction="row" spacing={3} alignItems="center">
    <Box
      sx={{
        p: 1.5,
        bgcolor: "primary.light",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
      }}
    >
      {React.isValidElement<React.JSXElementConstructor<any>>(icon) &&
        React.cloneElement(icon, {
          sx: {
            fontSize: 28,
            color: "primary.main",
            ...(icon.props as SvgIconProps).sx,
          },
        } as React.HTMLAttributes<HTMLElement> & { sx?: SxProps<Theme> })}
    </Box>

    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle1" color="text.secondary" mb={0.5}>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight="500">
        {value}
      </Typography>
    </Box>
  </Stack>
);
