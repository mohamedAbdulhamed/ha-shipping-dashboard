import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import {
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  useTheme,
  Box,
  FormControlLabel,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isCancel } from "axios";
import { useToast } from "@/hooks/useToast";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useLocalStorageState from "@/hooks/useLocalStorageState";
import { useAuthStore } from "@/store/authStore";
import { handleError } from "@/utils";
import { SignUserRequest, SignUserResponse } from "@/types/dtos/User.dto";
import { ROLES } from "@/types";
import { ROUTES } from "@/app/routes/routesConfig";

// Validation schema
const signInSchema: z.ZodType<SignUserRequest> = z.object({
  phoneNumber: z.string(),
  password: z.string(),
  rememberMe: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SERVER_ERROR_MESSAGE = "حدث خطأ أثناء تسجيل الدخول.";

export function SignInComponent() {
  const theme = useTheme();
  const { showToast } = useToast();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuthStore();
  const [, setPersist, { remove }] = useLocalStorageState<boolean>(
    "persist",
    false
  );

  const [serverError, setServerError] = useState<string | null>(null);
  const [formDisabled, setFormDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cookieDialogOpen, setCookieDialogOpen] = useState(false);

  const phoneNumberRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const roleBasedRedirects = useMemo(
    () => ({
      [ROLES.ADMIN]: ROUTES.DASHBOARD.url,
      [ROLES.OPERATION]: ROUTES.ORDERS.BASE.url,
      [ROLES.REPRESENT]: ROUTES.ORDERS.BASE.url,
      [ROLES.COMPANY]: ROUTES.ORDERS.BASE.url,
      [ROLES.SENDER]: ROUTES.ORDERS.BASE.url,
    }),
    []
  );

  useEffect(() => {
    if (phoneNumberRef.current) {
      phoneNumberRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.ORDERS.BASE.url, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = useCallback(
    async (data: SignInFormData) => {
      setServerError(null);
      const controller = new AbortController();

      try {
        const response = await axiosPrivate.post<SignUserResponse>(
          "/Account/Login",
          data,
          { signal: controller.signal }
        );

        // Check response structure and login the user
        if (response?.data?.Result.token && response?.data?.Result.user) {
          const { token, user } = response.data.Result;
          login(user, token);

          // Disable the form after successful login
          setFormDisabled(true);
          // Hide password
          setShowPassword(false);

          // Provide feedback for localStorage actions.
          if (data.rememberMe) {
            setPersist(true);
            showToast("تم تفعيل ميزة التذكر.", { type: "success" });
          } else {
            remove();
            showToast("تم تعطيل ميزة التذكر.", { type: "info" });
          }

          const from =
            location.state?.from?.pathname ||
            (user.role && roleBasedRedirects[user.role]
              ? roleBasedRedirects[user.role]
              : ROUTES.ORDERS.BASE.url);

          navigate(from, { replace: true });
        } else {
          setServerError("بيانات الدخول غير صحيحة.");
        }
      } catch (error: unknown) {
        if (isCancel(error)) return;
        handleError(error);
        const err = error as { response?: { data?: { message?: string } } };
        setServerError(
          err?.response?.data?.message
            ? DOMPurify.sanitize(err.response.data.message)
            : SERVER_ERROR_MESSAGE
        );
      } finally {
        controller.abort(); // Clean up
      }
    },
    [
      axiosPrivate,
      login,
      setPersist,
      remove,
      location,
      navigate,
      roleBasedRedirects,
      showToast,
    ]
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.background.default,
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 4,
          borderRadius: 3,
          boxShadow: `0px 4px 20px ${theme.palette.primary.main}22`,
        }}
      >
        {/* Branding */}
        <Box
          sx={{
            mb: 4,
            textAlign: "center",
          }}
        >
          <Box
            component="img"
            src="/logo.svg"
            alt="H&A"
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              borderRadius: "50%",
              boxShadow: `0px 4px 20px ${theme.palette.primary.main}22`,
              background: `linear-gradient(45deg, ${theme.palette.common.white} 40%, ${theme.palette.grey[600]} 95%)`,
            }}
          />
          <Typography variant="h4" component="p" color="text.secondary">
            تسجيل الدخول
          </Typography>
        </Box>

        {serverError && (
          <Typography
            color="error"
            sx={{ mb: 2 }}
            align="center"
            role="alert"
            aria-live="assertive"
          >
            {serverError}
          </Typography>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            <TextField
              inputRef={phoneNumberRef}
              label="رقم الهاتف"
              type="tel"
              fullWidth
              {...register("phoneNumber")}
              error={Boolean(errors.phoneNumber)}
              helperText={errors.phoneNumber?.message}
              disabled={formDisabled}
            />

            <TextField
              label="كلمة المرور"
              type={showPassword ? "text" : "password"}
              fullWidth
              {...register("password")}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              disabled={formDisabled}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      aria-label={
                        showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                      }
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      disabled={formDisabled}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          setCookieDialogOpen(true);
                        } else {
                          field.onChange(false);
                        }
                      }}
                    />
                  }
                  label="تذكرني"
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSubmitting || formDisabled}
              sx={{ py: 1.5 }}
            >
              {isSubmitting ? "جاري الدخول..." : "دخول"}
            </Button>
          </Stack>
        </form>
        <Dialog
          open={cookieDialogOpen}
          onClose={() => setCookieDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: "right" }}>السماح بملفات الكوكيز للطرف الثالث</DialogTitle>
          <DialogContent sx={{ textAlign: "right" }}>
            <Typography variant="body2" color="text.secondary">
              لتفعيل ميزة "تذكرني"، يجب السماح لملفات الكوكيز للطرف الثالث لأن عملية تحديث الجلسة تتم عبر نطاق مختلف.
              يُرجى التأكد من تفعيل الإعداد في المتصفح حتى يتم إرسال الكوكيز بأمان.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              onClick={() => {
                setCookieDialogOpen(false);
                setValue("rememberMe", false);
              }}
            >
              إلغاء
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setCookieDialogOpen(false);
                setValue("rememberMe", true);
              }}
            >
              موافق
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
