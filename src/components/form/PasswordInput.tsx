import { useState, useMemo, Fragment } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  LinearProgress,
  Box,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockPerson,
  CheckCircle,
  Brightness1,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { styled, useTheme } from "@mui/material/styles";

export interface PasswordInputProps {
  /** Current password value */
  value: string;
  /** Change handler receives the new password value */
  onChange: (value: string) => void;
  /** Optional error message to display */
  error?: string;
  /** Disable the input if true */
  disabled?: boolean;
}

const PasswordContainer = styled(Box)(() => ({
  position: "relative",
  width: "100%",
  transition: "all 0.3s ease",
}));

const StrengthIndicator = styled(LinearProgress)<{ value: number }>(
  ({ theme, value }) => ({
    height: 4,
    borderRadius: 2,
    marginTop: theme.spacing(0.5),
    backgroundColor: theme.palette.grey[200],
    "& .MuiLinearProgress-bar": {
      borderRadius: 2,
      backgroundColor:
        value < 40
          ? theme.palette.error.main
          : value < 70
            ? theme.palette.warning.main
            : theme.palette.success.main,
      transition: "all 0.3s ease",
    },
  })
);

const ValidationList = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  marginTop: theme.spacing(1),
}));

export const PasswordInput = ({
  value,
  onChange,
  error,
  disabled,
}: PasswordInputProps) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const passwordStrength = useMemo(() => {
    let strength = 0;
    if (value.length >= 8) strength += 25;
    if (/[A-Z]/.test(value)) strength += 25;
    if (/[0-9]/.test(value)) strength += 25;
    if (/[^A-Za-z0-9]/.test(value)) strength += 25;
    return strength;
  }, [value]);

  const validationRules = [
    { label: "8 أحرف على الأقل", valid: value.length >= 8 },
    { label: "حرف كبير واحد على الأقل", valid: /[A-Z]/.test(value) },
    { label: "رقم واحد على الأقل", valid: /[0-9]/.test(value) },
    { label: "رمز خاص واحد على الأقل", valid: /[^A-Za-z0-9]/.test(value) },
  ];

  return (
    <PasswordContainer>
      <TextField
        fullWidth
        label="كلمة السر"
        type={showPassword ? "text" : "password"}
        placeholder="🞄🞄🞄🞄🞄🞄🞄🞄"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={!!error}
        helperText={error}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockPerson sx={{ color: "action.active" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ color: "text.secondary" }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: theme.palette.primary.main,
              },
              "&.Mui-focused": {
                boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
              },
            },
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            background: theme.palette.background.paper,
            border: `2px solid ${theme.palette.grey[300]}`,
            "&:hover": {
              borderColor: theme.palette.primary.main,
            },
            "&.Mui-focused": {
              borderColor: theme.palette.primary.main,
            },
          },
        }}
      />

      {isFocused && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: isFocused ? 1 : 0,
              y: isFocused ? 0 : -10,
            }}
            transition={{ duration: 0.2 }}
          >
            <StrengthIndicator variant="determinate" value={passwordStrength} />

            <ValidationList>
              {validationRules.map((rule) => (
                <Box
                  key={rule.label}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ color: rule.valid ? "success.main" : "text.secondary" }}
                >
                  {rule.valid ? (
                    <CheckCircle fontSize="small" color="success" />
                  ) : (
                    <Brightness1 fontSize="small" color="disabled" />
                  )}
                  <Typography variant="body2">{rule.label}</Typography>
                </Box>
              ))}
            </ValidationList>
          </motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ originX: 0 }}
          >
            <Tooltip
              title="قوة كلمة المرور"
              arrow
              placement="right"
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: "common.white",
                    color: "text.primary",
                    boxShadow: 3,
                    border: `1px solid ${theme.palette.divider}`,
                  },
                },
              }}
            >
              <Box display="flex" gap={0.5} mt={1}>
                {[...Array(4)].map((_, index) => (
                  <motion.div
                    key={index}
                    animate={{
                      scale: passwordStrength > index * 25 ? 1.1 : 1,
                      backgroundColor:
                        passwordStrength > index * 25
                          ? index < 2
                            ? theme.palette.error.main
                            : index < 3
                              ? theme.palette.warning.main
                              : theme.palette.success.main
                          : theme.palette.grey[300],
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    style={{
                      width: 20,
                      height: 4,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </Box>
            </Tooltip>
          </motion.div>
        </Fragment>
      )}
    </PasswordContainer>
  );
};
