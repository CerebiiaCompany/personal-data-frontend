import {
  CampaignDeliveryChannel,
  WHATSAPP_NOTIFICATION_TEMPLATE_LANGUAGE,
  WHATSAPP_NOTIFICATION_TEMPLATE_NAME,
  WHATSAPP_TEMPLATE_LANGUAGE,
  WHATSAPP_TEMPLATE_NAME,
} from "@/types/campaign.types";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { FieldError, UseFormRegister, UseFormWatch } from "react-hook-form";
import { inputErrorClass } from "@/utils/createScheduledCampaignWizard.utils";
import {
  validateWhatsappFreeTextParam,
  WHATSAPP_FREE_TEXT_MAX_LENGTH,
} from "@/utils/whatsappTemplateValidation.utils";

const NAVY = "#1A2B5B";
const INPUT_CLASS =
  "w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0F172A] shadow-sm outline-none transition placeholder:text-[#94A3B8] " +
  "focus:border-[#1A2B5B] focus:bg-white focus:ring-2 focus:ring-[#1A2B5B]/12";

const cardClass =
  "rounded-xl border border-[#E8EDF7] bg-white p-6 sm:p-7 shadow-sm";

type ContentErrors = {
  name?: FieldError;
  bodyText?: FieldError;
  link?: FieldError;
};

interface Props {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  errors: import("react-hook-form").FieldErrors<any>;
  deliveryChannel: CampaignDeliveryChannel;
  highlightErrors?: boolean;
  /** Objetivo "Consentimiento": crea una campaña CONSENT_REQUEST real. */
  isConsentGoal?: boolean;
}

export default function CreateScheduledCampaignStep3({
  register,
  watch,
  errors,
  deliveryChannel,
  highlightErrors = false,
  isConsentGoal = false,
}: Props) {
  const contentErrors = errors.content as unknown as ContentErrors | undefined;
  const isNotificationWhatsapp = deliveryChannel === "WHATSAPP" && !isConsentGoal;
  const maxChars =
    deliveryChannel === "SMS"
      ? 160
      : isNotificationWhatsapp
        ? WHATSAPP_FREE_TEXT_MAX_LENGTH
        : 1000;
  const bodyText = watch("content.bodyText") ?? "";
  const bodyLen = typeof bodyText === "string" ? bodyText.length : 0;
  const bodyOverLimit = bodyLen > maxChars;
  const isConsentWhatsapp = isConsentGoal && deliveryChannel === "WHATSAPP";

  // La plantilla de notificación inserta este texto sin revisión previa de Meta —
  // se valida en vivo contra las mismas reglas que aplica el backend al crear/activar.
  const whatsappFreeTextValidation = isNotificationWhatsapp
    ? validateWhatsappFreeTextParam(bodyText)
    : null;

  const helperSuffix =
    deliveryChannel === "SMS"
      ? "1 SMS por destinatario"
      : isNotificationWhatsapp
        ? "Se envía como parámetro {{3}} de la plantilla de WhatsApp"
        : "1 correo por destinatario";

  // WhatsApp de consentimiento usa siempre la plantilla fija de Meta, sin parámetros
  // más allá del nombre del destinatario — no hay nada de contenido que pedir aquí.
  if (isConsentWhatsapp) {
    return (
      <section className={clsx(cardClass, "flex flex-col gap-4")}>
        <h2
          className="text-[15px] font-bold tracking-tight"
          style={{ color: NAVY }}
        >
          Contenido del anuncio
        </h2>
        <div className="flex flex-col gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="flex items-center gap-2">
            <Icon icon="tabler:brand-whatsapp" className="text-lg text-[#25D366]" />
            <span className="text-sm font-bold" style={{ color: NAVY }}>
              Plantilla: {WHATSAPP_TEMPLATE_NAME} ({WHATSAPP_TEMPLATE_LANGUAGE})
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            WhatsApp solo permite plantillas pre-aprobadas por Meta (no texto
            libre). Las campañas de consentimiento usan siempre esta plantilla
            activa — no es configurable. El único parámetro variable es el
            nombre del destinatario, que se completa automáticamente.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={clsx(cardClass, "flex flex-col gap-6")}>
      <h2
        className="text-[15px] font-bold tracking-tight"
        style={{ color: NAVY }}
      >
        Contenido del anuncio
      </h2>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="campaign-content-name"
          className="text-sm font-bold"
          style={{ color: NAVY }}
        >
          Nombre
        </label>
        <input
          id="campaign-content-name"
          type="text"
          placeholder="Nombre del anuncio"
          className={inputErrorClass(
            Boolean(contentErrors?.name),
            INPUT_CLASS
          )}
          {...register("content.name")}
        />
        {contentErrors?.name && (
          <p className="text-sm font-medium text-red-600">
            {contentErrors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="campaign-content-body"
          className="text-sm font-bold"
          style={{ color: NAVY }}
        >
          Texto principal
        </label>
        <textarea
          id="campaign-content-body"
          rows={6}
          placeholder={
            isNotificationWhatsapp
              ? "Texto libre que completa la plantilla, ej: No olvides confirmar tu cita esta semana."
              : "Texto principal de la campaña"
          }
          maxLength={isNotificationWhatsapp ? undefined : maxChars}
          className={inputErrorClass(
            Boolean(contentErrors?.bodyText) ||
              (highlightErrors && bodyOverLimit) ||
              Boolean(whatsappFreeTextValidation && !whatsappFreeTextValidation.valid),
            clsx(INPUT_CLASS, "min-h-[140px] resize-y")
          )}
          {...register("content.bodyText")}
        />
        <p
          className={clsx(
            "text-xs",
            bodyOverLimit || contentErrors?.bodyText
              ? "font-medium text-red-600"
              : "text-[#94A3B8]"
          )}
        >
          {bodyLen} / {maxChars} caracteres · {helperSuffix}
        </p>
        {contentErrors?.bodyText && (
          <p className="text-sm font-medium text-red-600">
            {contentErrors.bodyText.message}
          </p>
        )}
        {whatsappFreeTextValidation && !whatsappFreeTextValidation.valid && (
          <ul className="flex flex-col gap-1">
            {whatsappFreeTextValidation.errors.map((err) => (
              <li key={err} className="text-xs font-medium text-red-600">
                {err}
              </li>
            ))}
          </ul>
        )}
      </div>

      {deliveryChannel === "WHATSAPP" && (
        <div className="flex flex-col gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="flex items-center gap-2">
            <Icon icon="tabler:brand-whatsapp" className="text-lg text-[#25D366]" />
            <span className="text-sm font-bold" style={{ color: NAVY }}>
              Plantilla: {WHATSAPP_NOTIFICATION_TEMPLATE_NAME} (
              {WHATSAPP_NOTIFICATION_TEMPLATE_LANGUAGE})
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            WhatsApp solo permite plantillas pre-aprobadas por Meta — no es
            configurable. El header lleva el nombre de la empresa; el body
            completa automáticamente el nombre del destinatario y de la
            empresa, y usa el &quot;Texto principal&quot; de abajo como tercer
            parámetro libre.
          </p>
        </div>
      )}

      {deliveryChannel !== "WHATSAPP" && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="campaign-content-link"
            className="text-sm font-bold"
            style={{ color: NAVY }}
          >
            Añade link
          </label>
          <input
            id="campaign-content-link"
            type="text"
            placeholder="Ej: github.com/usuario"
            className={inputErrorClass(Boolean(contentErrors?.link), INPUT_CLASS)}
            {...register("content.link")}
          />
          {contentErrors?.link && (
            <p className="text-sm font-medium text-red-600">
              {contentErrors.link.message}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
