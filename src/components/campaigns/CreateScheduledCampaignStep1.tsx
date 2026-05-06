import {
  CampaignDeliveryChannel,
  CampaignGoal,
} from "@/types/campaign.types";
import { CollectForm } from "@/types/collectForm.types";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import {
  Control,
  Controller,
  FieldError,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { toast } from "sonner";

const GOAL_CARDS: {
  value: CampaignGoal;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "SALES",
    title: "Ventas",
    description: "Promocionar productos o servicios",
    icon: "tabler:shopping-bag",
  },
  {
    value: "PROMOTION",
    title: "Marketing",
    description: "Campañas de marca y fidelización",
    icon: "tabler:megaphone",
  },
  {
    value: "INTERACTION",
    title: "Notificación",
    description: "Avisos informativos a usuarios",
    icon: "tabler:trending-up",
  },
  {
    value: "POTENTIAL_CUSTOMERS",
    title: "Consentimiento",
    description: "Renovar o solicitar autorizaciones",
    icon: "tabler:users",
  },
];

type ChannelOption = {
  value: CampaignDeliveryChannel;
  title: string;
  icon: string;
  copLine: string;
};

interface Step1Props {
  control: Control<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  collectForms: CollectForm[] | null;
  channelOptions: ChannelOption[];
}

export default function CreateScheduledCampaignStep1({
  control,
  watch,
  setValue,
  errors,
  collectForms,
  channelOptions,
}: Step1Props) {
  const sourceFormIds = watch("sourceFormIds") as string[];
  const selectedGoal = watch("goal") as CampaignGoal | undefined;
  const selectedChannel = watch("deliveryChannel") as CampaignDeliveryChannel;

  function toggleForm(id: string) {
    const next = sourceFormIds.includes(id)
      ? sourceFormIds.filter((x) => x !== id)
      : [...sourceFormIds, id];
    setValue("sourceFormIds", next, { shouldValidate: true, shouldDirty: true });
  }

  const cardShell =
    "rounded-xl border border-[#E8EDF7] bg-white p-4 sm:p-6 shadow-sm";

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className={cardShell}>
        <h2 className="text-[15px] font-bold text-[#0B1737] mb-4 tracking-tight">
          Tipo de objetivo
        </h2>
        <Controller
          name="goal"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {GOAL_CARDS.map((opt) => {
                const selected = field.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={clsx(
                      "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all hover:border-[#2563EB]/40",
                      selected
                        ? "border-[#2563EB] bg-[#E8F1FE] ring-1 ring-[#2563EB]/30"
                        : "border-[#E4EAF6] bg-[#FAFCFF]"
                    )}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F1FE] text-[#2563EB]">
                      <Icon icon={opt.icon} className="text-xl" />
                    </span>
                    <span className="text-[15px] font-bold text-[#0B1737]">
                      {opt.title}
                    </span>
                    <span className="text-[13px] text-[#64748B] leading-snug">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.goal && (
          <p className="mt-2 text-sm font-medium text-red-600">
            {(errors.goal as FieldError)?.message}
          </p>
        )}
      </section>

      <section className={cardShell}>
        <h2 className="text-base font-bold text-[#0B1737] mb-4">
          Canal de envío
        </h2>
        <Controller
          name="deliveryChannel"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {channelOptions.map((opt) => {
                const selected = field.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={clsx(
                      "flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-4 text-center transition-all min-w-0",
                      selected
                        ? "border-[#2563EB] bg-white ring-1 ring-[#2563EB]/20"
                        : "border-[#E4EAF6] bg-white hover:border-[#2563EB]/40"
                    )}
                  >
                    <Icon
                      icon={opt.icon}
                      className="text-2xl text-[#2563EB]"
                    />
                    <span className="text-[15px] font-bold text-[#0B1737]">
                      {opt.title}
                    </span>
                    <span className="text-[13px] font-semibold text-[#64748B]">
                      {opt.copLine}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() =>
                  toast.info("WhatsApp estará disponible próximamente.")
                }
                className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-dashed border-[#E4EAF6] bg-[#F8FAFC] p-4 text-center opacity-80 cursor-not-allowed min-w-0"
              >
                <Icon
                  icon="tabler:brand-whatsapp"
                  className="text-2xl text-[#94A3B8]"
                />
                <span className="text-[15px] font-bold text-[#64748B]">
                  WhatsApp
                </span>
                <span className="text-[13px] font-semibold text-[#94A3B8]">
                  COP 50 + IVA
                </span>
              </button>
            </div>
          )}
        />
        {errors.deliveryChannel && (
          <p className="mt-2 text-sm font-medium text-red-600">
            {(errors.deliveryChannel as FieldError)?.message}
          </p>
        )}
      </section>

      <section className={cardShell}>
        <h2 className="text-[15px] font-bold text-[#0B1737] mb-4 tracking-tight">
          Seleccionar formulario
        </h2>
        {!collectForms?.length ? (
          <p className="text-sm text-[#64748B]">
            No hay formularios disponibles. Crea un formulario de recolección
            primero.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {collectForms.map((form) => {
              const selected = sourceFormIds.includes(form._id);
              const count = form.totalResponses ?? 0;
              return (
                <li key={form._id}>
                  <button
                    type="button"
                    onClick={() => toggleForm(form._id)}
                    className={clsx(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                      selected
                        ? "border-[#2563EB] bg-[#E8F1FE] ring-1 ring-[#2563EB]/20"
                        : "border-[#E4EAF6] bg-[#FAFCFF] hover:border-[#2563EB]/35"
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#2563EB] border border-[#E8EDF7]">
                      <Icon icon="tabler:file-text" className="text-xl" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-[#0B1737] leading-snug line-clamp-2">
                        {form.name}
                      </p>
                      <p className="text-[12px] text-[#64748B] mt-0.5">
                        {count.toLocaleString("es-CO")} registros
                      </p>
                    </div>
                    {selected && (
                      <Icon
                        icon="tabler:circle-check-filled"
                        className="text-xl text-[#2563EB] shrink-0"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {errors.sourceFormIds && (
          <p className="mt-2 text-sm font-medium text-red-600">
            {(errors.sourceFormIds as FieldError)?.message}
          </p>
        )}
      </section>
    </div>
  );
}
