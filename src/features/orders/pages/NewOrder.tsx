import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { EntityForm, FieldConfig } from "@/components/crud/EntityForm";
import { ROLES } from "@/types";
import { createEntity } from "@/services/api/entities.api";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { PageLoader } from "@/components/ui/PageLoader";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { ApiUrls, PHONE_REGEX } from "@/common/constants";
import { CreateOrderRequest } from "@/types/dtos/Order.dto";
import {
  getGovernorates,
  getSubregionsByGovernorateName_ar,
} from "@/utils/governorates";
import { useToast } from "@/hooks/useToast";
import { handleError, hasAnyRole, hasRole, Option, toOptions } from "@/utils";
import { useAuthStore } from "@/store";
import { FetchUserResponse } from "@/types/dtos/User.dto";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import MapIcon from "@mui/icons-material/Map";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PlaceIcon from "@mui/icons-material/Place";
import MapLocationPicker, {
  Location,
} from "@/components/map/MapLocationPicker";
import {
  useBranches,
  useCustomers,
  useServiceTypes,
} from "@/hooks/useDataHooks";

const createOrderSchema: z.ZodType<CreateOrderRequest> = z
  .object({
    // Sender Details
    // senderName: z
    //   .string({
    //     required_error: "اسم الراسل مطلوب",
    //     invalid_type_error: "اسم الراسل مطلوب",
    //   })
    //   .refine((val) => {
    //     console.log(val);
    //     return val.trim() !== "", { message: "اسم الراسل مطلوب" }
    //   }),
    senderName: z.string().optional(),

    // Receiver Details
    receiverName: z
      .string({
        required_error: "اسم المستلم مطلوب",
      })
      .refine((val) => val.trim() !== "", { message: "اسم المستلم مطلوب" }),
    phoneNumber1: z
      .string({
        required_error: "رقم الهاتف مطلوب",
      })
      .refine((val) => val.trim() !== "", { message: "رقم الهاتف مطلوب" })
      .refine((val) => PHONE_REGEX.test(val), {
        message: "رقم الهاتف غير صالح",
      }),
    phoneNumber2: z
      .string()
      .optional()
      .refine((val) => !val || PHONE_REGEX.test(val.trim()), {
        message: "رقم الهاتف غير صالح",
      }),
    receiverGovernorate: z
      .string({
        required_error: "محافظة المستلم مطلوبة",
      })
      .refine((val) => val.trim() !== "", { message: "محافظة المستلم مطلوبة" }),
    receiverCity: z
      .string({
        required_error: "مدينة المستلم مطلوبة",
      })
      .refine((val) => val.trim().length > 0, {
        message: "مدينة المستلم مطلوبة",
      }),
    receiverAddress: z
      .string({
        required_error: "عنوان المستلم مطلوب",
      })
      .refine((val) => val.trim().length > 0, {
        message: "عنوان المستلم مطلوب",
      }),

    // Order Details
    description: z.string().optional(),
    orderSerialNumber: z.string().optional(),
    shippingCost: z.coerce
      .number()
      .positive("تكلفة الشحن يجب أن تكون رقم موجب"),

    codAmount: z.coerce
      .number()
      .positive("قيمة الدفع عند الاستلام يجب أن تكون رقم موجب"),

    quantity: z.coerce.number().min(1, "الكمية يجب أن تكون على الأقل 1"),
    serviceType: z.coerce
      .number({
        invalid_type_error: "يجب اختيار نوع خدمة صحيح",
      })
      .int("يجب اختيار نوع خدمة صحيح"),
    branchId: z.coerce
      .number({
        invalid_type_error: "يجب اختيار فرع صحيح",
      })
      .int("يجب اختيار فرع صحيح"),
    shipWithJT: z.boolean().optional(),
  })
  .strict();

const DEFAULT_SHIPPING_COST = 100;

export function NewOrder() {
  const axiosPrivate = useAxiosPrivate();
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const { branches, isLoading: loadingBranches } = useBranches();
  const { customers, isLoading: loadingCustomers } = useCustomers();
  const { serviceTypes, isLoading: loadingServiceTypes } = useServiceTypes();

  const isSender = hasRole(user, ROLES.SENDER);
  const [selectedCustomer, setSelectedCustomer] =
    useState<Option<string> | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [openMapDialog, setOpenMapDialog] = useState(false);
  const [setReceiverAddress, setSetReceiverAddress] = useState<
    ((val: string) => void) | null
  >(null);

  // Fetch customer details when selectedCustomer changes
  const {
    data: customerDetails,
    isLoading: isLoadingCustomerDetails,
  }: UseQueryResult<FetchUserResponse["Result"]> = useQuery({
    queryKey: ["customerDetails", selectedCustomer?.value],
    queryFn: () =>
      axiosPrivate
        .get(`${ApiUrls.fetchUserById}${selectedCustomer?.value}`)
        .then((res) => res.data.Result),
    enabled: !!selectedCustomer?.value,
  });

  const branchOptions = useMemo(
    () => toOptions(branches || [], "name", "id"),
    [branches]
  );
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

  const getCustomerOption = useCallback(
    (value?: string): Option<string> | null => {
      // is sender: find the customer from the customers list by phone number then create an option object
      if (isSender) {
        const customer = customers?.find(
          (c) => c.phoneNumber === user?.phoneNumber
        );
        if (customer) {
          return {
            label: `${customer.name} - ${customer.phoneNumber}`,
            value: customer.id,
          };
        }
      } else {
        const option = customersOptions.find(
          (option) => option.label === value
        );
        if (option) {
          return option;
        }
      }

      return null;
    },
    [isSender, customers, user, customersOptions]
  );

  // Set selectedCustomer for SENDER users once customers data is loaded
  useEffect(() => {
    if (isSender && customers && !selectedCustomer) {
      const customerOption = getCustomerOption();
      if (customerOption) {
        setSelectedCustomer(customerOption);
      }
    }
  }, [isSender, customers, selectedCustomer, getCustomerOption]);

  const governorateCities = (governorateName_ar: string) => {
    const subregions = getSubregionsByGovernorateName_ar(governorateName_ar);
    return subregions.map((subregion) => ({
      label: subregion.name_ar,
      value: subregion.name_ar,
    }));
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateOrderRequest) =>
      createEntity(axiosPrivate, ApiUrls.createOrderRequest, data),
    onSuccess: () => {
      showToast("تم انشاء الطلب بنجاح", { type: "success" });
    },
    onError: () => {
      showToast("حدث خطأ أثناء إنشاء الطلب", { type: "error" });
    },
  });

  const handleSelectLocation = useCallback(
    ({ name }: Location) => {
      if (setReceiverAddress) {
        setReceiverAddress(name);
      }
      setOpenMapDialog(false);
    },
    [setReceiverAddress]
  );

  const JTExpressButton = () => {

    return (
      <Button
        type="button"
        variant="contained"
        disabled={true}
        sx={{
          color: "#302900",
          backgroundColor: "#ff00004d",
          opacity: "0.6", // disabled
          fontSize: 18,
          fontWeight: "bold",
          px: 4,
          py: 1.5,
          borderRadius: 2,
          minWidth: 160,
          transition: "all 0.3s ease",
          "&:hover": {
            color: "#fff",
            backgroundColor: "#843500",
            boxShadow: "0 4px 12px rgba(255, 0, 0, 0.3)",
            transform: "translateY(-2px)",
          },
          "&:disabled": {
            background: "linear-gradient(45deg, #B0BEC5 30%, #CFD8DC 90%)",
            color: "text.disabled",
          },
        }}
        endIcon={
          <img
            src="/J&T_Express_logo.svg"
            alt="J&T Express"
            style={{
              height: 24,
            }}
          />
        }
      >
        {"اضافة و شحن مع"}
      </Button>
    );
  };

  const fields: FieldConfig<CreateOrderRequest>[] = [
    // Sender Details
    {
      name: "senderName",
      label: "اسم الراسل",
      fullWidth: true,
      required: !isSender,
      customRender: (value, onChange, { error }) => (
        <Box>
          <Autocomplete
            options={customersOptions}
            value={getCustomerOption(value)}
            onChange={(_, newValue: Option<string> | null) => {
              setSelectedCustomer(newValue);
              onChange(newValue?.label ?? "");
            }}
            getOptionLabel={(option) => {
              const customer = customers?.find((c) => c.id === option.value);
              return customer
                ? `${customer.name} - ${customer.phoneNumber}`
                : option.label;
            }}
            disabled={isSender}
            aria-required={!isSender}
            noOptionsText="لا يوجد راسلين متاحين"
            renderInput={(params) => (
              <TextField
                {...params}
                label="اسم الراسل"
                required={!isSender}
                error={!!error}
                helperText={error}
              />
            )}
          />
          {isLoadingCustomerDetails && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 120,
                gap: 2,
                color: "#64748b",
              }}
            >
              <CircularProgress size={24} color="inherit" />
              <Typography variant="body2" sx={{ ml: 2 }}>
                جاري تحميل تفاصيل العميل...
              </Typography>
            </Box>
          )}
          {customerDetails && !isLoadingCustomerDetails && (
            <Box mt={2}>
              <Button
                variant="outlined"
                startIcon={
                  showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />
                }
                onClick={() => setShowDetails(!showDetails)}
                sx={{
                  mb: 1,
                  color: "#3b82f6",
                  borderColor: "#3b82f6",
                  "&:hover": {
                    backgroundColor: "#e5e7eb",
                    borderColor: "#2563eb",
                  },
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                {showDetails ? "إخفاء تفاصيل الراسل" : "إظهار تفاصيل الراسل"}
              </Button>
              <Collapse in={showDetails}>
                <Paper
                  elevation={3}
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#f9fafb",
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 500, color: "#1e293b" }}
                  >
                    تفاصيل الراسل
                  </Typography>
                  <List dense>
                    <ListItem
                      sx={{
                        py: 1,
                        "&:hover": {
                          backgroundColor: "#e5e7eb",
                          borderRadius: 1,
                          cursor: "pointer",
                        },
                        transition: "background-color 0.2s",
                      }}
                      onClick={() =>
                        navigator.clipboard
                          .writeText(customerDetails.governorate)
                          .then(() =>
                            showToast("تم نسخ المحافظة", { type: "success" })
                          )
                      }
                    >
                      <ListItemIcon>
                        <MapIcon sx={{ color: "#3b82f6" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="المحافظة"
                        secondary={customerDetails.governorate || "غير متوفر"}
                        slotProps={{
                          primary: {
                            fontWeight: 500,
                            color: "#1e293b",
                          },
                          secondary: {
                            color: "#475569",
                          },
                        }}
                      />
                    </ListItem>
                    <ListItem
                      sx={{
                        py: 1,
                        "&:hover": {
                          backgroundColor: "#e5e7eb",
                          borderRadius: 1,
                          cursor: "pointer",
                        },
                        transition: "background-color 0.2s",
                      }}
                      onClick={() =>
                        navigator.clipboard
                          .writeText(customerDetails.city)
                          .then(() =>
                            showToast("تم نسخ المدينة", { type: "success" })
                          )
                      }
                    >
                      <ListItemIcon>
                        <LocationCityIcon sx={{ color: "#3b82f6" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="المدينة"
                        secondary={customerDetails.city || "غير متوفر"}
                        slotProps={{
                          primary: {
                            fontWeight: 500,
                            color: "#1e293b",
                          },
                          secondary: {
                            color: "#475569",
                          },
                        }}
                      />
                    </ListItem>
                    <ListItem
                      sx={{
                        py: 1,
                        "&:hover": {
                          backgroundColor: "#e5e7eb",
                          borderRadius: 1,
                          cursor: "pointer",
                        },
                        transition: "background-color 0.2s",
                      }}
                      onClick={() =>
                        navigator.clipboard
                          .writeText(customerDetails.address)
                          .then(() =>
                            showToast("تم نسخ العنوان", { type: "success" })
                          )
                      }
                    >
                      <ListItemIcon>
                        <PlaceIcon sx={{ color: "#3b82f6" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="العنوان"
                        secondary={customerDetails.address || "غير متوفر"}
                        slotProps={{
                          primary: {
                            fontWeight: 500,
                            color: "#1e293b",
                          },
                          secondary: {
                            color: "#475569",
                          },
                        }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Collapse>
            </Box>
          )}
        </Box>
      ),
    },

    // Receiver Details
    {
      name: "receiverName",
      label: "اسم المستلم",
      type: "text",
      required: true,
      fullWidth: true,
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
          aria-required
          noOptionsText="لا يوجد محافظات متاحة"
          renderInput={(params) => (
            <TextField
              {...params}
              label="محافظة المستلم"
              required
              aria-required
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
            aria-required
            noOptionsText="لا يوجد مدن متاحة"
            renderInput={(params) => (
              <TextField
                {...params}
                label="مدينة المستلم"
                required
                aria-required
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
      section: "تفاصيل المستلم",
      customRender: (value, onChange, { error, disabled }) => {
        return (
          <>
            <TextField
              label="عنوان المستلم"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              error={!!error}
              helperText={error}
              disabled={disabled}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <Tooltip
                      title="اختر موقع من الخريطة"
                      arrow
                      placement="top"
                      enterDelay={500}
                      leaveDelay={200}
                    >
                      <span>
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => {
                              // stash away this onChange
                              setSetReceiverAddress(() => onChange);
                              // open the map dialog
                              setOpenMapDialog(true);
                            }}
                            disabled={disabled}
                            size="small"
                          >
                            <MapIcon />
                          </IconButton>
                        </InputAdornment>
                      </span>
                    </Tooltip>
                  ),
                },
              }}
            />
          </>
        );
      },
    },

    // Order Details
    {
      name: "shippingCost",
      label: "تكلفة الشحن",
      type: "number",
      registerOptions: {
        required: true,
        valueAsNumber: true,
        setValueAs: (v) => (v === "" ? undefined : Number(v)),
      },
      required: true,
      fullWidth: true,
      disabled: !hasAnyRole(user, [ROLES.ADMIN, ROLES.OPERATION]),
      section: "تفاصيل الشحنه",
    },
    {
      name: "codAmount",
      label: "قيمة الدفع عند الاستلام",
      type: "number",
      registerOptions: {
        required: true,
        valueAsNumber: true,
        setValueAs: (v) => (v === "" ? undefined : Number(v)),
      },
      required: true,
      fullWidth: true,
      section: "تفاصيل الشحنه",
    },
    {
      name: "quantity",
      label: "الكمية",
      type: "number",
      registerOptions: {
        required: true,
        valueAsNumber: true,
        setValueAs: (v) => (v === "" ? undefined : Number(v)),
      },
      required: true,
      fullWidth: true,
      section: "تفاصيل الشحنه",
    },
    {
      name: "orderSerialNumber",
      label: "رقم الطلب التسلسلي",
      type: "text",
      fullWidth: true,
      section: "تفاصيل الشحنه",
    },
    {
      name: "serviceType",
      label: "نوع الخدمة",
      customRender: (value, onChange) => (
        <TextField
          select
          required
          label="نوع الخدمة"
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
      name: "branchId",
      label: "الفرع",
      customRender: (value, onChange) => (
        <TextField
          select
          disabled
          required
          label="الفرع"
          value={value ?? branchOptions[0].value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
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
    {
      name: "shipWithJT",
      label: "شحن مع J&T",
      type: "checkbox",
      customRender: () => undefined,
    },
  ];

  const onSubmitHandler = async (data: CreateOrderRequest) => {
    if (!isSender && selectedCustomer === null) {
      showToast("يرجى اختيار اسم الراسل", { type: "error" });
      return;
    }
    if (!customerDetails) {
      showToast("لم يتم العثور على تفاصيل العميل", { type: "error" });
      return;
    }

    try {
      data.senderId = customerDetails.id;
      data.senderName = customerDetails.fullName;
      data.senderGovernorate = customerDetails.governorate;
      data.senderCity = customerDetails.city;
      data.senderAddress = customerDetails.address;

      await createMutation.mutateAsync(data);
    } catch (error: any) {
      handleError(error);
    }
  };

  if (loadingBranches || loadingServiceTypes || loadingCustomers)
    return <PageLoader text="يتم تحميل البيانات" />;

  return (
    <Box>
      <MapLocationPicker
        open={openMapDialog}
        onClose={() => setOpenMapDialog(false)}
        onSelectLocation={handleSelectLocation}
      />
      <EntityForm<CreateOrderRequest>
        mode="create"
        triggerMode="all"
        schema={createOrderSchema}
        fields={fields}
        onSubmitHandler={onSubmitHandler}
        initialValues={{
          senderName: "",
          receiverName: "",
          phoneNumber1: "",
          phoneNumber2: "",
          receiverGovernorate: "",
          receiverCity: "",
          receiverAddress: "",
          shippingCost: DEFAULT_SHIPPING_COST,
          codAmount: 0,
          quantity: 1,
          orderSerialNumber: "",
          serviceType: serviceTypesOptions[0]?.value ?? "",
          branchId: branchOptions[0]?.value ?? "",
          description: "",
          shipWithJT: false,
        }}
        resetAfterSubmit={true}
        keepAfterReset={["senderName"]}
        sectionLayouts={{
          default: {
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
          title: "شحنه جديده",
          createButtonText: "اضافة",
        }}
        customButtons={<JTExpressButton />}
      />
    </Box>
  );
}
