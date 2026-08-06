import { DocType } from "@/types/user.types";
import {
  isValidRut,
  normalizeRut,
  RUT_INVALID_MESSAGE,
} from "@/utils/rutValidator";
import * as z from "zod";
import { dateTimeLocalValidation } from "./main.validations";
import { PlanPeriodType } from "@/types/plan.types";

export const createCompanyValidationSchema = z
  .object({
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
    countryCode: z.enum(["CO", "CL"], "Selecciona un país"),
    // El admin de la empresa se crea junto con ella — activa su cuenta
    // después desde /login con el correo de arriba + un código enviado a ese
    // correo. No se pide contraseña acá: nunca la define el superadmin.
    adminName: z.string().min(1, "Este campo es obligatorio"),
    adminLastName: z.string().min(1, "Este campo es obligatorio"),
  })
  .superRefine((data, ctx) => {
    if (data.countryCode === "CL") {
      if (!isValidRut(data.nit)) {
        ctx.addIssue({
          code: "custom",
          path: ["nit"],
          message: RUT_INVALID_MESSAGE,
        });
      }
    }

    const managerDocType = data.manager.docType;
    if (managerDocType === "RUT" || managerDocType === "CI") {
      if (!isValidRut(data.manager.docNumber)) {
        ctx.addIssue({
          code: "custom",
          path: ["manager", "docNumber"],
          message: RUT_INVALID_MESSAGE,
        });
      }
    }
  })
  .transform((data) => {
    if (data.countryCode === "CL") {
      return {
        ...data,
        nit: normalizeRut(data.nit),
        manager: {
          ...data.manager,
          docNumber:
            data.manager.docType === "RUT" || data.manager.docType === "CI"
              ? normalizeRut(data.manager.docNumber)
              : data.manager.docNumber,
        },
      };
    }

    if (data.manager.docType === "RUT" || data.manager.docType === "CI") {
      return {
        ...data,
        manager: {
          ...data.manager,
          docNumber: normalizeRut(data.manager.docNumber),
        },
      };
    }

    return data;
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
