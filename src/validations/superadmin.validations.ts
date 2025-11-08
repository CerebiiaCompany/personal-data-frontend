import { UserRole, DocType } from "@/types/user.types";
import * as z from "zod";
import { dateTimeLocalValidation } from "./main.validations";
import { PlanPeriodType } from "@/types/plan.types";

export const createCompanyValidationSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio"),
  nit: z.string().min(1, "Este campo es obligatorio"),
  manager: z.object({
    name: z.string().min(1, "Este campo es obligatorio"),
    docNumber: z.string().min(1, "Este campo es obligatorio"),
    docType: z.string<DocType>(),
  }),
  email: z.email("Correo inválido").min(1, "Este campo es obligatorio"),
  phone: z.string().min(1, "Este campo es obligatorio"),
  planId: z.string().min(1, "Este campo es obligatorio"),
});

export const createCompanyPaymentValidationSchema = z.object({
  planId: z.string().min(1, "Este campo es obligatorio"),
  companyId: z.string().min(1, "Este campo es obligatorio"),
  period: z.object({
    start: dateTimeLocalValidation,
    end: dateTimeLocalValidation,
  }),
  periodType: z.string<PlanPeriodType>(),
});
