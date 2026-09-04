import { z } from "zod";
import { PHONE_REGEX } from "@/common/constants";

// Validation
export const trimmedString = () =>
  z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string());

export const trimmedStringWithErrors = (errorMsg: string) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string({ required_error: errorMsg, invalid_type_error: errorMsg })
  );

export const requiredNumber = (msg: string) =>
  z.coerce
    .number({ invalid_type_error: msg })
    .refine((n) => n > 0, { message: msg });

export const optionalPhone = () =>
  z
    .string()
    .optional()
    .refine((v) => !v?.trim() || PHONE_REGEX.test(v), {
      message: "رقم الهاتف غير صالح",
    });
