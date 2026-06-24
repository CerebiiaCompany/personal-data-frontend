import { FieldErrors } from "react-hook-form";
import { z } from "zod";
import {
  CampaignAudienceSelectionMode,
  CampaignDeliveryChannel,
  CampaignGoal,
} from "@/types/campaign.types";
import { createScheduledCampaignValidationSchema } from "@/validations/main.validations";

export type ScheduledCampaignFormValues = z.infer<
  typeof createScheduledCampaignValidationSchema
>;

export interface ScheduledCampaignWizardContext {
  audienceLoading: boolean;
  audienceError: string | null;
  effectiveAudienceCount: number;
}

export interface StepValidationResult {
  canProceed: boolean;
  messages: string[];
}

const CAMPAIGN_GOALS: CampaignGoal[] = [
  "INTERACTION",
  "POTENTIAL_CUSTOMERS",
  "SALES",
  "PROMOTION",
  "OTHER",
];

const DELIVERY_CHANNELS: CampaignDeliveryChannel[] = ["SMS", "EMAIL"];

export function getScheduledCampaignStepFields(
  step: number,
  audienceSelectionMode: CampaignAudienceSelectionMode
): string[] {
  if (step === 1) {
    return ["goal", "deliveryChannel", "sourceFormIds"];
  }
  if (step === 2) {
    return audienceSelectionMode === "MANUAL"
      ? ["targetedResponseIds", "audience.count", "audienceSelectionMode"]
      : [
          "audience.minAge",
          "audience.maxAge",
          "audience.gender",
          "audience.count",
        ];
  }
  if (step === 3) {
    return [
      "content.name",
      "content.bodyText",
      "content.link",
      "name",
      "scheduling.scheduledDateTime",
    ];
  }
  return [];
}

function normalizeOptionalUrl(value?: string): boolean {
  const raw = value?.trim();
  if (!raw) return true;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return z.string().url().safeParse(candidate).success;
}

function isScheduledDateTimeValid(value?: string): string | null {
  if (!value?.trim()) return "Fecha y hora de envío obligatorias";
  if (
    !/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$/.test(value.trim())
  ) {
    return "Formato de fecha y hora inválido";
  }
  const selected = new Date(value);
  if (Number.isNaN(selected.getTime())) return "Fecha y hora inválidas";
  const minDateTime = new Date(Date.now() + 5 * 60 * 1000);
  if (selected < minDateTime) {
    return "La campaña debe programarse al menos 5 minutos en el futuro";
  }
  return null;
}

export function evaluateScheduledCampaignStep(
  step: number,
  values: Partial<ScheduledCampaignFormValues>,
  ctx: ScheduledCampaignWizardContext
): StepValidationResult {
  const messages: string[] = [];

  if (step === 1) {
    if (!values.goal || !CAMPAIGN_GOALS.includes(values.goal)) {
      messages.push("Selecciona un objetivo");
    }
    if (
      !values.deliveryChannel ||
      !DELIVERY_CHANNELS.includes(values.deliveryChannel)
    ) {
      messages.push("Selecciona un canal de envío");
    }
    if (!values.sourceFormIds?.length) {
      messages.push("Selecciona al menos un formulario");
    }
    return { canProceed: messages.length === 0, messages };
  }

  if (step === 2) {
    if (ctx.audienceLoading) {
      return {
        canProceed: false,
        messages: ["Espera mientras calculamos la audiencia"],
      };
    }
    if (ctx.audienceError) {
      messages.push(ctx.audienceError);
    }

    const mode = values.audienceSelectionMode ?? "FILTERS";

    if (mode === "MANUAL") {
      if (!values.targetedResponseIds?.length) {
        messages.push("Selecciona al menos una persona");
      }
    } else {
      const minAge = Number(values.audience?.minAge);
      const maxAge = Number(values.audience?.maxAge);
      if (!Number.isFinite(minAge)) {
        messages.push("Edad mínima obligatoria");
      }
      if (!Number.isFinite(maxAge)) {
        messages.push("Edad máxima obligatoria");
      }
      if (Number.isFinite(minAge) && minAge < 0) {
        messages.push("La edad mínima no puede ser negativa");
      }
      if (Number.isFinite(maxAge) && maxAge > 120) {
        messages.push("La edad máxima no puede superar 120 años");
      }
      if (Number.isFinite(minAge) && Number.isFinite(maxAge) && minAge > maxAge) {
        messages.push("La edad máxima debe ser mayor o igual a la mínima");
      }
      if (!values.audience?.gender) {
        messages.push("Selecciona el género de la audiencia");
      }
      if (ctx.effectiveAudienceCount < 1) {
        messages.push("No hay personas en el rango seleccionado");
      }
    }

    if (ctx.effectiveAudienceCount < 1 && messages.length === 0) {
      messages.push("La audiencia debe tener al menos una persona");
    }

    return { canProceed: messages.length === 0, messages };
  }

  if (step === 3) {
    const contentName = values.content?.name?.trim() ?? "";
    const bodyText = values.content?.bodyText?.trim() ?? "";
    const campaignName = values.name?.trim() ?? "";
    const link = values.content?.link;

    if (!contentName) messages.push("Nombre del anuncio obligatorio");
    if (contentName.length > 100) messages.push("Máximo 100 caracteres en el nombre del anuncio");
    if (!bodyText) messages.push("Texto principal obligatorio");
    if (bodyText.length > 1000) messages.push("Máximo 1000 caracteres en el texto");
    if (values.deliveryChannel === "SMS" && bodyText.length > 160) {
      messages.push("En SMS el texto admite máximo 160 caracteres");
    }
    if (!campaignName) messages.push("Nombre de la campaña obligatorio");
    if (campaignName.length > 80) messages.push("Máximo 80 caracteres en el nombre de la campaña");
    if (!normalizeOptionalUrl(link)) {
      messages.push("URL del enlace inválida");
    }

    const schedulingError = isScheduledDateTimeValid(
      values.scheduling?.scheduledDateTime
    );
    if (schedulingError) messages.push(schedulingError);

    return { canProceed: messages.length === 0, messages };
  }

  if (step === 4) {
    const parsed = createScheduledCampaignValidationSchema.safeParse(values);
    if (!parsed.success) {
      const unique = [
        ...new Set(parsed.error.issues.map((issue) => issue.message)),
      ];
      return { canProceed: false, messages: unique };
    }
    return { canProceed: true, messages: [] };
  }

  return { canProceed: true, messages: [] };
}

function getNestedErrorMessage(
  errors: FieldErrors<ScheduledCampaignFormValues>,
  path: string
): string | undefined {
  const parts = path.split(".");
  let current: unknown = errors;
  for (const part of parts) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  if (
    current &&
    typeof current === "object" &&
    "message" in current &&
    typeof (current as { message?: unknown }).message === "string"
  ) {
    return (current as { message: string }).message;
  }
  return undefined;
}

export function collectScheduledCampaignStepErrorMessages(
  errors: FieldErrors<ScheduledCampaignFormValues>,
  step: number,
  audienceSelectionMode: CampaignAudienceSelectionMode
): string[] {
  const fields = getScheduledCampaignStepFields(step, audienceSelectionMode);
  const messages: string[] = [];

  for (const field of fields) {
    const message = getNestedErrorMessage(errors, field);
    if (message) messages.push(message);
  }

  if (step === 2 && audienceSelectionMode === "MANUAL") {
    const targeted = errors.targetedResponseIds;
    if (
      targeted &&
      typeof targeted === "object" &&
      "message" in targeted &&
      typeof targeted.message === "string"
    ) {
      messages.push(targeted.message);
    }
  }

  return [...new Set(messages)];
}

export function inputErrorClass(hasError: boolean, baseClass: string): string {
  return hasError
    ? `${baseClass} border-red-500! bg-red-50/40! focus:border-red-500! focus:ring-red-500/20!`
    : baseClass;
}
