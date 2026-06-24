import React, { useEffect, useMemo, useRef, useState } from "react";
import Button from "../base/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { FieldError, useForm } from "react-hook-form";
import CustomInput from "../forms/CustomInput";
import { parseApiError } from "@/utils/parseApiError";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createScheduledCampaignValidationSchema } from "@/validations/main.validations";
import {
  CampaignDeliveryChannel,
  CampaignGoal,
  campaignGoalLabels,
  deliveryChannelLabels,
} from "@/types/campaign.types";
import { createCampaign } from "@/lib/campaign.api";
import { useCollectForms } from "@/hooks/useCollectForms";
import { useCampaignAudience } from "@/hooks/useCampaignAudience";
import { useAppSetting } from "@/hooks/useAppSetting";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import {
  asFiniteNumber,
  getCreditsPerMessage,
  getTotalCampaignCredits,
} from "@/utils/campaignCredits.utils";
import { creditsFormatter, priceFormatter } from "@/utils/formatters";
import CampaignWizardStepper from "./CampaignWizardStepper";
import CampaignWizardValidationBanner from "./CampaignWizardValidationBanner";
import CreateScheduledCampaignStep1 from "./CreateScheduledCampaignStep1";
import CreateScheduledCampaignStep2 from "./CreateScheduledCampaignStep2";
import CreateScheduledCampaignStep3 from "./CreateScheduledCampaignStep3";
import CreateScheduledCampaignStep4 from "./CreateScheduledCampaignStep4";
import {
  collectScheduledCampaignStepErrorMessages,
  evaluateScheduledCampaignStep,
  getScheduledCampaignStepFields,
  ScheduledCampaignFormValues,
} from "@/utils/createScheduledCampaignWizard.utils";

const GOAL_SUMMARY_LABEL: Partial<Record<CampaignGoal, string>> = {
  SALES: "Ventas",
  PROMOTION: "Marketing",
  INTERACTION: "Notificación",
  POTENTIAL_CUSTOMERS: "Consentimiento",
};

/** El asistente ocupa todo el ancho disponible del contenido. */
const WIZARD_MAX = "max-w-none";
/** Pasos y formulario con ancho igual a la maqueta de referencia. */
const WIZARD_CONTENT_MAX = "max-w-[980px]";

const topCardClass =
  "bg-white border border-[#E8EDF7] rounded-xl shadow-sm";

function getCurrentDateTimeLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function minScheduledDateTimeLocalString() {
  const minDateTime = new Date(Date.now() + 5 * 60 * 1000);
  const year = minDateTime.getFullYear();
  const month = String(minDateTime.getMonth() + 1).padStart(2, "0");
  const day = String(minDateTime.getDate()).padStart(2, "0");
  const hours = String(minDateTime.getHours()).padStart(2, "0");
  const minutes = String(minDateTime.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const CreateScheduledCampaignForm = () => {
  const companyId = useActiveCompanyId();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [stepSubmitted, setStepSubmitted] = useState<Record<number, boolean>>({});
  /** Evita doble POST: el índice único `name` en BD falla en el 2.º intento aunque el 1.º ya creó la campaña. */
  const submitLockRef = useRef(false);

  const trmCopSetting = useAppSetting("TRM_COP");
  const smsCampaignPriceSetting = useAppSetting(
    "SMS_CAMPAIGN_PRICE_PER_MESSAGE_MASIVAPP"
  );
  const emailCampaignPriceSetting = useAppSetting(
    "EMAIL_CAMPAIGN_PRICE_PER_MESSAGE"
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
    control: formControl,
    trigger,
  } = useForm<ScheduledCampaignFormValues>({
    resolver: zodResolver(createScheduledCampaignValidationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      active: false,
      sourceFormIds: [],
      audience: {
        gender: "ALL",
        minAge: 0,
        maxAge: 100,
        count: 0,
      },
      audienceSelectionMode: "FILTERS" as const,
      targetedResponseIds: [] as string[],
      scheduling: {
        scheduledDateTime: getCurrentDateTimeLocal(),
      },
      deliveryChannel: "SMS" as CampaignDeliveryChannel,
      content: { name: "", bodyText: "", link: "" },
    },
  });

  const minAgeValue = watch("audience.minAge");
  const maxAgeValue = watch("audience.maxAge");
  const parsedMinAge = Number(minAgeValue);
  const parsedMaxAge = Number(maxAgeValue);
  const minAge = Number.isFinite(parsedMinAge) ? parsedMinAge : 0;
  const maxAge = Number.isFinite(parsedMaxAge) ? parsedMaxAge : 100;

  const sourceFormsValue = watch("sourceFormIds").join(",");
  const genderValue = watch("audience.gender") || "ALL";
  const audienceSelectionMode = (watch("audienceSelectionMode") ||
    "FILTERS") as ScheduledCampaignFormValues["audienceSelectionMode"];
  const targetedResponseIds = (watch("targetedResponseIds") || []) as string[];
  const targetedResponseIdsParam = targetedResponseIds.join(",");
  const apiAudienceCount = Number(watch("audience.count") ?? 0);
  const effectiveAudienceCount =
    audienceSelectionMode === "MANUAL"
      ? Math.max(apiAudienceCount, targetedResponseIds.length)
      : apiAudienceCount;

  const campaignAudience = useCampaignAudience(
    audienceSelectionMode === "MANUAL"
      ? {
          companyId,
          responseIds: targetedResponseIdsParam,
        }
      : {
          companyId,
          sourceForms: sourceFormsValue,
          gender: genderValue,
          minAge,
          maxAge,
        }
  );

  const collectForms = useCollectForms({
    companyId: companyId,
  });

  const trmCop = asFiniteNumber(trmCopSetting.data?.value);
  const smsCampaignPrice = asFiniteNumber(smsCampaignPriceSetting.data?.value);
  const emailCampaignPrice = asFiniteNumber(
    emailCampaignPriceSetting.data?.value
  );

  const smsCreditsPerMessage = getCreditsPerMessage({
    deliveryChannel: "SMS",
    trmCop,
    smsCampaignPricePerMessage: smsCampaignPrice,
    emailCampaignPricePerMessage: emailCampaignPrice,
  });

  const emailCreditsPerMessage = getCreditsPerMessage({
    deliveryChannel: "EMAIL",
    trmCop,
    smsCampaignPricePerMessage: smsCampaignPrice,
    emailCampaignPricePerMessage: emailCampaignPrice,
  });

  const channelOptions = useMemo(() => {
    const fmt = (credits: number | undefined) =>
      credits != null && Number.isFinite(credits)
        ? `≈ COP ${priceFormatter.format(Math.round(credits))} + IVA`
        : "COP — + IVA";
    return [
      {
        value: "SMS" as const,
        title: "SMS",
        icon: "tabler:message-circle",
        copLine: fmt(smsCreditsPerMessage),
      },
      {
        value: "EMAIL" as const,
        title: "Email",
        icon: "tabler:mail",
        copLine: fmt(emailCreditsPerMessage),
      },
    ];
  }, [smsCreditsPerMessage, emailCreditsPerMessage]);

  const selectedDeliveryChannel = (watch("deliveryChannel") ||
    "SMS") as CampaignDeliveryChannel;

  const selectedCreditsPerMessage = getCreditsPerMessage({
    deliveryChannel: selectedDeliveryChannel,
    trmCop,
    smsCampaignPricePerMessage: smsCampaignPrice,
    emailCampaignPricePerMessage: emailCampaignPrice,
  });

  const totalCredits = getTotalCampaignCredits({
    audienceCount: effectiveAudienceCount,
    deliveriesCount: 1,
    creditsPerMessage: selectedCreditsPerMessage,
  });

  const audienceCount = effectiveAudienceCount;

  const audienceCostPreview = useMemo(() => {
    const cpm = selectedCreditsPerMessage;
    const subtotalCop =
      audienceCount > 0 && cpm != null && Number.isFinite(cpm)
        ? audienceCount * cpm
        : 0;
    const ivaCop = subtotalCop * 0.19;
    const totalCop = subtotalCop + ivaCop;
    const creditsNeeded =
      totalCredits != null && Number.isFinite(totalCredits) ? totalCredits : 0;
    return {
      audienceCount,
      channel: selectedDeliveryChannel,
      subtotalCop,
      ivaCop,
      totalCop,
      creditsNeeded,
    };
  }, [
    audienceCount,
    selectedCreditsPerMessage,
    totalCredits,
    selectedDeliveryChannel,
  ]);

  useEffect(() => {
    if (audienceSelectionMode === "MANUAL") {
      const count = campaignAudience.data?.count ?? targetedResponseIds.length;
      setValue("audience.count", count);
      return;
    }

    if (campaignAudience.data) {
      setValue("audience.count", campaignAudience.data.count);
    } else {
      setValue("audience.count", 0);
    }
  }, [
    campaignAudience.data,
    audienceSelectionMode,
    targetedResponseIds.length,
    setValue,
  ]);

  const formValues = watch();
  const wizardContext = useMemo(
    () => ({
      audienceLoading: campaignAudience.loading,
      audienceError: campaignAudience.error,
      effectiveAudienceCount,
    }),
    [campaignAudience.loading, campaignAudience.error, effectiveAudienceCount]
  );

  const stepEvaluation = useMemo(
    () => evaluateScheduledCampaignStep(step, formValues, wizardContext),
    [step, formValues, wizardContext]
  );

  const stepFieldErrorMessages = useMemo(
    () =>
      collectScheduledCampaignStepErrorMessages(
        errors,
        step,
        audienceSelectionMode
      ),
    [errors, step, audienceSelectionMode]
  );

  const showStepValidation = Boolean(stepSubmitted[step]);
  const validationBannerMessages = useMemo(() => {
    if (!showStepValidation) return [];
    return [...new Set([...stepEvaluation.messages, ...stepFieldErrorMessages])];
  }, [showStepValidation, stepEvaluation.messages, stepFieldErrorMessages]);

  const canProceedCurrentStep =
    stepEvaluation.canProceed && stepFieldErrorMessages.length === 0;

  const canSubmitCampaign = useMemo(() => {
    const evaluation = evaluateScheduledCampaignStep(4, formValues, wizardContext);
    return evaluation.canProceed && !loading;
  }, [formValues, wizardContext, loading]);

  async function goNext() {
    setStepSubmitted((current) => ({ ...current, [step]: true }));

    const fields = getScheduledCampaignStepFields(
      step,
      audienceSelectionMode
    );

    const ok = await trigger(
      fields as Parameters<typeof trigger>[0]
    );
    const evaluation = evaluateScheduledCampaignStep(
      step,
      getValues(),
      wizardContext
    );

    if (!ok || !evaluation.canProceed) {
      const message =
        evaluation.messages[0] ||
        "Revisa los campos marcados antes de continuar.";
      toast.error(message);
      return;
    }

    if (step < 4) {
      setStep((current) => current + 1);
    }
  }

  function goBack() {
    if (step <= 1) {
      router.push("/admin/campanas");
      return;
    }
    setStep((s) => s - 1);
  }

  async function onSubmit(data: ScheduledCampaignFormValues) {
    if (!companyId) return;
    if (submitLockRef.current) return;

    setStepSubmitted((current) => ({ ...current, 4: true }));
    const ok = await trigger();
    const evaluation = evaluateScheduledCampaignStep(4, data, wizardContext);
    if (!ok || !evaluation.canProceed) {
      toast.error(
        evaluation.messages[0] ||
          "Revisa el resumen y corrige los errores antes de crear la campaña."
      );
      return;
    }

    submitLockRef.current = true;
    setLoading(true);

    try {
      const scheduledDateTime = new Date(
        data.scheduling.scheduledDateTime
      ).toISOString();

      const contentName = data.content?.name?.trim() || "";
      const contentBody = data.content?.bodyText?.trim() || "";
      const contentLink = data.content?.link?.trim() || "";
      const parts = [contentName, contentBody, contentLink].filter(
        (p) => p && p.length > 0
      );
      const compiledMessage = parts.join("\n\n");

      const payload = {
        ...data,
        content: {
          ...data.content,
          bodyText: compiledMessage,
        },
        scheduling: {
          scheduledDateTime,
        },
        ...(data.audienceSelectionMode === "MANUAL" &&
        data.targetedResponseIds?.length
          ? { targetedResponseIds: data.targetedResponseIds }
          : {}),
      };

      delete (payload as { audienceSelectionMode?: string })
        .audienceSelectionMode;

      const res = await createCampaign(
        companyId,
        payload as unknown as Parameters<typeof createCampaign>[1]
      );

      if (res.error) {
        toast.error(parseApiError(res.error));
        return;
      }

      toast.success("Campaña programada creada");
      router.refresh();
      router.push("/admin/campanas");
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
  }

  const goalKey = watch("goal") as keyof typeof campaignGoalLabels | undefined;
  const formIds = watch("sourceFormIds") as string[];
  const selectedFormNames =
    collectForms.data?.filter((f) => formIds.includes(f._id)).map((f) => f.name) ??
    [];

  return (
    <div className="flex flex-col w-full min-h-0 bg-[#F8FAFC] pb-16 md:pb-20">
      <div className="px-5 md:px-8 pt-5 md:pt-6 flex-1 min-h-0">
        <div
          className={clsx(
            WIZARD_MAX,
            "mx-auto w-full flex flex-col gap-6 md:gap-8"
          )}
        >
          <section className={clsx(topCardClass, "px-5 py-5 md:px-6 md:py-5")}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1 space-y-2.5">
                <nav className="flex flex-wrap items-center gap-2 text-sm text-[#7384A6]">
                  <Link href="/admin" className="hover:underline">
                    Inicio
                  </Link>
                  <Icon
                    icon="tabler:chevron-right"
                    className="text-base shrink-0"
                  />
                  <Link href="/admin/campanas" className="hover:underline">
                    Campañas
                  </Link>
                  <Icon
                    icon="tabler:chevron-right"
                    className="text-base shrink-0"
                  />
                  <span className="text-[#1D2E56] font-semibold">
                    Crear campaña
                  </span>
                </nav>
                <h1 className="text-[22px] sm:text-[26px] font-bold text-[#0B1737] leading-tight tracking-tight">
                  Crear campaña
                </h1>
                <p className="text-[#64748B] text-[13px] sm:text-sm max-w-lg leading-relaxed">
                  Configura y programa un nuevo envío masivo.
                </p>
              </div>
              <Button
                type="button"
                hierarchy="secondary"
                onClick={() => router.push("/admin/campanas")}
                className="rounded-xl! border-[#E2E8F0]! bg-white! text-[13px]! shrink-0 self-start sm:self-auto"
                startContent={
                  <Icon icon="tabler:arrow-left" className="text-lg" />
                }
              >
                Cancelar
              </Button>
            </div>
          </section>

          <div className={clsx(WIZARD_CONTENT_MAX, "mx-auto w-full flex flex-col gap-6 md:gap-8")}>
            <CampaignWizardStepper currentStep={step} />

            <form
              onSubmit={(event) => {
                event.preventDefault();
              }}
              className="flex flex-col gap-6 md:gap-8 min-w-0"
            >
              {step === 1 && (
                <CreateScheduledCampaignStep1
                  control={formControl}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  collectForms={collectForms.data}
                  channelOptions={channelOptions}
                  highlightErrors={showStepValidation}
                />
              )}

              {step === 2 && (
                <CreateScheduledCampaignStep2
                  companyId={companyId || ""}
                  control={formControl}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  costPreview={audienceCostPreview}
                  collectForms={collectForms.data ?? undefined}
                  audienceLoading={campaignAudience.loading}
                  audienceError={campaignAudience.error}
                  highlightErrors={showStepValidation}
                />
              )}

              {step === 3 && (
                <div className="flex flex-col gap-5 md:gap-6">
                  <CreateScheduledCampaignStep3
                    register={register}
                    watch={watch}
                    errors={errors}
                    deliveryChannel={selectedDeliveryChannel}
                    highlightErrors={showStepValidation}
                  />
                  <section
                    className={clsx(
                      topCardClass,
                      "p-5 sm:p-6 flex flex-col gap-4"
                    )}
                  >
                    <h2 className="text-[15px] font-bold tracking-tight text-[#1A2B5B]">
                      Nombre de la campaña
                    </h2>
                    <CustomInput
                      {...register("name")}
                      placeholder="Ej. Campaña lanzamiento Q2"
                      error={errors.name as FieldError | undefined}
                    />
                  </section>
                  <section
                    className={clsx(
                      topCardClass,
                      "p-5 sm:p-6 flex flex-col gap-4"
                    )}
                  >
                    <h2 className="text-[15px] font-bold tracking-tight text-[#1A2B5B]">
                      Programación
                    </h2>
                    <CustomInput
                      type="datetime-local"
                      label="Fecha y hora de envío"
                      {...register("scheduling.scheduledDateTime")}
                      error={
                        errors.scheduling?.scheduledDateTime as FieldError
                      }
                      min={minScheduledDateTimeLocalString()}
                    />
                    <p className="flex gap-2 text-xs text-[#64748B]">
                      <Icon
                        icon="tabler:info-circle"
                        className="text-base shrink-0"
                      />
                      La campaña debe programarse al menos 5 minutos en el
                      futuro.
                    </p>
                  </section>
                </div>
              )}

              {step === 4 && (
                <CreateScheduledCampaignStep4
                  summary={{
                    goalLabel: goalKey
                      ? GOAL_SUMMARY_LABEL[goalKey] ??
                        campaignGoalLabels[goalKey] ??
                        goalKey
                      : "—",
                    formularioLabel:
                      selectedFormNames.length > 0
                        ? selectedFormNames.join(", ")
                        : "—",
                    generoLabel:
                      audienceSelectionMode === "MANUAL"
                        ? "Selección manual"
                        : genderValue === "ALL"
                          ? "Todos"
                          : genderValue === "MALE"
                            ? "Hombres"
                            : genderValue === "FEMALE"
                              ? "Mujeres"
                              : "Otro",
                    nombreCampaña: String(watch("name") ?? ""),
                    canalLabel:
                      deliveryChannelLabels[selectedDeliveryChannel] ??
                      selectedDeliveryChannel,
                    audienciaDestinatarios: audienceCostPreview.audienceCount,
                    rangoEdadLabel:
                      audienceSelectionMode === "MANUAL"
                        ? `${targetedResponseIds.length} persona${targetedResponseIds.length === 1 ? "" : "s"}`
                        : `${minAge} - ${maxAge}`,
                    totalLine: `COP ${priceFormatter.format(
                      Math.round(audienceCostPreview.totalCop)
                    )} (${creditsFormatter.format(
                      Math.round(audienceCostPreview.creditsNeeded)
                    )} créditos)`,
                    audienceSelectionMode: audienceSelectionMode as
                      | "FILTERS"
                      | "MANUAL",
                  }}
                />
              )}

              <CampaignWizardValidationBanner messages={validationBannerMessages} />

              <div className="mt-2 border-t border-[#E5E7EB] pt-6 pb-4 md:pb-6 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
                <Button
                  type="button"
                  hierarchy="secondary"
                  onClick={goBack}
                  className={clsx(
                    "rounded-xl! border-[#E2E8F0]! bg-white! text-[13px]! font-semibold!",
                    step === 4
                      ? "text-[#475569]!"
                      : "text-[#1A2B5B]!"
                  )}
                  startContent={
                    <Icon icon="tabler:arrow-left" className="text-lg" />
                  }
                >
                  {step === 1 ? "Volver a campañas" : "Anterior"}
                </Button>
                {step < 4 ? (
                  <Button
                    type="button"
                    disabled={!canProceedCurrentStep}
                    onClick={() => void goNext()}
                    className="rounded-xl! bg-[#1A2B5B]! border-[#1A2B5B]! text-[13px]! font-semibold!"
                    endContent={
                      <Icon icon="tabler:arrow-right" className="text-lg" />
                    }
                  >
                    {step === 3 ? "Ver resumen" : "Siguiente"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    loading={loading}
                    disabled={!canSubmitCampaign}
                    onClick={() => void handleSubmit((data) => onSubmit(data))()}
                    className="rounded-xl! w-full sm:w-auto sm:min-w-[300px]! bg-emerald-600! border-emerald-600! text-[13px]! font-semibold! text-white!"
                    startContent={
                      <Icon icon="tabler:check" className="text-lg" />
                    }
                  >
                    Crear y programar campaña
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateScheduledCampaignForm;
