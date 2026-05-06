import {
  CampaignAudienceGender,
  CampaignDeliveryChannel,
} from "@/types/campaign.types";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import {
  Control,
  Controller,
  FieldError,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import { creditsFormatter, priceFormatter } from "@/utils/formatters";

/** Paleta alineada con el mock de “Crear campaña · Audiencia” */
const NAVY = "#1A2B5B";
const SELECTED_CARD_BG = "#F0F2FA";
const BADGE_BG = "#E0E7FF";

const GENDER_OPTIONS: {
  value: CampaignAudienceGender;
  title: string;
  icon: string;
}[] = [
  { value: "ALL", title: "Todos", icon: "tabler:users" },
  { value: "MALE", title: "Hombres", icon: "tabler:gender-male" },
  { value: "FEMALE", title: "Mujeres", icon: "tabler:gender-female" },
];

const outerCard =
  "rounded-xl border border-[#E8EDF7] bg-white p-6 sm:p-7 shadow-sm";

export interface AudienceCostPreview {
  audienceCount: number;
  channel: CampaignDeliveryChannel;
  subtotalCop: number;
  ivaCop: number;
  totalCop: number;
  creditsNeeded: number;
}

interface Props {
  control: Control<any>;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  errors: import("react-hook-form").FieldErrors<any>;
  costPreview: AudienceCostPreview;
}

type AudienceFieldErrors = {
  gender?: FieldError;
  minAge?: FieldError;
  maxAge?: FieldError;
  count?: FieldError;
};

const ageInputClass =
  "w-[72px] sm:w-20 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-2 text-center text-sm font-semibold text-[#0F172A] shadow-sm outline-none transition-colors " +
  "focus:border-[#1A2B5B] focus:ring-2 focus:ring-[#1A2B5B]/15";

export default function CreateScheduledCampaignStep2({
  control,
  register,
  watch,
  errors,
  costPreview,
}: Props) {
  const audienceErrors = errors.audience as unknown as
    | AudienceFieldErrors
    | undefined;

  const channelShort =
    costPreview.channel === "SMS"
      ? "SMS"
      : costPreview.channel === "EMAIL"
        ? "Email"
        : String(costPreview.channel);
  const countLabel = costPreview.audienceCount.toLocaleString("es-CO");

  const fmtCop = (n: number) =>
    `COP ${priceFormatter.format(Math.max(0, Math.round(n)))}`;
  const fmtCreditsInt = (n: number) =>
    Math.max(0, Math.round(n)).toLocaleString("es-CO", {
      maximumFractionDigits: 0,
    });

  return (
    <div className="flex w-full flex-col gap-5 md:gap-6">
      {/* Tarjeta Audiencia: solo Género + Edad (como el mock) */}
      <section className={clsx(outerCard, "flex flex-col gap-8")}>
        <h2
          className="text-[15px] font-bold tracking-tight"
          style={{ color: NAVY }}
        >
          Audiencia
        </h2>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-normal text-[#475569]">Género</p>
          <Controller
            name="audience.gender"
            control={control}
            render={({ field }) => (
              <div
                className="grid w-full grid-cols-3 gap-3"
                role="radiogroup"
                aria-label="Género de la audiencia"
              >
                {GENDER_OPTIONS.map((opt) => {
                  const selected = field.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => field.onChange(opt.value)}
                      className={clsx(
                        "flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-xl border-2 px-3 py-4 text-center transition-all",
                        selected
                          ? "shadow-sm"
                          : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
                      )}
                      style={
                        selected
                          ? {
                              borderColor: NAVY,
                              backgroundColor: SELECTED_CARD_BG,
                            }
                          : undefined
                      }
                    >
                      <Icon
                        icon={opt.icon}
                        className={clsx(
                          "text-[28px] sm:text-[30px]",
                          selected && opt.value === "ALL"
                            ? "text-violet-600"
                            : selected
                              ? "text-[#1A2B5B]"
                              : "text-[#94A3B8]"
                        )}
                      />
                      <span
                        className={clsx(
                          "text-sm font-semibold",
                          selected ? "text-[#0F172A]" : "text-[#64748B]"
                        )}
                      >
                        {opt.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          />
          {audienceErrors?.gender && (
            <p className="text-sm font-medium text-red-600">
              {audienceErrors.gender.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-normal text-[#475569]">Edad</p>
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <input
                type="number"
                inputMode="numeric"
                className={ageInputClass}
                {...register("audience.minAge")}
              />
              <span className="text-sm font-medium text-[#64748B]">Hasta</span>
              <input
                type="number"
                inputMode="numeric"
                className={ageInputClass}
                {...register("audience.maxAge")}
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <span className="text-sm text-[#64748B]">
                Personas en este rango
              </span>
              <span
                className="rounded-lg px-3 py-1.5 text-sm font-bold tabular-nums text-[#1A2B5B]"
                style={{ backgroundColor: BADGE_BG }}
              >
                {watch("audience.count") ?? "0"}
              </span>
            </div>
          </div>
          {(audienceErrors?.minAge || audienceErrors?.maxAge) && (
            <div className="flex flex-col gap-1 text-sm font-medium text-red-600">
              {audienceErrors.minAge?.message && (
                <span>{audienceErrors.minAge.message}</span>
              )}
              {audienceErrors.maxAge?.message && (
                <span>{audienceErrors.maxAge.message}</span>
              )}
            </div>
          )}
          {audienceErrors?.count && (
            <p className="text-sm font-medium text-red-600">
              {audienceErrors.count.message}
            </p>
          )}
        </div>
      </section>

      {/* Tarjeta Resumen de costos: caja interior con borde gris */}
      <section className={clsx(outerCard, "flex flex-col gap-4")}>
        <h2
          className="text-[15px] font-bold tracking-tight"
          style={{ color: NAVY }}
        >
          Resumen de costos
        </h2>
        <div className="rounded-lg border border-[#E2E8F0] bg-[#FAFAFA] p-4 sm:p-5">
          <dl className="flex flex-col gap-0 text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[#64748B]">
                {channelShort} x {countLabel}
              </dt>
              <dd className="font-medium tabular-nums text-[#0F172A]">
                {fmtCop(costPreview.subtotalCop)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[#64748B]">IVA (19%)</dt>
              <dd className="font-medium tabular-nums text-[#0F172A]">
                {fmtCop(costPreview.ivaCop)}
              </dd>
            </div>
            <div
              className="my-1 border-t border-[#E2E8F0]"
              aria-hidden
            />
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="font-bold text-[#0F172A]">Total estimado</dt>
              <dd
                className="font-bold tabular-nums"
                style={{ color: NAVY }}
              >
                {fmtCop(costPreview.totalCop)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[#E2E8F0] pt-3.5 mt-1">
              <dt className="font-normal text-[#64748B]">
                Créditos necesarios
              </dt>
              <dd className="text-base font-bold tabular-nums text-[#334155]">
                {fmtCreditsInt(costPreview.creditsNeeded)}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
