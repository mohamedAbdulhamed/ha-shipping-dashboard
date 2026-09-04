import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { EntityForm, FieldConfig } from "@/components/crud/EntityForm";
import { fetchById } from "@/services/api/entities.api";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { PageLoader } from "@/components/ui/PageLoader";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { ApiUrls, PHONE_REGEX } from "@/common/constants";
import { handleError, mapUserToInitialValues, toOptions } from "@/utils";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { ROUTES } from "@/app/routes/routesConfig";
import {
  FetchUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
} from "@/types/dtos/User.dto";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid2,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useBranches } from "@/hooks/useDataHooks";

import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const editUserSchema: z.ZodType<UpdateUserRequest> = z.object({
  fullName: z.string().min(1, "اسم المستخدم مطلوب"),
  membershipCode: z.string().min(1, "كود العضوية مطلوب"),
  phoneNumber: z
    .string()
    .nonempty("رقم الهاتف مطلوب")
    .max(13, "علي الاكثر 13 رقم")
    .min(10, "علي الاقل 10 ارقام")
    .regex(PHONE_REGEX, "رقم الهاتف غير صالح"),
  branchId: z.coerce
    .number({
      invalid_type_error: "يجب اختيار الفرع",
    })
    .int("يجب أن يكون رقم صحيح")
    .min(1, "الفرع مطلوب"),
});

export function EditUser() {
  const { userId } = useParams<{ userId: string }>();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const theme = useTheme();
  const { branches, isLoading: loadingBranches } = useBranches();

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const {
    data: user,
    isLoading: isUserLoading,
    isError,
  }: UseQueryResult<FetchUserResponse["Result"]> = useQuery({
    queryKey: ["user", userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      return fetchById<FetchUserResponse>(
        userId,
        axiosPrivate,
        ApiUrls.fetchUserById
      );
    },
    enabled: !!userId,
  });
  const branchOptions = useMemo(
    () => toOptions(branches || [], "name", "id"),
    [branches]
  );

  // Handle missing userId and query errors
  useEffect(() => {
    if (!userId || isError) {
      showToast("معرف الطلب غير صالح", { type: "error" });
      navigate(ROUTES.ORDERS.BASE.url, { replace: true });
    }
  }, [userId, isError, navigate, showToast]);

  const fields: FieldConfig<UpdateUserRequest>[] = [
    {
      name: "fullName",
      label: "اسم المستخدم",
      type: "text",
      required: true,
      fullWidth: true,
    },
    {
      name: "membershipCode",
      label: "كود العضوية",
      type: "text",
      required: true,
      fullWidth: true,
    },
    {
      name: "phoneNumber",
      label: "رقم الهاتف",
      type: "text",
      required: true,
      fullWidth: true,
    },
    {
      name: "branchId",
      label: "الفرع",
      customRender: (value, onChange) => (
        <TextField
          select
          label="الفرع"
          value={value ?? branchOptions[0].value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
          disabled
        >
          <MenuItem value="" disabled>
            اختر الفرع
          </MenuItem>
          {branchOptions.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>
      ),
    },
  ];

  const handleSubmit = async (data: UpdateUserRequest) => {
    if (!userId) {
      showToast("معرف المستخدم غير صالح", { type: "error" });
      return;
    }

    try {
      const response = await axiosPrivate.put<UpdateUserResponse>(
        `${ApiUrls.updateUserRequest}${userId}`,
        data
      );

      if (response.data.Success) {
        showToast("تم تعديل بيانات المستخدم بنجاح", { type: "success" });
        navigate(ROUTES.USERS.BASE.url);
      } else {
        showToast(
          response.data.ErrorMessage || "حدث خطأ اثناء تحديث بيانات المستخدم!",
          { type: "error" }
        );
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();

    if (!userId) {
      showToast("معرف المستخدم غير صالح", { type: "error" });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast("كلمة المرور الجديدة غير متطابقة", { type: "error" });
      return;
    }

    // Password validation regex
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwords.newPassword)) {
      showToast("كلمة المرور الجديدة لا تتوافق مع متطلبات الأمان", {
        type: "error",
      });
      return;
    }

    try {
      const response = await axiosPrivate.put(
        `${ApiUrls.updateUserPassword}${userId}`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }
      );

      if (response.data.Success) {
        showToast("تم تحديث كلمة المرور بنجاح", { type: "success" });
        // Reset form
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        showToast(
          response.data.ErrorMessage || "حدث خطأ أثناء تحديث كلمة المرور",
          { type: "error" }
        );
      }
    } catch (error) {
      handleError(error);
    }
  };

  if (isUserLoading || loadingBranches || !userId || !branches || !user)
    return <PageLoader text="يتم تحميل البيانات" />;

  return (
    <Box
      sx={{
        maxWidth: 1200,
        margin: "auto",
        p: 4,
        bgcolor: "background.paper",
        borderRadius: 4,
        boxShadow: 3,
        position: "relative",
      }}
    >
      <IconButton
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", left: 32, top: 32, zIndex: 999 }}
      >
        <ArrowBackIcon fontSize="large" />
      </IconButton>

      <Typography
        variant="h3"
        sx={{
          mb: 6,
          textAlign: "center",
          fontWeight: 700,
          color: theme.palette.primary.main,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -8,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            height: 4,
            bgcolor: theme.palette.primary.main,
            borderRadius: 2,
          },
        }}
      >
        تحديث الملف الشخصي
      </Typography>

      <Grid2 container spacing={6}>
        {/* Profile Section */}
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Stack alignItems="center" spacing={3}>
            <Box
              sx={{
                position: "relative",
                "&:hover .edit-overlay": {
                  opacity: 1,
                },
              }}
            >
              <Avatar
                sx={{
                  width: 200,
                  height: 200,
                  border: `4px solid ${theme.palette.primary.main}`,
                  boxShadow: 3,
                }}
              />
              <Box
                className="edit-overlay"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "rgba(0,0,0,0.5)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                  cursor: "pointer",
                }}
              >
                <label htmlFor="profile-image-upload">
                  <EditIcon sx={{ color: "white", fontSize: 40 }} />
                </label>
              </Box>
            </Box>

            <Stack spacing={1} textAlign="center">
              <Typography variant="h5" fontWeight="700">
                {user?.fullName}
              </Typography>
              {user?.membershipCode && (
                <Chip
                  label={`العضوية: #${user?.membershipCode}`}
                  color="secondary"
                  sx={{ fontWeight: 600 }}
                />
              )}
              <Chip
                icon={<EventIcon />}
                label={`تاريخ الانضمام: ${new Date(user?.createdAt || "").toLocaleDateString()}`}
              />
              {/* {user?.branch && (
                <Chip
                  label={`الفرع: ${user?.branch?.name}`}
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
              )} */}
            </Stack>
          </Stack>
        </Grid2>

        {/* Form Section */}
        <Grid2 size={{ xs: 12, md: 8 }}>
          <EntityForm<UpdateUserRequest>
            mode="edit"
            triggerMode="all"
            schema={editUserSchema}
            fields={fields}
            onSubmitHandler={handleSubmit}
            initialValues={mapUserToInitialValues(user)}
            sx={{
              ".EntityForm_fields": {
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 4,
                "& .MuiFormControl-root": {
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[1],
                  },
                },
              },
              ".MuiInputBase-input": {
                fontSize: "1.1rem",
                fontWeight: 500,
              },
            }}
          />
        </Grid2>
      </Grid2>

      <Divider sx={{ my: 6, borderColor: theme.palette.divider }} />

      {/* Update Password Section */}
      <Box
        sx={{
          mx: "auto",
          mt: 4,
          mb: 6,
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            zIndex: 1,
          },
          transform: "translateY(0)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            py: 3,
            px: 2,
            fontWeight: 700,
            color: theme.palette.primary.main,
            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 2px 10px rgba(0,0,0,0.05)",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "80px",
              height: "3px",
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: "2px",
            },
          }}
        >
          تغيير كلمة المرور
        </Typography>

        <Box
          component="form"
          onSubmit={handleUpdatePassword}
          sx={{
            p: 4,
            "& .MuiFormControl-root": {
              mb: 3,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "4px",
                background: `linear-gradient(to bottom, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                borderRadius: "4px",
                opacity: 0,
                transition: "opacity 0.3s ease",
              },
              "&:focus-within::before": {
                opacity: 1,
              },
            },
            "& .MuiInputBase-root": {
              borderRadius: 2,
              overflow: "hidden",
              transition: "all 0.3s ease",
              background: theme.palette.background.paper,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
              "&.Mui-focused": {
                boxShadow: `0 4px 12px ${theme.palette.primary.main}25`,
              },
            },
            "& .MuiInputLabel-root": {
              fontWeight: 600,
              fontSize: "1rem",
              transition: "all 0.3s ease",
              "&.Mui-focused": {
                color: theme.palette.primary.main,
              },
            },
            "& .MuiInputBase-input": {
              fontSize: "1.1rem",
              padding: "14px 16px",
              "&::placeholder": {
                opacity: 0.7,
              },
            },
          }}
        >
          <TextField
            label="كلمة المرور الحالية"
            type={showPasswords.currentPassword ? "text" : "password"}
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            fullWidth
            required
            variant="outlined"
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        currentPassword: !prev.currentPassword,
                      }))
                    }
                    edge="end"
                    sx={{
                      color: theme.palette.text.secondary,
                      transition: "color 0.2s ease",
                      "&:hover": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    {showPasswords.currentPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                ),
              },
            }}
          />

          <TextField
            label="كلمة المرور الجديدة"
            type={showPasswords.newPassword ? "text" : "password"}
            value={passwords.newPassword}
            onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
            fullWidth
            required
            variant="outlined"
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        newPassword: !prev.newPassword,
                      }))
                    }
                    edge="end"
                    sx={{
                      color: theme.palette.text.secondary,
                      transition: "color 0.2s ease",
                      "&:hover": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    {showPasswords.newPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                ),
              },
            }}
          />

          <TextField
            label="تأكيد كلمة المرور الجديدة"
            type={showPasswords.confirmPassword ? "text" : "password"}
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
            fullWidth
            required
            variant="outlined"
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirmPassword: !prev.confirmPassword,
                      }))
                    }
                    edge="end"
                    sx={{
                      color: theme.palette.text.secondary,
                      transition: "color 0.2s ease",
                      "&:hover": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    {showPasswords.confirmPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                ),
              },
            }}
          />

          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  opacity: 0.8,
                  transition: "opacity 0.3s ease",
                },
                "&:hover::before": {
                  opacity: 1,
                },
              }}
            >
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  px: 6,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  textTransform: "none",
                  position: "relative",
                  zIndex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    background: "transparent",
                    transform: "translateY(-2px)",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "0%",
                    height: "2px",
                    background: "#fff",
                    transition: "width 0.3s ease",
                  },
                  "&:hover::after": {
                    width: "80%",
                  },
                }}
              >
                تحديث كلمة المرور
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              background: `linear-gradient(to right, ${theme.palette.info.light}15, ${theme.palette.info.main}10)`,
              border: `1px solid ${theme.palette.info.main}30`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.info.dark,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 1,
                "&::before": {
                  content: '"💡"',
                  fontSize: "1.2rem",
                },
              }}
            >
              كلمة المرور يجب أن تحتوي على الأقل 8 أحرف وتتضمن حرف كبير، حرف
              صغير، رقم ورمز خاص.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* <Divider sx={{ my: 6, borderColor: theme.palette.divider }} />
      <Stack direction="row" spacing={2} justifyContent="center">
         <Chip 
          icon={<LocalShippingIcon />} 
          label={`عدد الشحنات: ${user?.shipmentsCount || 0}`} // for representitive
        />
        <Chip 
          icon={<PaidIcon />} 
          label={`إجمالي التحصيل: ${user?.totalCollections?.toFixed(2) || 0} EGP`} // for customer
        /> 
      </Stack> */}
    </Box>
  );
}
