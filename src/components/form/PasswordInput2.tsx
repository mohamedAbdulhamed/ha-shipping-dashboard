import { useState } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";

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

function calculatePasswordStrength(password: string): number {
  let strength = 0;
  if (password.length > 5) strength += 20;
  if (password.length > 8) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^A-Za-z0-9]/.test(password)) strength += 20;
  return Math.min(strength, 100);
}

const getStrengthLabel = (score: number): string => {
  if (score < 40) return "ضعيفة";
  if (score < 80) return "متوسطة";
  return "قوية";
};

const getStrengthColor = (score: number): string => {
  if (score < 40) return "#f44336"; // Red
  if (score < 80) return "#ff9800"; // Orange
  return "#4caf50"; // Green
};

export function PasswordInput({
  value,
  onChange,
  error,
  disabled,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const strength = calculatePasswordStrength(value);

  return (
    <Box>
      <TextField
        label="كلمة السر"
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={!!error}
        helperText={error || " "}
        disabled={disabled}
        fullWidth
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShow(!show)} edge="end">
                  {show ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Strength Meter */}
      {value.length > 0 && (
        <Box mt={1}>
          <Box
            component={motion.div}
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
            transition={{ duration: 0.6 }}
            sx={{
              height: 8,
              borderRadius: 4,
              // background: "linear-gradient(90deg, #f50057, #3f51b5)",
              background: getStrengthColor(strength),
            }}
          />
          <Box mt={0.5} display="flex" justifyContent="space-between">
            <Typography
              variant="caption"
              sx={{ color: getStrengthColor(strength) }}
            >
              كلمة السر: {getStrengthLabel(strength)}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: getStrengthColor(strength) }}
            >
              {strength}%
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
