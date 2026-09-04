import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { EntityForm, FieldConfig } from "@/components/crud/EntityForm";
import { ROLES } from "@/types";
import { fetchById } from "@/services/api/entities.api";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { PageLoader } from "@/components/ui/PageLoader";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { ApiUrls, PHONE_REGEX } from "@/common/constants";
import {
  FetchOrderResponse,
  UpdateOrderRequest,
  UpdateOrderResponse,
} from "@/types/dtos/Order.dto";
import { handleError, mapOrderToInitialValues, toOptions } from "@/utils";
import { useEffect, useMemo } from "react";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/app/routes/routesConfig";
import {
  getGovernorates,
  getSubregionsByGovernorateName_ar,
} from "@/utils/governorates";
import { hasRole, hasAnyRole } from "@/utils";
import { Autocomplete, MenuItem, TextField } from "@mui/material";
import { useCustomers, useServiceTypes } from "@/hooks/useDataHooks";

const editOrderSchema: z.ZodType<UpdateOrderRequest> = z.object({
  orderSerialNumber: z.string().optional(),

  // Sender Details
  senderName: z.string().min(1, "اسم المرسل مطلوب"),
  senderGovernorate: z.string().min(1, "محافظة المرسل مطلوبة"),
  senderCity: z.string().min(1, "مدينة المرسل مطلوبة"),
  senderAddress: z.string().min(1, "عنوان المرسل مطلوب"),

  // Receiver Details
  receiverName: z.string().min(1, "اسم المستلم مطلوب"),
  phoneNumber1: z
    .string()
    .nonempty("رقم الهاتف مطلوب")
    .max(13, "علي الاكثر 13 رقم")
    .min(10, "علي الاقل 10 ارقام")
    .regex(PHONE_REGEX, "رقم الهاتف غير صالح"),
  phoneNumber2: z
    .string()
    .max(13, "رقم الهاتف الثاني يجب ألا يتجاوز 13 رقم")
    .min(10, "علي الاقل 10 ارقام")
    .regex(PHONE_REGEX, "رقم الهاتف غير صالح")
    .optional(),
  receiverGovernorate: z.string().min(1, "محافظة المستلم مطلوبة"),
  receiverCity: z.string().min(1, "مدينة المستلم مطلوبة"),
  receiverAddress: z.string().min(1, "عنوان المستلم مطلوب"),

  // Order Details
  description: z.string().optional(),
  shippingCost: z.coerce.number().min(0, "تكلفة الشحن يجب أن تكون رقم موجب"),
  codAmount: z.coerce
    .number()
    .min(0, "قيمة الدفع عند الاستلام يجب أن تكون رقم موجب"),
  quantity: z.coerce.number().min(1, "الكمية يجب أن تكون على الأقل 1"),
  serviceType: z.coerce
    .number({
      invalid_type_error: "يجب اختيار نوع الخدمة",
    })
    .int("يجب أن يكون رقم صحيح")
    .min(1, "نوع الخدمة مطلوب"),
  branchId: z.coerce
    .number({
      invalid_type_error: "يجب اختيار الفرع",
    })
    .int("يجب أن يكون رقم صحيح")
    .min(1, "الفرع مطلوب"),
});

export function EditOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const { customers, isLoading: loadingCustomers } = useCustomers();
  const { serviceTypes, isLoading: loadingServiceTypes } = useServiceTypes();

  const {
    data: order,
    isLoading: isOrderLoading,
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
    enabled: !!orderId,
  });
  const serviceTypesOptions = useMemo(
    () => toOptions(serviceTypes || [], "name", "id"),
    [serviceTypes]
  );
  const customersOptions = useMemo(
    () => toOptions(customers || [], "name", "id"),
    [customers]
  );
  const governoratesOptions = useMemo(
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

  // Handle missing orderId and query errors
  useEffect(() => {
    if (!orderId || isError) {
      showToast("معرف الطلب غير صالح", { type: "error" });
      navigate(ROUTES.ORDERS.BASE.url, { replace: true });
    }
  }, [orderId, isError, navigate, showToast]);

  const fields: FieldConfig<UpdateOrderRequest>[] = [
    // Sender Details
    {
      name: "senderName",
      label: "اسم المرسل",
      customRender: (value, onChange, { error, disabled }) => (
        <Autocomplete
          freeSolo
          options={customersOptions}
          value={value ?? null}
          onChange={(_, newValue) =>
            onChange(
              typeof newValue === "string"
                ? newValue
                : (newValue?.value ?? null)
            )
          }
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.label || ""
          }
          disabled={disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              label="اسم المرسل"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              error={!!error}
              helperText={error}
            />
          )}
        />
      ),
      section: "تفاصيل المرسل",
    },
    {
      name: "senderGovernorate",
      label: "محافظة المرسل",
      customRender: (value, onChange, { error, disabled }) => (
        <Autocomplete
          options={governoratesOptions}
          value={value ?? ""}
          onChange={(_, newValue) => onChange(newValue?.value ?? "")}
          disabled={disabled}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              label="محافظة المرسل"
              required
              error={!!error}
              helperText={error}
            />
          )}
        />
      ),
      section: "تفاصيل المرسل",
    },
    {
      name: "senderCity",
      label: "مدينة المرسل",
      customRender: (value, onChange, { error, disabled }, values) => {
        const cityOptions = values?.senderGovernorate
          ? governorateCities(values.senderGovernorate)
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
                label="مدينة المرسل"
                error={!!error}
                helperText={error}
              />
            )}
          />
        );
      },
      section: "تفاصيل المرسل",
    },
    {
      name: "senderAddress",
      label: "عنوان المرسل",
      type: "text",
      required: true,
      fullWidth: true,
      section: "تفاصيل المرسل",
    },

    // Receiver Details
    {
      name: "receiverName",
      label: "اسم المستلم",
      type: "text",
      required: true,
      fullWidth: true,
      disabled: !hasAnyRole(user, [ROLES.ADMIN, ROLES.OPERATION]),
      section: "تفاصيل المستلم",
    },
    {
      name: "phoneNumber1",
      label: "رقم الهاتف",
      type: "text",
      required: true,
      fullWidth: true,
      section: "تفاصيل المستلم",
    },
    {
      name: "phoneNumber2",
      label: "رقم الهاتف الثاني",
      type: "text",
      fullWidth: true,
      section: "تفاصيل المستلم",
    },
    {
      name: "receiverGovernorate",
      label: "محافظة المستلم",
      customRender: (value, onChange, { error, disabled }) => (
        <Autocomplete
          options={governoratesOptions}
          value={value ?? ""}
          onChange={(_, newValue) => onChange(newValue?.value ?? "")}
          disabled={disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              label="محافظة المستلم"
              error={!!error}
              helperText={error}
            />
          )}
        />
      ),
      section: "تفاصيل المستلم",
    },
    {
      name: "receiverCity",
      label: "مدينة المستلم",
      customRender: (value, onChange, { error, disabled }, values) => {
        const cityOptions = values?.receiverGovernorate
          ? governorateCities(values.receiverGovernorate)
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
                label="مدينة المستلم"
                error={!!error}
                helperText={error}
              />
            )}
          />
        );
      },
      section: "تفاصيل المستلم",
    },
    {
      name: "receiverAddress",
      label: "عنوان المستلم",
      type: "text",
      required: true,
      fullWidth: true,
      section: "تفاصيل المستلم",
    },

    // Order Details
    {
      name: "shippingCost",
      label: "تكلفة الشحن",
      type: "number",
      required: true,
      fullWidth: true,
      disabled: !hasAnyRole(user, [ROLES.ADMIN, ROLES.OPERATION]),
      section: "تفاصيل الشحنه",
    },
    {
      name: "codAmount",
      label: "قيمة الدفع عند الاستلام",
      type: "number",
      required: true,
      fullWidth: true,
      disabled: !hasRole(user, ROLES.ADMIN),
      section: "تفاصيل الشحنه",
    },
    {
      name: "quantity",
      label: "الكمية",
      type: "number",
      required: true,
      fullWidth: true,
      disabled: !hasAnyRole(user, [ROLES.ADMIN, ROLES.OPERATION]),
      section: "تفاصيل الشحنه",
    },
    {
      name: "serviceType",
      label: "نوع الخدمة",
      customRender: (value, onChange) => (
        <TextField
          select
          label="حاله الشحنة"
          value={value ?? serviceTypesOptions[0].value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
        >
          <MenuItem value="" disabled>
            اختر نوع الخدمة
          </MenuItem>
          {serviceTypesOptions.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>
      ),
      section: "تفاصيل الشحنه",
    },
    {
      name: "description",
      label: "وصف الشحنه",
      type: "text",
      fullWidth: true,
      section: "تفاصيل الشحنه",
      multiline: true,
      rows: 4,
      sx: {
        gridColumn: "1 / 3",
      },
    },
    // {
    //   name: "branchId",
    //   label: "الفرع",
    //   type: "select",
    //   options: branchOptions,
    //   defaultOption: branchOptions[0]?.value,
    //   required: true,
    //   fullWidth: true,
    //   section: "تفاصيل الشحنه",
    // },
  ];

  const handleSubmit = async (data: UpdateOrderRequest) => {
    if (!orderId) {
      showToast("معرف الطلب غير صالح", { type: "error" });
      return;
    }

    try {
      const response = await axiosPrivate.put<UpdateOrderResponse>(
        `${ApiUrls.updateOrder}${orderId}`,
        data
      );

      if (response.data.Success) {
        showToast("تم تعديل الطلب بنجاح", { type: "success" });
        navigate(ROUTES.ORDERS.BASE.url);
      } else {
        showToast(
          response.data.ErrorMessage || "حدث خطأ اثناء تحديث بيانات الطلب!",
          { type: "error" }
        );
      }
    } catch (error) {
      handleError(error);
    }
  };

  if (isOrderLoading || loadingCustomers || loadingServiceTypes || !orderId || !order)
    return <PageLoader text="يتم تحميل البيانات" />;

  return (
    <EntityForm<UpdateOrderRequest>
      mode="edit"
      triggerMode="all"
      schema={editOrderSchema}
      fields={fields}
      onSubmitHandler={handleSubmit}
      initialValues={mapOrderToInitialValues(order)}
      sectionLayouts={{
        "تفاصيل الراسل": {
          gridColumn: { sm: "1 / 2" },
          gridRow: { sm: "1 / 2" },
          gridTemplateColumns: "1fr",
        },
        "تفاصيل المستلم": {
          gridColumn: { sm: "1 / 2" },
          gridRow: { sm: "2 / 3" },
        },
        "تفاصيل الشحنه": {
          gridColumn: { sm: "2 / 3" },
          gridRow: { sm: "1 / 3" },
        },
      }}
      sx={{
        maxWidth: "100%",
        ".EntityForm_form_childBox": {
          gridTemplateColumns: {
            xs: "1fr", // 1 column on mobile
            sm: "1fr 1fr", // 2 cols on small tables
          },
        },
      }}
      localization={{
        title: "تعديل طلب",
        createButtonText: "تعديل",
      }}
    />
  );
}
