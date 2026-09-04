// import { memo } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  useWatch,
} from "react-hook-form";
import { FieldConfig } from "../crud/EntityForm";
import { SxProps, TextField, TextFieldProps } from "@mui/material";
import { Box } from "@mui/system";

export const GenericField = 
  ({
    field,
    control,
  }: {
    field: FieldConfig<any>;
    control: Control<any>;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    sx?: SxProps;
  }) => {
    const { registerOptions, customRender } = field;
    const watchedValues = useWatch({ control });

    if (customRender) {
      return (
        <Controller
          key={field.name as string}
          name={field.name as string}
          control={control}
          rules={registerOptions}
          render={({ field: controllerField, fieldState }) => {
            return (
              <Box>
                {customRender(
                  controllerField.value,
                  controllerField.onChange,
                  {
                    error: fieldState.error?.message,
                    disabled: field.disabled,
                  },
                  watchedValues
                )}
              </Box>
            );
          }}
        />
      );
    }

    // Fallback to a normal text field for non-custom-rendered fields
    return (
      <Controller
        name={field.name as string}
        control={control}
        rules={registerOptions}
        render={({ field: ctl, fieldState }) => (
          <TextField
            {...ctl}
            label={field.label}
            type={field.type}
            fullWidth={field.fullWidth}
            disabled={field.disabled}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            sx={{
              "& .MuiInputBase-root": {
                borderRadius: 2,
                backgroundColor: "background.default",
                "&:hover": { backgroundColor: "action.hover" },
                "&.Mui-focused": {
                  backgroundColor: "background.paper",
                  boxShadow: 1,
                },
              },
            }}
            {...(field as TextFieldProps)}
          />
        )}
      />
    );
  }
//   (prev, next) => {
//     const name = prev.field.name as string;
//     const prevErr = prev.errors[name]?.message;
//     const nextErr = next.errors[name]?.message;
//     return prev.field.disabled === next.field.disabled && prevErr === nextErr;
//   }
// );
