import {
  useMemo,
  useCallback,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import {
  Paper,
  Typography,
  Button,
  TextFieldProps,
  SxProps,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  useForm,
  FieldValues,
  DefaultValues,
  RegisterOptions,
  FormProvider,
} from "react-hook-form";
import { ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GenericField } from "../form/GenericField";

export type FieldConfig<T> = TextFieldProps & {
  name: keyof T;
  label: string;
  section?: string;
  customRender?: (
    value: any,
    onChange: (value: any) => void,
    meta: {
      error?: string;
      disabled?: boolean;
    },
    values: any
  ) => ReactNode;
  registerOptions?: RegisterOptions;
};

export type SectionLayout = {
  /** will be applied directly to sx={{ gridColumn, gridRow }} */
  gridColumn?:
    | string
    | { xs?: string; sm?: string; md?: string; lg?: string; xl?: string };
  gridRow?:
    | string
    | { xs?: string; sm?: string; md?: string; lg?: string; xl?: string };
  gridTemplateColumns?:
    | string
    | { xs?: string; sm?: string; md?: string; lg?: string; xl?: string };
};

interface EFLocalization {
  title?: string;
  createButtonText?: string;
  isCreatingButtonText?: string;
  editButtonText?: string;
  isEditingButtonText?: string;
  cancelButtonText?: string;
}

export type EntityFormProps<T extends FieldValues> = {
  schema: ZodType<T>;
  fields: readonly FieldConfig<T>[];
  mode: "create" | "edit";
  triggerMode?: "all" | "onBlur" | "onChange" | "onSubmit" | "onTouched";
  resetAfterSubmit?: boolean;
  onSubmitHandler: (data: T) => Promise<void>;
  initialValues?: Partial<T>;
  sectionLayouts?: Record<string, SectionLayout>;
  sx?: SxProps;
  keepAfterReset?: (keyof T)[];
  localization?: EFLocalization;
  customButtons?: React.ReactNode;
};

const defaultLocalization: EFLocalization = {
  title: "إنشاء",
  createButtonText: "إنشاء",
  isCreatingButtonText: "جاري الإنشاء...",
  editButtonText: "تعديل",
  isEditingButtonText: "جاري التعديل...",
  cancelButtonText: "إلغاء",
};

export const EntityForm = <T extends FieldValues>({
  schema,
  fields,
  mode,
  triggerMode = "onBlur",
  resetAfterSubmit = mode === "create",
  onSubmitHandler,
  initialValues = {} as Partial<T>,
  sectionLayouts = {},
  sx,
  keepAfterReset = [],
  localization = defaultLocalization,
  customButtons,
}: EntityFormProps<T>) => {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: initialValues as DefaultValues<T>,
    mode: triggerMode,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = methods;

  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleSubmitWrapper = useCallback(
    async (data: T) => {
      await onSubmitHandler(data);

      if (mode === "create" && resetAfterSubmit) {
        const resetValues = { ...initialValues };
        keepAfterReset.forEach((field) => {
          resetValues[field] = data[field];
        });
        reset(resetValues as DefaultValues<T>);
      }
    },
    [
      mode,
      onSubmitHandler,
      reset,
      resetAfterSubmit,
      initialValues,
      keepAfterReset,
    ]
  );

  const buttonText = useMemo(
    () =>
      isSubmitting
        ? mode === "create"
          ? (localization.isCreatingButtonText ?? defaultLocalization.isCreatingButtonText)
          : (localization.isEditingButtonText ?? defaultLocalization.isEditingButtonText)
        : mode === "create"
          ? (localization.createButtonText ?? defaultLocalization.createButtonText)
          : (localization.editButtonText ?? defaultLocalization.editButtonText),
    [isSubmitting, mode, localization]
  );

  const groupedFields = useMemo(() => {
    const groups: { [key: string]: FieldConfig<T>[] } = {};
    fields.forEach((field) => {
      // If no section is provided, use a default group.
      const section = field.section || "default";
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(field);
    });
    return groups;
  }, [fields]);

  return (
    <Paper
      sx={{
        maxWidth: 800,
        mx: "auto",
        px: { xs: 2, sm: 4 },
        py: { xs: 3, sm: 4 },
        borderRadius: 4,
        boxShadow: 3,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: 6,
        },
        ...sx,
      }}
    >
      {/* Header */}
      <Typography
        variant="h4"
        fontWeight="bold"
        mb={4}
        gutterBottom
        sx={{
          color: "primary.main",
          textAlign: "center",
          position: "relative",
          "&::after": {
            content: '""',
            display: "block",
            width: "60px",
            height: "4px",
            backgroundColor: "primary.main",
            margin: "16px auto 0",
            borderRadius: 2,
          },
        }}
      >
        {localization.title ?? defaultLocalization.title}
      </Typography>

      <FormProvider {...methods}>
        <form
          ref={ref}
          onSubmit={handleSubmit(handleSubmitWrapper)}
          className="EntityForm_form"
          noValidate
        >
          <Box
            className="EntityForm_form_childBox"
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gridAutoRows: "auto",
              gap: 4,
              mb: 4,
            }}
          >
            {Object.entries(groupedFields).map(([sectionName, sectionFields]) => {
              const { gridColumn, gridRow, gridTemplateColumns } =
                sectionLayouts[sectionName] || {};

              return (
                <Box
                  key={sectionName}
                  className="EntityForm_section"
                  sx={{
                    gridColumn: gridColumn,
                    gridRow: gridRow,
                    p: 3,
                    borderRadius: 3,
                    border: sectionName !== "default" ? "1px solid" : "none",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "primary.light",
                    },
                  }}
                >
                  {/* Section Title and Divider for non default sections */}
                  {sectionName !== "default" && (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 3,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 32,
                            backgroundColor: "primary.main",
                            borderRadius: 1,
                          }}
                        />
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 600,
                            color: "text.primary",
                          }}
                        >
                          {sectionName}
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
                    </>
                  )}

                  {/* Section Fields */}
                  <Box
                    className="EntityForm_section_fields"
                    sx={{
                      display: "grid",
                      gridTemplateColumns: gridTemplateColumns ?? {
                        xs: "1fr",
                        md: "repeat(2, 1fr)",
                      },
                      gap: 3,
                      "& .MuiFormControl-root": {
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                        },
                      },
                    }}
                  >
                    {sectionFields.map((field) => (
                      <GenericField
                        key={field.name as string}
                        field={field}
                        control={control}
                        register={register}
                        errors={errors}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: 2,
                            backgroundColor: "background.default",
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "background.paper",
                              boxShadow: 1,
                            },
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Buttons */}
          <Box
            className="EntityForm_form_buttons"
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 2,
              position: "sticky",
              bottom: 24,
              zIndex: 1,
              px: { xs: 1, sm: 0 },
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                px: 6,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 2,
                minWidth: 180,
                transition: "all 0.3s ease",
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                boxShadow: 2,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 4,
                },
                "&:disabled": {
                  background: "linear-gradient(45deg, #B0BEC5 30%, #CFD8DC 90%)",
                  color: "text.disabled",
                },
              }}
            >
              {buttonText}
              {isSubmitting && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: "inherit",
                    ml: 2,
                  }}
                />
              )}
            </Button>
            {customButtons}
          </Box>
        </form>
      </FormProvider>
    </Paper>
  );
};
