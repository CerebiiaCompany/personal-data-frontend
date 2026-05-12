"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "../base/Button";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import {
  AnswerType,
  CollectForm,
  CreateCollectForm,
  DataType,
} from "@/types/collectForm.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import SelectTemplateDialog from "../dialogs/SelectTemplateDialog";
import ConsentCampaignDialog from "../dialogs/ConsentCampaignDialog";
import CustomInput from "../forms/CustomInput";
import CustomSelect from "../forms/CustomSelect";
import { useSessionStore } from "@/store/useSessionStore";
import { createCollectForm, updateCollectForm } from "@/lib/collectForm.api";
import { parseApiError } from "@/utils/parseApiError";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { createCollectFormValidationSchema } from "@/validations/main.validations";
import { showDialog } from "@/utils/dialogs.utils";
import { usePolicyTemplates } from "@/hooks/usePolicyTemplates";
import LoadingCover from "../layout/LoadingCover";
import Link from "next/link";

interface Props {
  initialValues?: CreateCollectForm | CollectForm;
}

function toFormDefaults(
  initial?: CreateCollectForm | CollectForm
): CreateCollectForm {
  if (!initial) {
    return {
      name: "",
      description: "",
      policyTemplateId: "",
      marketingChannels: {
        SMS: true,
        EMAIL: false,
        WHATSAPP: false,
      },
      questions: [],
    };
  }

  return {
    name: initial.name,
    description: initial.description,
    policyTemplateId: initial.policyTemplateId,
    marketingChannels: {
      SMS: initial.marketingChannels.SMS,
      EMAIL: initial.marketingChannels.EMAIL,
      WHATSAPP: false,
    },
    questions: initial.questions.map((q, i) => ({
      title: q.title,
      answerType: q.answerType,
      dataType: q.dataType,
      order: "order" in q && typeof q.order === "number" ? q.order : i + 1,
    })),
  };
}

function toApiPayload(data: CreateCollectForm): CreateCollectForm {
  return {
    ...data,
    marketingChannels: {
      ...data.marketingChannels,
      WHATSAPP: false,
    },
    questions: data.questions.map((q, i) => ({
      title: q.title,
      answerType: q.answerType,
      dataType: q.dataType,
      order: q.order ?? i + 1,
    })),
  };
}

const CreateCollectFormForm = ({ initialValues }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const params = useParams();
  const isEdit = Boolean(initialValues && "_id" in initialValues);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<CreateCollectForm>({
    resolver: zodResolver(createCollectFormValidationSchema),
    defaultValues: toFormDefaults(initialValues),
  });

  const [publicOrigin, setPublicOrigin] = useState("");
  useEffect(() => {
    setPublicOrigin(window.location.origin);
  }, []);

  const router = useRouter();
  const user = useSessionStore((store) => store.user);
  const policyTemplates = usePolicyTemplates({
    companyId: user?.companyUserData?.companyId,
  });

  const marketingChannels = watch("marketingChannels");
  const questions = watch("questions");
  const policyTemplateId = watch("policyTemplateId");

  const selectedTemplateName = useMemo(() => {
    if (!policyTemplates.data) return null;
    return (
      policyTemplates.data.find((p) => p._id === policyTemplateId)?.name ??
      null
    );
  }, [policyTemplates.data, policyTemplateId]);

  const otpChannelCount =
    (marketingChannels.SMS ? 1 : 0) + (marketingChannels.EMAIL ? 1 : 0);

  const costPerResponseLabel = useMemo(() => {
    if (otpChannelCount <= 0) return "—";
    const total = otpChannelCount * 10;
    return `- ${total} COP + IVA`;
  }, [otpChannelCount]);

  const formIdForLink =
    (initialValues && "_id" in initialValues && initialValues._id) ||
    (params.formId as string | undefined);

  function setChannel(key: "SMS" | "EMAIL", next: boolean) {
    const mc = getValues("marketingChannels");
    if (!next && key === "SMS" && !mc.EMAIL) return;
    if (!next && key === "EMAIL" && !mc.SMS) return;
    setValue(`marketingChannels.${key}`, next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function handlePreview() {
    if (formIdForLink && typeof window !== "undefined") {
      window.open(
        `${window.location.origin}/formularios/${formIdForLink}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }
    toast.info("La vista previa estará disponible al publicar el formulario.");
  }

  async function onSubmit(data: CreateCollectForm) {
    if (!user?.companyUserData?.companyId) return;

    setLoading(true);
    const payload = toApiPayload(data);

    let res;
    if (isEdit && params.formId) {
      res = await updateCollectForm(
        user.companyUserData.companyId,
        params.formId as string,
        payload
      );
    } else {
      res = await createCollectForm(user.companyUserData.companyId, payload);
    }
    setLoading(false);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success(isEdit ? "Formulario actualizado" : "Formulario creado");
    router.push("/admin/recoleccion");
  }

  function deleteQuestion(index: number) {
    const next = [...watch("questions")];
    next.splice(index, 1);
    setValue("questions", next);
  }

  /** Paneles dentro de la tarjeta principal (más redondeados y aireados) */
  const innerSectionClass =
    "rounded-2xl border border-[#E4E9F2] bg-[#F7FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]";

  const topCardClass =
    "bg-white border border-[#E8EDF7] rounded-2xl shadow-[0_2px_10px_rgba(15,35,70,0.03)]";

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 w-full bg-[#F9FBFF]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col flex-1 min-h-0 w-full min-w-0"
      >
        {/* Tarjeta superior separada (mismo patrón que /admin/recoleccion) */}
        <div className="px-5 md:px-6 pt-4 shrink-0">
          <div className="max-w-[1200px] mx-auto w-full">
            <section className={clsx(topCardClass, "px-5 md:px-6 py-4 md:py-5")}>
              <header className="w-full flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <nav className="flex flex-wrap items-center gap-2 text-sm text-[#7384A6]">
                    <Link href="/admin" className="hover:underline">
                      Inicio
                    </Link>
                    <Icon
                      icon="tabler:chevron-right"
                      className="text-base shrink-0"
                    />
                    <Link
                      href="/admin/recoleccion"
                      className="hover:underline"
                    >
                      Recolección
                    </Link>
                    <Icon
                      icon="tabler:chevron-right"
                      className="text-base shrink-0"
                    />
                    <span className="text-[#1D2E56] font-semibold">
                      {isEdit ? "Editar formulario" : "Crear formulario"}
                    </span>
                  </nav>
                  <h1 className="text-[24px] sm:text-[26px] leading-tight font-bold text-[#0B1737]">
                    {isEdit ? "Actualizar formulario" : "Crear formulario nuevo"}
                  </h1>
                  <p className="text-[#6F7F9F] text-[13px] max-w-2xl leading-relaxed mt-1">
                    {isEdit
                      ? "Modifica la configuración de tu formulario de consentimiento y canales OTP."
                      : "Diseña tu formulario de consentimiento. Captura datos con validación OTP."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E3E9F4] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#334155] hover:bg-[#F4F7FE] transition-colors"
                  >
                    <Icon icon="tabler:arrow-left" className="text-lg" />
                    Volver
                  </button>
          
                  <Button
                    type="submit"
                    loading={loading}
                    className="rounded-xl! bg-[#0D2B74]! border-[#0D2B74]! px-5! py-2.5! text-[13px]!"
                    startContent={
                      <Icon icon="tabler:device-floppy" className="text-lg" />
                    }
                  >
                    {isEdit ? "Guardar cambios" : "Crear y publicar"}
                  </Button>
                </div>
              </header>
            </section>
          </div>
        </div>

        {/* Tarjeta del cuerpo del formulario (separada visualmente) */}
        <div className="px-5 md:px-6 py-4 md:py-5 flex-1 flex flex-col min-h-0 min-w-0">
          <div className="max-w-[1200px] mx-auto w-full flex-1 min-h-0 min-w-0">
            <section
              className={clsx(
                topCardClass,
                "px-5 md:px-6 py-5 md:py-6 flex flex-col min-h-0 min-w-0"
              )}
            >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-10 min-w-0">
          {/* Columna principal */}
          <div className="flex flex-col gap-7 min-w-0">
            {/* Título y descripción */}
            <section
              className={clsx(
                innerSectionClass,
                "relative overflow-hidden pl-4 border-l-[4px] border-l-[#2563EB]"
              )}
            >
              <div className="p-7 sm:p-9 flex flex-col gap-6">
                <div>
                  <input
                    id="collect-form-name"
                    {...register("name")}
                    placeholder="Formulario sin título"
                    className="w-full bg-transparent text-[22px] sm:text-[24px] font-semibold text-[#0F172A] placeholder:text-[#94A3B8] outline-none border-0"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm font-medium mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="collect-form-description"
                    className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]"
                  >
                    Descripción del formulario
                  </label>
                  <textarea
                    id="collect-form-description"
                    {...register("description")}
                    rows={4}
                    placeholder="Ej. Recolección de datos de usuarios segmentados para marketing digital"
                    className="w-full resize-y min-h-[128px] rounded-xl border border-[#E2E8F0] bg-white px-4 py-3.5 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#1D2D5B] focus:ring-2 focus:ring-[#1D2D5B]/15 transition-shadow"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm font-medium">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Ruta de envío */}
            <section className={clsx(innerSectionClass, "p-7 sm:p-8 flex flex-col gap-5")}>
              <div>
                <h2 className="text-[17px] font-bold text-[#0F172A]">
                  Ruta de envío
                </h2>
                <p className="text-[13px] text-[#64748B] mt-1">
                  Selecciona los canales por los que se enviará el código de
                  verificación OTP
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(
                  [
                    {
                      key: "SMS" as const,
                      label: "SMS",
                      sub: "10 COP + IVA",
                      icon: "tabler:message-circle",
                    },
                    {
                      key: "EMAIL" as const,
                      label: "Email",
                      sub: "10 COP + IVA",
                      icon: "tabler:mail",
                    },
                  ] as const
                ).map(({ key, label, sub, icon }) => {
                  const active = marketingChannels[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setChannel(key, !active)}
                      className={clsx(
                        "relative flex flex-col items-start gap-2 rounded-2xl border-2 p-5 text-left transition-all",
                        active
                          ? "border-[#1D2D5B] bg-[#F8FAFC] shadow-sm"
                          : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
                      )}
                    >
                      {active && (
                        <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white">
                          <Icon icon="tabler:check" className="text-xs" />
                        </span>
                      )}
                      <Icon
                        icon={icon}
                        className={clsx(
                          "text-2xl",
                          active ? "text-[#1D2D5B]" : "text-[#94A3B8]"
                        )}
                      />
                      <span
                        className={clsx(
                          "text-[15px] font-bold",
                          active ? "text-[#1D2D5B]" : "text-[#334155]"
                        )}
                      >
                        {label}
                      </span>
                      <span className="text-[12px] text-[#64748B]">{sub}</span>
                    </button>
                  );
                })}

                <div
                  className="flex flex-col items-start gap-2 rounded-2xl border-2 border-[#E2E8F0] bg-[#F8FAFC] p-5 opacity-70 cursor-not-allowed"
                  aria-disabled
                >
                  <Icon icon="tabler:brand-whatsapp" className="text-2xl text-[#94A3B8]" />
                  <span className="text-[15px] font-bold text-[#94A3B8]">
                    WhatsApp
                  </span>
                  <span className="text-[12px] text-[#94A3B8]">Próximamente</span>
                </div>
              </div>

              {(() => {
                const mcErr = errors.marketingChannels;
                if (!mcErr || typeof mcErr !== "object") return null;
                if ("message" in mcErr && mcErr.message) {
                  return (
                    <p className="text-red-500 text-sm font-medium">
                      {String(mcErr.message)}
                    </p>
                  );
                }
                const smsMsg = (mcErr as { SMS?: { message?: string } }).SMS
                  ?.message;
                if (smsMsg) {
                  return (
                    <p className="text-red-500 text-sm font-medium">{smsMsg}</p>
                  );
                }
                return null;
              })()}

              <div className="flex gap-3 rounded-2xl bg-[#E8F1FE] border border-[#BFDBFE] px-5 py-4 text-[13px] text-[#1E40AF]">
                <Icon
                  icon="tabler:info-circle"
                  className="text-xl shrink-0 mt-0.5"
                />
                <p className="leading-snug">
                  Costo por envío OTP: SMS y Email se cobran{" "}
                   por mensaje. WhatsApp estará
                  disponible próximamente.
                </p>
              </div>
            </section>

            {/* Plantilla legal */}
            <section className={clsx(innerSectionClass, "p-7 sm:p-8 flex flex-col gap-5")}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                <div>
                  <h2 className="text-[17px] font-bold text-[#0F172A]">
                    Plantilla legal
                  </h2>
                  <p className="text-[13px] text-[#64748B] mt-1">
                    Adjunta una política de tratamiento de datos
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {policyTemplates.loading ? (
                    <div className="relative h-10 w-40">
                      <LoadingCover size="sm" />
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          showDialog(HTML_IDS_DATA.selectTemplateDialog)
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                      >
                        <Icon icon="tabler:file-text" className="text-lg" />
                        Seleccionar plantilla
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toast.info("Generación con IA disponible próximamente.")
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-[13px] font-semibold text-white hover:brightness-95 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.35)]"
                      >
                        <Icon icon="tabler:sparkles" className="text-lg" />
                        Generar con IA
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] px-5 py-4 text-[13px] text-[#64748B]">
                <span>Seleccionada:</span>
                <span className="font-bold text-[#0F172A]">
                  {selectedTemplateName ?? "Sin seleccionar"}
                </span>
                {policyTemplateId ? (
                  <button
                    type="button"
                    onClick={() => setValue("policyTemplateId", "")}
                    className="ml-auto inline-flex items-center justify-center rounded-md p-1.5 text-[#64748B] hover:bg-white hover:text-[#0F172A] transition-colors"
                    aria-label="Quitar plantilla"
                  >
                    <Icon icon="tabler:x" className="text-lg" />
                  </button>
                ) : null}
              </div>
              {errors.policyTemplateId && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.policyTemplateId.message}
                </p>
              )}
            </section>

            {policyTemplates.data && (
              <SelectTemplateDialog
                items={policyTemplates.data}
                value={policyTemplateId}
                onSelect={(id) =>
                  setValue("policyTemplateId", id, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
              />
            )}

            {/* Preguntas personalizadas */}
            <section className={clsx(innerSectionClass, "p-7 sm:p-8 flex flex-col gap-5")}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-[17px] font-bold text-[#0F172A]">
                    Preguntas personalizadas
                  </h2>
                  <p className="text-[13px] text-[#64748B] mt-1">
                    Datos básicos (nombres, CC, correo, teléfono) ya están
                    incluidos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const q = watch("questions");
                    setValue("questions", [
                      ...q,
                      {
                        title: "",
                        answerType: "TEXT",
                        dataType: "PERSONAL",
                        order: q.length + 1,
                      },
                    ]);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-transparent px-4 py-2.5 text-[13px] font-semibold text-[#2563EB] hover:bg-[#EFF6FF] transition-colors self-start"
                >
                  <Icon icon="tabler:plus" className="text-lg" />
                  Añadir pregunta
                </button>
              </div>

              {questions.length > 0 ? (
                <ul className="flex flex-col gap-5">
                  {questions.map((_, index) => (
                    <li
                      key={index}
                      className="relative rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7 group shadow-[0_2px_10px_rgba(15,23,42,0.04)]"
                    >
                      <button
                        type="button"
                        onClick={() => deleteQuestion(index)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50"
                        aria-label="Eliminar pregunta"
                      >
                        <Icon icon="tabler:trash" className="text-xl" />
                      </button>
                      <div className="flex flex-col gap-4 pr-10">
                        <CustomInput
                          variant="bordered"
                          placeholder="Título de la pregunta"
                          {...register(`questions.${index}.title`)}
                          error={errors.questions?.[index]?.title}
                          className="[&_input]:bg-white"
                        />
                        <div className="flex flex-col sm:flex-row gap-3">
                          <CustomSelect<AnswerType>
                            value={questions[index].answerType}
                            unselectedText="Tipo de respuesta"
                            onChange={(value) =>
                              setValue(`questions.${index}.answerType`, value)
                            }
                            options={[
                              {
                                value: "TEXT",
                                title: "Respuesta escrita",
                                icon: "material-symbols:short-text-rounded",
                              },
                              {
                                value: "DATE",
                                title: "Fecha",
                                icon: "fluent:calendar-16-regular",
                              },
                            ]}
                          />
                          <CustomSelect<DataType>
                            value={questions[index].dataType}
                            onChange={(value) =>
                              setValue(`questions.${index}.dataType`, value)
                            }
                            unselectedText="Tipo de dato"
                            options={[
                              {
                                value: "PERSONAL",
                                title: "Personal",
                                icon: "tabler:user",
                              },
                              {
                                value: "MEDICAL",
                                title: "Médico",
                                icon: "tabler:first-aid-kit",
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}

              {errors.questions &&
                typeof errors.questions === "object" &&
                "message" in errors.questions && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.questions.message as string}
                  </p>
                )}
            </section>
          </div>

          {/* Resumen lateral */}
          <aside className="lg:sticky lg:top-8 space-y-5">
            <div className="rounded-2xl border border-[#E6EBF2] bg-white p-7 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
              <h2 className="text-[16px] font-bold text-[#0F172A] mb-5">
                Resumen
              </h2>
              <dl className="space-y-0 divide-y divide-[#E8EDF2]">
                <div className="flex items-center justify-between py-3.5 text-[13px]">
                  <dt className="text-[#64748B]">Estado</dt>
                  <dd
                    className={clsx(
                      "font-semibold",
                      isEdit ? "text-emerald-600" : "text-amber-600"
                    )}
                  >
                    {isEdit ? "Activo" : "Borrador"}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-3.5 text-[13px]">
                  <dt className="text-[#64748B]">Canales OTP</dt>
                  <dd className="font-semibold text-[#0F172A]">
                    {otpChannelCount}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-3.5 text-[13px]">
                  <dt className="text-[#64748B]">Preguntas extra</dt>
                  <dd className="font-semibold text-[#0F172A]">
                    {questions.length}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-3.5 text-[13px]">
                  <dt className="text-[#64748B]">Costo por respuesta</dt>
                  <dd className="font-bold text-[#0F172A] tabular-nums">
                    {costPerResponseLabel}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-[#BFDBFE] bg-[#F0F7FF] px-5 py-5 flex gap-3 shadow-[0_2px_12px_rgba(37,99,235,0.08)]">
              <Icon
                icon="tabler:link"
                className="text-xl text-[#2563EB] shrink-0 mt-0.5"
              />
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[#0F172A]">
                  Enlace público
                </p>
                {formIdForLink && publicOrigin ? (
                  <p className="text-[12px] text-[#64748B] mt-1 break-all">
                    {`${publicOrigin}/formularios/${formIdForLink}`}
                  </p>
                ) : (
                  <p className="text-[12px] text-[#64748B] mt-1 leading-snug">
                    Se generará al publicar el formulario
                  </p>
                )}
              </div>
            </div>

            {isEdit && formIdForLink && user?.companyUserData?.companyId && (
              <>
                <div className="rounded-2xl border border-emerald-200 bg-[#F0FDF4] px-5 py-5 flex flex-col gap-3 shadow-[0_2px_12px_rgba(16,185,129,0.08)]">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="tabler:bell-ringing"
                      className="text-xl text-emerald-600 shrink-0 mt-0.5"
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#0F172A]">
                        Campaña de consentimiento
                      </p>
                      <p className="text-[12px] text-[#64748B] mt-1 leading-snug">
                        Envía solicitudes de aceptación masivas a los usuarios con consentimiento pendiente
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => showDialog(HTML_IDS_DATA.consentCampaignDialog)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:brightness-95 transition-all shadow-[0_4px_14px_rgba(16,185,129,0.30)]"
                  >
                    <Icon icon="tabler:send" className="text-base" />
                    Crear campaña
                  </button>
                </div>

                <ConsentCampaignDialog
                  companyId={user.companyUserData.companyId}
                  formId={formIdForLink}
                  formName={watch("name")}
                />
              </>
            )}
          </aside>
        </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCollectFormForm;
