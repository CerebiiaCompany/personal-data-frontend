import { CampaignDeliveryChannel } from "@/types/campaign.types";
import clsx from "clsx";
import { FieldError, UseFormRegister, UseFormWatch } from "react-hook-form";

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
}

export default function CreateScheduledCampaignStep3({
  register,
  watch,
  errors,
  deliveryChannel,
}: Props) {
  const contentErrors = errors.content as unknown as ContentErrors | undefined;
  const maxChars = deliveryChannel === "SMS" ? 160 : 1000;
  const bodyText = watch("content.bodyText") ?? "";
  const bodyLen = typeof bodyText === "string" ? bodyText.length : 0;

  const helperSuffix =
    deliveryChannel === "SMS"
      ? "1 SMS por destinatario"
      : "1 correo por destinatario";

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
          className={INPUT_CLASS}
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
          placeholder="Texto principal de la campaña"
          maxLength={maxChars}
          className={clsx(INPUT_CLASS, "min-h-[140px] resize-y")}
          {...register("content.bodyText")}
        />
        <p className="text-xs text-[#94A3B8]">
          {bodyLen} / {maxChars} caracteres · {helperSuffix}
        </p>
        {contentErrors?.bodyText && (
          <p className="text-sm font-medium text-red-600">
            {contentErrors.bodyText.message}
          </p>
        )}
      </div>

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
          type="url"
          inputMode="url"
          placeholder="https://sitio.com"
          className={INPUT_CLASS}
          {...register("content.link")}
        />
        {contentErrors?.link && (
          <p className="text-sm font-medium text-red-600">
            {contentErrors.link.message}
          </p>
        )}
      </div>
    </section>
  );
}
