import React from "react";
import { TextField, TextFieldProps, } from "@mui/material";
import { UseFormRegister, FieldErrors, RegisterOptions, useWatch, Control } from "react-hook-form";

export type FormFieldProps = TextFieldProps & {
  name: string;
  register: UseFormRegister<any>;
  registerOptions?: RegisterOptions;
  control: Control<any>;
  errors?: FieldErrors;
};
export const FormField: React.FC<FormFieldProps> = ({
  name,
  register,
  registerOptions,
  control,
  errors,
  ...textFieldProps
}) => {
  // Ensure the component re-renders when errors change
  useWatch({ control: control, name });

  const fieldError = errors?.[name];

  return (
    <TextField
      {...register(name, registerOptions)}
      {...textFieldProps}
      error={Boolean(fieldError)}
      helperText={fieldError?.message as string | undefined}
      onBlur={(e) => {
        register(name).onBlur(e);
      }}
    />
  );
};
