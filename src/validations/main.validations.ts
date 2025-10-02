import { AnswerType, DataType } from "@/types/collectForm.types";
import { DocType, UserRole } from "@/types/user.types";
import * as z from "zod";
import {
  CampaignGoal,
  CampaignDeliveryChannel,
  CampaignAudienceGender,
} from "@/types/campaign.types";
import { CountryIsoCode } from "@/types/companyArea.types";

export const createCollectFormValidationSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio"),
  description: z.string(),
  marketingChannels: z.object({
    SMS: z.boolean(),
    EMAIL: z.boolean(),
    WHATSAPP: z.boolean(),
  }),
  questions: z.array(
    z.object({
      title: z.string().min(1, "Este campo es obligatorio"),
      answerType: z.string<AnswerType>(),
      dataType: z.string<DataType>(),
      order: z.number(),
    })
  ),
});

export const updateUserValidationSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio"),
  lastName: z.string().min(1, "Este campo es obligatorio"),
  username: z.string().min(1, "Este campo es obligatorio"),
  role: z.string<UserRole>(),
  companyUserData: z.object({
    position: z.string().min(1, "Este campo es obligatorio"),
    phone: z.string().min(1, "Este campo es obligatorio"),
    personalEmail: z
      .email("Correo inválido")
      .min(1, "Este campo es obligatorio"),
    companyAreaId: z.string().min(1, "Este campo es obligatorio"),
    /* companyRoleId: z.string().min(1, "Este campo es obligatorio"), */
    note: z.string().optional(),
    docNumber: z.coerce.number("Este campo es obligatorio"),
    docType: z.string<DocType>(),
  }),
});

export const createUserValidationSchema = updateUserValidationSchema.extend({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const createCompanyAreaValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nombre obligatorio")
    .max(80, "Máximo 80 caracteres"),
  users: z.array(z.string()).min(0).optional(),
  country: z.string<CountryIsoCode>(),
  state: z
    .string()
    .trim()
    .min(1, "Estado/Depto obligatorio")
    .max(80, "Máximo 80 caracteres"),
  city: z
    .string()
    .trim()
    .min(1, "Ciudad obligatoria")
    .max(80, "Máximo 80 caracteres"),
  address: z
    .string()
    .trim()
    .min(1, "Dirección obligatoria")
    .max(180, "Máximo 180 caracteres"),
  tags: z.array(z.string().trim().min(0)).max(20, "Máximo 20 etiquetas"),
});

export const createCompanyRoleValidationSchema = z.object({
  position: z.string().min(1, "Este campo es obligatorio"),
  description: z.string().min(1, "Este campo es obligatorio"),
  permissions: z.object({
    dashboard: z.object({
      view: z.boolean(),
    }),
    collect: z.object({
      create: z.boolean(),
      view: z.boolean(),
      edit: z.boolean(),
    }),
    templates: z.object({
      create: z.boolean(),
      view: z.boolean(),
    }),
    classification: z.object({
      create: z.boolean(),
      view: z.boolean(),
      edit: z.boolean(),
    }),
    campaigns: z.object({
      create: z.boolean(),
      view: z.boolean(),
      send: z.boolean(),
    }),
  }),
});

export const createCampaignValidationSchema = z.object({
  name: z
    .string()
    .min(1, "Este campo es obligatorio")
    .max(80, "Máximo 80 caracteres"),
  goal: z.string<CampaignGoal>("Selecciona un objetivo"),
  active: z.boolean().optional(),
  scheduling: z
    .object({
      startDate: z.coerce.date({
        error: "Fecha de inicio inválida",
      }),
      endDate: z.coerce.date({
        error: "Fecha de fin inválida",
      }),
      ocurrences: z
        .number({ error: "Número de ocurrencias obligatorio" })
        .int("Debe ser un entero")
        .min(1, "Mínimo 1")
        .max(365, "Máximo 365"),
    })
    .refine(({ startDate, endDate }) => endDate > startDate, {
      message: "La fecha de fin debe ser posterior a la de inicio",
      path: ["endDate"],
    }),
  sourceFormIds: z
    .array(z.string().min(1, "ID inválido"))
    .nonempty("Selecciona al menos un formulario"),
  deliveryChannel: z.string<CampaignDeliveryChannel>(
    "Selecciona una ruta de envío"
  ),
  audience: z
    .object({
      minAge: z.coerce
        .number({ error: "Edad mínima obligatoria" })
        .int("Debe ser entero")
        .min(13, "Mínimo 13"),
      maxAge: z.coerce
        .number({ error: "Edad máxima obligatoria" })
        .int("Debe ser entero")
        .max(120, "Máximo 120"),
      gender: z.string<CampaignAudienceGender>("Selecciona una opción"),
    })
    .refine(({ minAge, maxAge }) => maxAge >= minAge, {
      message: "La edad máxima debe ser ≥ a la mínima",
      path: ["maxAge"],
    }),
  content: z.object({
    name: z
      .string({ error: "Nombre de contenido obligatorio" })
      .min(1, "Nombre de contenido obligatorio")
      .max(100, "Máximo 100 caracteres"),
    bodyText: z
      .string({ error: "Texto obligatorio" })
      .min(1, "Texto obligatorio")
      .max(1000, "Máximo 1000 caracteres"),
    link: z.url("Link inválido").or(z.literal("")).optional(),
    imageUrl: z.url({ error: "URL de imagen inválida" }).optional(),
  }),
});
