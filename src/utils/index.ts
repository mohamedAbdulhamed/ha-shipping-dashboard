import { toast } from "react-toastify";
import { colorsType, ROLES } from "../types/index.ts";
import { Switch, SxProps } from "@mui/material";
import { styled, Theme } from "@mui/system";
import { UserRole } from "../entities/User";
import dayjs, { Dayjs } from "dayjs";
import { FetchOrderResponse, UpdateOrderRequest } from "@/types/dtos/Order.dto.ts";
import { AuthenticaedUser, Token } from "@/store/authStore.ts";
import { FetchUserResponse, UpdateUserRequest } from "@/types/dtos/User.dto.ts";

export const inputStyles = (
  colors: colorsType,
  compinedStyles: SxProps<Theme> = {}
) => ({
  "& .MuiInputLabel-root": { color: colors.primary[200] },
  "& .MuiInputBase-root": { color: colors.primary[200] },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: colors.blueAccent[300], // Default border color
    },
    "&:hover fieldset": {
      borderColor: colors.blueAccent[500], // Border color on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: colors.primary[200], // Border color when focused
    },
  },
  "& .MuiFormLabel-root": {
    color: colors.primary[200], // Label color
  },
  "& .MuiIconButton-root.MuiIconButton-sizeMedium.MuiAutocomplete-popupIndicator.css-10sixfi-MuiButtonBase-root-MuiIconButton-root-MuiAutocomplete-popupIndicator":
    {
      color: colors.primary[200], // Label color
    },
  "& .MuiButtonBase-root.MuiIconButton-root.MuiIconButton-sizeMedium.MuiAutocomplete-clearIndicator.css-1cleyyo-MuiButtonBase-root-MuiIconButton-root-MuiAutocomplete-clearIndicator":
    {
      color: colors.primary[200], // Label color
    },
  ...compinedStyles,
});

export const gridColumnStyles = (
  colors: colorsType,
  columns: number = 2,
  compinedStyles: SxProps<Theme> = {}
) => ({
  ...inputStyles(colors, compinedStyles),
  gridColumn: `span ${columns}`,
});

type SeverityLevel = "error" | "warning" | "info" | "success";

export const handleError = (
  err: any,
  // defaultMessage: string = "فشلت العملية.",
  notFoundMessage: string = "الكيانات غير موجودة.",
  severity: SeverityLevel = "error"
) => {
  const ignoreErrors = ["AbortError", "NetworkError", "CanceledError"];
  if (ignoreErrors.includes(err.name)) return;

  if (err?.code === "ERR_NETWORK") {
    // online mode
    // toast.error("حدث خطأ في الشبكة، يرجى التحقق من الإتصال بالإنترنت.");

    // local mode
    toast.error("لا يمكن التواصل مع السيرڤر, تواصل مع الدعم الفني.");
  }

  const message =
    err.response?.data?.ErrorMessage ||
    (err.response?.status === 404 ? notFoundMessage : null);

  if (message === null) return;

  switch (severity) {
    case "warning":
      toast.warning(message);
      break;
    case "info":
      toast.info(message);
      break;
    case "success":
      toast.success(message);
      break;
    default:
      toast.error(message);
      break;
  }

  // a more simpler way
  // const toastFn = {
  //   error: toast.error,
  //   warning: toast.warning,
  //   info: toast.info,
  //   success: toast.success,
  // }[severity];

  // toastFn(message);
};

export const truncateString = (
  str?: string,
  maxLength: number = 30
): string => {
  if (!str) return "";
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};

export const formatDateToDateOnly = (date: Date) => {
  return date.toISOString().split("T")[0];
};

export const GRID_PARENT_SX = (
  colors: colorsType,
  compinedStyles: SxProps<Theme> = {}
) => ({
  "& .MuiDataGrid-root": {
    border: "none",
  },
  "& .MuiDataGrid-cell": {
    borderBottom: "none",
    direction: "rtl",
    textAlign: "right",
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: colors.blueAccent[700],
    borderBottom: "none",
  },
  "& .green-column--cell, & .green-column--header": {
    color: colors.greenAccent[300],
  },
  "& .red-column--cell, & .red-column--header": {
    color: colors.redAccent[500],
  },
  "& .blue-column--cell, & .blue-column--header": {
    backgroundColor: "rgba(0, 0, 255, 0.15)",
    color: "#00008b",
  },
  "& .purple-column--cell, & .purple-column--header": {
    backgroundColor: "rgba(128, 0, 128, 0.15)",
    color: "#4b0082",
  },
  "& .bold-cell": {
    fontWeight: "bold",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  "& .first-row": {
    backgroundColor: colors.grey[800],
  },
  "& .rtl": {
    direction: "rtl",
    textAlign: "right",
  },
  "& .MuiDataGrid-virtualScroller": {
    backgroundColor: colors.primary[400],
  },
  "& .MuiDataGrid-footerContainer": {
    direction: "ltr",
    borderTop: "none",
    backgroundColor: colors.blueAccent[700],
  },
  "& .MuiCheckbox-root": {
    color: colors.greenAccent[200],
  },
  "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
    color: colors.grey[100],
  },
  "& .MuiCircularProgress-root": {
    color: colors.greenAccent[200],
  },
  ...compinedStyles,
});

interface ApiResponseItem {
  [key: string]: any;
}

interface MappedItem {
  value: any;
  label: any;
}

export const mapApiResponse = (
  data: ApiResponseItem[],
  valueKey: string,
  labelKey: string
): MappedItem[] =>
  data.map((item) => ({
    value: item[valueKey],
    label: item[labelKey],
  }));

type AntSwitchProps = {
  theme: Theme & {
    transitions: { create: (args: string[], options: object) => string };
  };
};

export const AntSwitch = styled(Switch)(({ theme }: AntSwitchProps) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#1890ff",
        ...theme.applyStyles("dark", {
          backgroundColor: "#177ddc",
        }),
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions?.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: "rgba(0,0,0,.25)",
    boxSizing: "border-box",
    ...theme.applyStyles("dark", {
      backgroundColor: "rgba(255,255,255,.35)",
    }),
  },
}));

export const hasRole = (user?: AuthenticaedUser | null, role?: UserRole): boolean => {
  // Check for valid user object
  if (!user || !user.role) return false;

  // Check for valid role argument
  if (!role || !Object.values(ROLES).includes(role)) {
    console.error("Invalid role check requested");
    return false;
  }

  // Type-safe comparison
  return user.role === role;
};

export const hasAnyRole = (user?: AuthenticaedUser | null, roles?: UserRole[]): boolean => {
  // Check if user has ANY of the provided roles

  // Check for valid user object.
  if (!user || !user.role) return false;

  // Check for valid roles array.
  if (!roles || roles.length === 0) {
    console.error("Invalid roles check requested");
    return false;
  }

  // Type-safe comparison: check if any of the provided roles is valid and matches the user's role.
  return roles.some((role) => Object.values(ROLES).includes(role) && user.role === role);
};

export const isAuthenticated = (user?: AuthenticaedUser | null, token?: Token | null) => {
  return user !== null && token !== null;
};

type convertToIdProps = {
  value: string | number | null;
  referenceData: { value: string; label: string }[];
};

/**
 * Converts a given value to its corresponding ID using reference data.
 *
 * @param {string | number | null | undefined} value - The value to convert (either a label or an ID).
 * @param {Array<{ label: string, value: number | string }>} referenceData - The reference data array.
 * @returns {number | string | null | undefined} - The corresponding ID if found, or the original value.
 */
export const convertToId = ({
  value,
  referenceData,
}: convertToIdProps): number | string | null | undefined => {
  if (!value) {
    console.error("No value provided");
    return value;
  }

  // Validate reference data format
  if (!Array.isArray(referenceData)) {
    console.error("Invalid reference data format");
    return value;
  }

  if (typeof value === "string") {
    const found = referenceData.find((item) => item.label === value);
    if (found) {
      return found.value;
    } else {
      console.warn(`ID ${value} not found in reference data`);
      return value;
    }
  }
  return value; // Already a number or other type; return as-is
};

const formatDateHelper = (
  date: string | Dayjs,
  formatString: string,
  returnType: "string" | "date"
): string | Date => {
  if (!date) return "_";

  const d = typeof date === "string" ? dayjs(date) : date;
  return returnType === "string" ? d.format(formatString) : d.toDate();
};

type FormatDateProps = {
  date: string | Dayjs;
  format: "string" | "date";
};

export const formatDate = ({
  date,
  format,
}: FormatDateProps): string | Date => {
  return formatDateHelper(date, "YYYY-MM-DD", format);
};

type FormatDateTimeProps = {
  date: string | Dayjs;
  format: "string" | "date";
};

export const formatDateTime = ({
  date,
  format,
}: FormatDateTimeProps): string | Date => {
  return formatDateHelper(date, "YYYY-MM-DD HH:mm:ss", format);
};

/**
 * Extracts an ID from a given pathname based on a defined route pattern.
 *
 * This function supports numeric and string-based IDs, including GUIDs. It also
 * allows specifying reserved words (e.g., "new") that should not be interpreted as IDs.
 *
 * @param pattern - The route pattern containing a dynamic `:id` placeholder
 *   (e.g., "/users/:id").
 * @param pathname - The actual URL path from which to extract the ID
 *   (e.g., "/users/123" or "/users/550e8400-e29b-41d4-a716-446655440000").
 * @param reservedWords - An array of words that should not be treated as an ID
 *   (default: `["new"]`).
 * @returns The extracted ID as a string if a valid match is found; otherwise, `null`.
 *
 * @example
 * extractIdFromPath("/users/:id", "/users/123"); // "123"
 * extractIdFromPath("/users/:id", "/users/550e8400-e29b-41d4-a716-446655440000"); // "550e8400-e29b-41d4-a716-446655440000"
 * extractIdFromPath("/users/:id", "/users/new"); // null (reserved word)
 * extractIdFromPath("/users/:id", "/users/create", ["new", "create"]); // null (custom reserved word)
 */
export function extractIdFromPath(
  pattern: string,
  pathname: string,
  reservedWords: string[] = ["new"]
): string | null {
  // Extract the last segment of the pathname
  const lastSegment = pathname.split("/").pop();
  if (!lastSegment || reservedWords.includes(lastSegment)) return null;

  // Flexible ID regex: Matches numbers OR GUIDs OR alphanumeric strings
  const idRegex = "[0-9a-fA-F-]+";

  // Convert pattern into regex by replacing `:id` placeholders
  const regex = new RegExp(
    "^" + pattern.replace(/:[^/]+/g, `(${idRegex})`) + "$"
  );
  const match = pathname.match(regex);

  return match ? match[1] : null;
}

export const retryWithBackoff = async <T = unknown,>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
  factor: number = 2
): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    if ((err as any)?.name === "CanceledError" || (err as any)?.code === "ERR_CANCELED") {
      throw err;
    }
    const status = (err as any)?.response?.status;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      throw err;
    }
    if (retries <= 0) throw err;
    await new Promise((res) => setTimeout(res, delay));
    return retryWithBackoff(fn, retries - 1, delay * factor, factor);
  }
};

export function mapOrderToInitialValues(order: FetchOrderResponse["Result"]): UpdateOrderRequest {
  return {
    senderName: order.senderName,
    senderGovernorate: order.senderGovernorate,
    senderCity: order.senderCity,
    senderAddress: order.senderAddress,

    receiverName: order.receiverName,
    phoneNumber1: order.phoneNumber1,
    phoneNumber2: order.phoneNumber2 ?? "",
    receiverGovernorate: order.receiverGovernorate,
    receiverCity: order.receiverCity,
    receiverAddress: order.receiverAddress,

    description: order.description ?? "",
    shippingCost: order.shippingCost,
    codAmount: order.codAmount,
    quantity: order.quantity,
    serviceType: 0, //order.serviceType
  };
}

export function mapUserToInitialValues(user: FetchUserResponse["Result"]): UpdateUserRequest {
  return {
    fullName: user.fullName,
    membershipCode: user.membershipCode,
    phoneNumber: user.phoneNumber,
    branchId: user.branchId,
  };
}

// in utils.ts or wherever
export type Option<V> = { label: string; value: V };

export function toOptions<
  T,
  LabelKey extends keyof T,
  ValueKey extends keyof T
>(
  items: T[],
  labelKey: LabelKey,
  valueKey: ValueKey
): Option<T[ValueKey]>[] {
  return items.map(item => ({
    label: String(item[labelKey]),   // we force it to string for the label
    value: item[valueKey],           // and preserve the real type for value
  }));
}
