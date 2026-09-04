import { Autocomplete, MenuItem, TextField } from "@mui/material";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { CreateUserRequest } from "@/types/dtos/User.dto";
import { createEntity } from "@/services/api/entities.api";
import { ApiUrls, PHONE_REGEX } from "@/common/constants";
import { handleError, toOptions } from "@/utils";
import { EntityForm, FieldConfig } from "@/components/crud/EntityForm";
import { PageLoader } from "@/components/ui/PageLoader";
import {
  getGovernorates,
  getSubregionsByGovernorateName_ar,
} from "@/utils/governorates";
import { PasswordInput } from "@/components/form/PasswordInput";
import { useCallback, useMemo } from "react";
import { useBranches, useRoles } from "@/hooks/useDataHooks";

const createUserSchema: z.ZodType<CreateUserRequest> = z
  .object({
    phoneNumber: z
      .string({
        required_error: "رقم الهاتف مطلوب",
      })
      .refine((val) => val.trim() !== "", { message: "رقم الهاتف مطلوب" })
      .refine((val) => PHONE_REGEX.test(val), {
        message: "رقم الهاتف غير صالح",
      }),
    fullName: z
      .string({
        required_error: "الاسم الكامل مطلوب",
      })
      .refine((val) => val.trim() !== "", { message: "الاسم الكامل مطلوب" }),

    governorate: z
      .string({
        required_error: "المحافظة مطلوبة",
      })
      .refine((val) => val.trim() !== "", { message: "المحافظة مطلوبة" }),

    city: z
      .string({
        required_error: "المدينة مطلوبة",
      })
      .refine((val) => val.trim() !== "", { message: "المدينة مطلوبة" }),

    address: z
      .string({
        required_error: "العنوان مطلوب",
      })
      .refine((val) => val.trim() !== "", { message: "العنوان مطلوب" }),

    membershipCode: z
      .string({
        required_error: "كود العضوية مطلوب",
      })
      .refine((val) => val.trim() !== "", { message: "كود العضوية مطلوب" }),
    branchId: z.coerce
      .number({
        invalid_type_error: "يجب اختيار الفرع",
      })
      .int("يجب اختيار الفرع"),
    password: z
      .string({
        required_error: "كلمة المرور مطلوبة",
      })
      .min(8, "كلمة المرور يجب ان تكون 8 احرف على الاقل"),

    role: z
      .string({
        required_error: "الدور مطلوب",
      })
      .refine((val) => val.trim() !== "", { message: "الدور مطلوب" }),
  })
  .strict();

export function NewUser() {
  const axiosPrivate = useAxiosPrivate();
  const { showToast } = useToast();
  const { branches, isLoading: loadingBranches } = useBranches();
  const { roles, isLoading: loadingRoles } = useRoles();
  const isLoading = loadingBranches || loadingRoles;

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) =>
      createEntity(axiosPrivate, ApiUrls.createUserRequest, data),
    onSuccess: () => showToast("تم انشاء المستخدم بنجاح", { type: "success" }),
    onError: (error: any) => {
      handleError(error);
      showToast("حدث خطأ أثناء إنشاء المستخدم", { type: "error" });
    },
  });
  const branchOptions = useMemo(
    () => toOptions(branches || [], "name", "id"),
    [branches]
  );
  const roleOptions = useMemo(
    () => toOptions(roles || [], "name", "name"),
    [roles]
  );
  const govOptions = useMemo(
    () => toOptions(getGovernorates() || [], "name_ar", "name_ar"),
    []
  );

  const governorateCities = (governorateName_ar: string) => {
    const subregions = getSubregionsByGovernorateName_ar(governorateName_ar);
    return subregions.map((subregion) => ({
      label: subregion.name_ar,
      value: subregion.name_ar,
    }));
  };

  const fields = useMemo<FieldConfig<CreateUserRequest>[]>(
    () => [
      {
        name: "phoneNumber",
        label: "رقم الهاتف",
        type: "text",
        required: true,
        fullWidth: true,
      },
      {
        name: "password",
        label: "كلمة السر",
        customRender: (value, onChange, { error, disabled }) => (
          <PasswordInput
            value={value ?? ""}
            onChange={onChange}
            error={error}
            disabled={disabled}
          />
        ),
      },
      {
        name: "fullName",
        label: "الاسم الكامل",
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
        name: "governorate",
        label: "المحافظة",
        customRender: (value, onChange, { error, disabled }) => (
          <Autocomplete
            options={govOptions}
            value={value ?? ""}
            onChange={(_, newValue) => onChange(newValue?.value ?? "")}
            disabled={disabled}
            renderInput={(params) => (
              <TextField
                {...params}
                label="المحافظة"
                error={!!error}
                helperText={error}
              />
            )}
          />
        ),
      },
      {
        name: "city",
        label: "المدينة",
        customRender: (value, onChange, { error, disabled }, values) => {
          const cityOptions = values?.governorate
            ? governorateCities(values.governorate)
            : [];
          return (
            <Autocomplete
              options={cityOptions}
              value={value ?? ""}
              onChange={(_, newValue) => onChange(newValue?.value ?? "")}
              disabled={disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="المدينة"
                  error={!!error}
                  helperText={error}
                />
              )}
            />
          );
        },
      },
      {
        name: "address",
        label: "العنوان",
        type: "text",
        required: true,
        fullWidth: true,
        sx: {
          gridColumn: "1 / 3",
        },
      },
      {
        name: "role",
        label: "الدور",
        customRender: (value, onChange) => (
          <TextField
            select
            label="الدور"
            value={value ?? roleOptions[0]?.value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            required
          >
            <MenuItem value="" disabled>
              اختر الدور
            </MenuItem>
            {roleOptions?.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </TextField>
        ),
      },
      {
        name: "branchId",
        label: "الفرع",
        customRender: (value, onChange) => (
          <TextField
            select
            disabled
            label="الفرع"
            value={value ?? branchOptions[0]?.value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            required
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
    ],
    [branchOptions, govOptions, roleOptions]
  );

  const onSubmit = useCallback(
    async (data: CreateUserRequest) => {
      await createMutation.mutateAsync(data);
    },
    [createMutation]
  );

  if (isLoading) return <PageLoader text="جارٍ تحميل البيانات…" />;

  return (
    <EntityForm<CreateUserRequest>
      mode="create"
      schema={createUserSchema}
      fields={fields}
      onSubmitHandler={onSubmit}
      initialValues={{
        phoneNumber: "",
        fullName: "",
        governorate: "",
        city: "",
        address: "",
        membershipCode: "",
        password: "",
        branchId: branchOptions[0]?.value,
        role: roleOptions[0]?.value,
      }}
      localization={{
        title: "مستخدم جديد",
      }}
    />
  );
}
