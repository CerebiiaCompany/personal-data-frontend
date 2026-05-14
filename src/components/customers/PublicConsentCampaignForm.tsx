"use client";

import React, { useState } from "react";
import { useForm, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import CustomCheckbox from "@/components/forms/CustomCheckbox";
import RenderQuestionInput from "@/components/forms/RenderQuestionInput";
import { AnswerType, CollectForm } from "@/types/collectForm.types";
import { DocType, docTypesOptions } from "@/types/user.types";
import { UserGender, userGendersOptions } from "@/types/collectFormResponse.types";
import { CustomSelectOption } from "@/types/forms.types";
import { parseApiError } from "@/utils/parseApiError";
import { registerConsentCampaignResponse } from "@/lib/collectFormResponse.api";
import { getPublicCollectFormPolicyUrl } from "@/lib/collectForm.api";
import LoadingCover from "@/components/layout/LoadingCover";

type PhoneCountryCode =
  | "57" | "58" | "1" | "52" | "51"
  | "56" | "54" | "55" | "593" | "507";

const phoneCountryCodeOptions: CustomSelectOption<PhoneCountryCode>[] = [
  { value: "57", title: "+57" },
  { value: "58", title: "+58" },
  { value: "1", title: "+1" },
  { value: "52", title: "+52" },
  { value: "51", title: "+51" },
  { value: "56", title: "+56" },
  { value: "54", title: "+54" },
  { value: "55", title: "+55" },
  { value: "593", title: "+593" },
  { value: "507", title: "+507" },
];

interface Props {
  data: CollectForm;
  cct: string;
}

type FieldConfig = { type: AnswerType; default: any };

function buildDataSchema(fields: Record<string, FieldConfig>) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [key, cfg] of Object.entries(fields)) {
    if (cfg.type === "TEXT") {
      shape[key] = z.string().min(1, "Campo requerido");
    } else if (cfg.type === "DATE") {
      shape[key] = z.preprocess((v) => {
        if (typeof v === "string") {
          const parts = v.split("-").map(Number);
          if (
            parts.length === 3 &&
            !isNaN(parts[0]) &&
            !isNaN(parts[1]) &&
            !isNaN(parts[2])
          ) {
            const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
            if (
              d.getUTCFullYear() === parts[0] &&
              d.getUTCMonth() === parts[1] - 1 &&
              d.getUTCDate() === parts[2]
            ) {
              return d;
            }
          }
          return null;
        }
      }, z.date({ error: "Fecha inválida" }));
    } else {
      shape[key] = z.any();
    }
  }
  return z.object(shape);
}

function companyDisplayName(form: CollectForm): string | null {
  const raw = form.company?.name?.trim() || form.companyName?.trim();
  return raw && raw.length > 0 ? raw : null;
}

export default function PublicConsentCampaignForm({ data, cct }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [policyUrl, setPolicyUrl] = useState<string | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);

  const companyName = companyDisplayName(data);

  React.useEffect(() => {
    if (!data?._id) return;

    let cancelled = false;
    setPolicyLoading(true);

    getPublicCollectFormPolicyUrl(data._id)
      .then((res) => {
        if (cancelled) return;
        if (!res.error && res.data?.url) {
          setPolicyUrl(res.data.url);
        } else if (res.error) {
          toast.error(parseApiError(res.error));
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("No se pudo obtener el enlace a la política de tratamiento de datos.");
        }
      })
      .finally(() => {
        if (!cancelled) setPolicyLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [data._id]);

  const fields: Record<string, FieldConfig> = {};
  data.questions.forEach((q) => {
    fields[q.title] = {
      type: q.answerType,
      default: q.answerType === "TEXT" ? "" : new Date(),
    };
  });

  const dataSchema = React.useMemo(() => buildDataSchema(fields), [data._id]);

  const schema = React.useMemo(
    () =>
      z.object({
        user: z.object({
          docType: z.string<DocType>(),
          docNumber: z.preprocess(
            (v) => (v === "" ? undefined : v),
            z.coerce.number("Número de documento inválido")
          ),
          name: z.string().min(1, "Este campo es obligatorio"),
          lastName: z.string().min(1, "Este campo es obligatorio"),
          age: z.preprocess(
            (v) => (v === "" ? undefined : v),
            z.coerce.number("Este campo es obligatorio").int("Edad inválida")
          ),
          gender: z.string<UserGender>(),
          email: z.email("Correo inválido"),
          phone: z.preprocess(
            (v: any) =>
              typeof v === "string" ? v.replace(/[^\d]/g, "") : String(v ?? ""),
            z.string().regex(/^\d{10}$/, "Ingresa 10 dígitos (solo números)")
          ),
          phoneCountryCode: z.string(),
        }),
        dataProcessing: z.boolean().refine((v) => v === true, {
          message: "Debes aceptar el tratamiento de datos",
        }),
        data: dataSchema,
      }),
    [dataSchema]
  );

  const dynamicDefaults = React.useMemo(
    () =>
      Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, v.default])
      ),
    [data._id]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      user: {
        docType: "CC" as DocType,
        phoneCountryCode: "57" as PhoneCountryCode,
        docNumber: undefined as any,
        name: "",
        lastName: "",
        age: undefined as any,
        gender: undefined as UserGender | undefined,
        email: "",
        phone: "",
      },
      dataProcessing: false,
      data: dynamicDefaults,
    },
  });

  async function onSubmit(formData: any) {
    setSubmitting(true);

    const phoneCountryCode = (watch("user.phoneCountryCode") as string) || "57";
    const fullPhone = `${phoneCountryCode}${formData.user.phone}`;

    const res = await registerConsentCampaignResponse(data._id, cct, {
      dataProcessing: formData.dataProcessing,
      data: formData.data ?? {},
      user: {
        ...formData.user,
        phone: fullPhone,
        phoneCountryCode: undefined,
      },
    });

    setSubmitting(false);

    if (res.error) {
      const msg = parseApiError(res.error);
      if (
        res.error.code === "auth/unauthenticated" ||
        (res.error as any).statusCode === 401
      ) {
        toast.error(
          "El enlace de consentimiento ha expirado o es inválido. Contacta a la empresa para obtener uno nuevo."
        );
      } else {
        toast.error(msg);
      }
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-lg w-full text-center py-8 px-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <Icon icon="tabler:circle-check" className="text-5xl text-emerald-600" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-[#0B1737]">
            ¡Consentimiento aceptado!
          </h2>
          <p className="text-[#64748B] leading-relaxed">
            Tu aceptación de la política de tratamiento de datos personales ha
            sido registrada exitosamente.
            {companyName ? (
              <>
                {" "}
                Gracias por tu confianza en <span className="font-semibold text-[#0B1737]">{companyName}</span>.
              </>
            ) : (
              " Gracias por tu confianza."
            )}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-sm text-emerald-800 w-full text-left flex gap-3">
          <Icon icon="tabler:info-circle" className="text-emerald-600 text-lg shrink-0 mt-0.5" />
          <p>Puedes cerrar esta ventana de forma segura.</p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 max-w-2xl items-stretch w-full"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-2xl text-[#0B1737]">{data.name}</h1>
        {data.description && (
          <p className="text-[#64748B] text-sm leading-relaxed">
            {data.description}
          </p>
        )}
      </div>

      {companyName ? (
        <div className="rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-blue-50 px-4 py-4 flex gap-3 shadow-sm">
          <div className="p-2.5 bg-white rounded-lg border border-primary-100 shrink-0 h-fit shadow-sm">
            <Icon icon="tabler:building" className="text-2xl text-primary-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary-700/90 mb-0.5">
              Responsable del tratamiento de datos personales
            </p>
            <p className="text-lg font-bold text-primary-950 leading-snug break-words">
              {companyName}
            </p>
            <p className="text-xs text-primary-900/85 mt-2 leading-relaxed">
              La información que registres será tratada por esta empresa conforme a la Ley 1581 de 2012 y la política que aceptes a continuación.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-4 flex gap-3">
          <Icon
            icon="tabler:building-community"
            className="text-amber-700 text-xl shrink-0 mt-0.5"
          />
          <div className="text-sm text-amber-950 leading-relaxed">
            <p className="font-semibold mb-1">Empresa responsable</p>
            <p className="text-amber-900/95 text-xs">
              En este enlace no aparece el nombre comercial de quien tratará tus datos. Si tienes dudas, contacta a quien te envió el mensaje. Los datos se asocian al formulario{" "}
              <span className="font-medium">«{data.name}»</span>.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 flex gap-3">
        <Icon
          icon="tabler:info-circle"
          className="text-blue-600 text-xl shrink-0 mt-0.5"
        />
        <p className="text-sm text-blue-900 leading-relaxed">
          {companyName ? (
            <>
              Completa tus datos y acepta la política de tratamiento de datos personales de{" "}
              <span className="font-semibold">{companyName}</span> para registrar tu consentimiento.
            </>
          ) : (
            <>
              Completa tus datos y acepta la política de tratamiento de datos
              personales para registrar tu consentimiento.
            </>
          )}
        </p>
      </div>

      {/* Datos personales */}
      <div className="rounded-xl border border-[#E4E9F2] bg-white p-6 flex flex-col gap-5">
        <h2 className="font-semibold text-[#0B1737] text-base">
          Datos personales
        </h2>

        <div className="flex gap-5">
          <CustomInput
            label="Nombres"
            {...register("user.name")}
            placeholder="Ej. Juan"
            error={errors.user?.name}
          />
          <CustomInput
            label="Apellidos"
            {...register("user.lastName")}
            placeholder="Ej. Pérez"
            error={errors.user?.lastName}
          />
        </div>

        <div className="flex gap-5">
          <div>
            <CustomSelect
              label="Tipo de documento"
              options={docTypesOptions}
              value={watch("user.docType")}
              onChange={(v) => setValue("user.docType", v)}
            />
          </div>
          <CustomInput
            label="Número de documento"
            {...register("user.docNumber")}
            error={errors.user?.docNumber as FieldError}
          />
        </div>

        <div className="flex gap-5">
          <div className="flex flex-col items-start gap-1 text-left flex-1 relative h-fit">
            <label className="font-medium w-full text-ellipsis pl-2 text-stone-500 text-sm">
              Género
            </label>
            <select
              value={watch("user.gender") || ""}
              onChange={(e) =>
                setValue("user.gender", e.target.value as UserGender, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              className="rounded-lg gap-2 w-full text-primary-900 border border-primary-900 flex-1 relative px-3 py-2 bg-primary-50"
            >
              <option value="" disabled>
                Seleccionar opción
              </option>
              {userGendersOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.title}
                </option>
              ))}
            </select>
          </div>
          <CustomInput
            type="number"
            label="Edad"
            {...register("user.age")}
            error={errors.user?.age as FieldError}
          />
        </div>

        <div className="flex gap-5">
          <CustomInput
            label="Correo electrónico"
            type="email"
            placeholder="Ej. juan@ejemplo.com"
            {...register("user.email")}
            error={errors.user?.email}
          />
          <div className="flex gap-2 flex-1">
            <div className="w-32 flex-shrink-0">
              <CustomSelect<PhoneCountryCode>
                label="Código"
                value={(watch("user.phoneCountryCode") || "57") as PhoneCountryCode}
                onChange={(v) => setValue("user.phoneCountryCode", v)}
                options={phoneCountryCodeOptions}
                unselectedText="Código"
              />
            </div>
            <div className="flex-1 min-w-0">
              <CustomInput
                label="Teléfono"
                {...register("user.phone")}
                placeholder="Ej. 3001234567"
                error={errors.user?.phone as FieldError}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preguntas personalizadas */}
      {data.questions.length > 0 && (
        <div className="rounded-xl border border-[#E4E9F2] bg-white p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-[#0B1737] text-base">
            Información adicional
          </h2>
          {data.questions.map((q) => (
            <RenderQuestionInput
              key={q._id}
              {...register(`data.${q.title}`)}
              question={q}
              defaultValue={watch(`data.${q.title}`) as any}
              error={errors.data && (errors.data[q.title] as FieldError)}
            />
          ))}
        </div>
      )}

      {/* Consentimiento */}
      <div className="rounded-xl border border-[#E4E9F2] bg-white p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-[#0B1737] text-base">
          Política de tratamiento de datos personales
        </h2>
        <p className="text-sm text-[#64748B] leading-relaxed">
          {companyName ? (
            <>
              Al aceptar, autorizo a <span className="font-semibold text-[#334155]">{companyName}</span> el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 y sus decretos reglamentarios, de acuerdo con la política vinculada abajo.
            </>
          ) : (
            <>
              Al aceptar, autorizo el tratamiento de mis datos personales conforme a
              lo establecido en la Ley 1581 de 2012 y sus decretos reglamentarios.
            </>
          )}
        </p>
        {policyUrl && (
          <a
            href={policyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Icon icon="tabler:file-text" className="text-base" />
            Ver política completa (PDF)
            <Icon icon="tabler:external-link" className="text-sm" />
          </a>
        )}
        {policyLoading ? (
          <div className="flex items-center gap-3 min-h-[3rem]">
            <div className="w-10 h-10 relative shrink-0">
              <LoadingCover size="sm" />
            </div>
            <span className="text-sm text-[#64748B]">Cargando enlace a la política…</span>
          </div>
        ) : policyUrl ? (
          <CustomCheckbox
            {...register("dataProcessing")}
            label={
              <span>
                Acepto la{" "}
                <a
                  href={policyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary-600 hover:text-primary-800 font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  política de tratamiento de datos personales
                </a>{" "}
                {companyName ? (
                  <>de {companyName}.</>
                ) : (
                  <>de la empresa responsable del tratamiento.</>
                )}
              </span>
            }
            error={errors.dataProcessing as FieldError}
          />
        ) : (
          <>
            <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
              No hay enlace disponible a la política en este momento. Si necesitas
              leerla antes de aceptar, contacta a la empresa.
            </div>
            <CustomCheckbox
              {...register("dataProcessing")}
              label={
                companyName
                  ? `Acepto la política de tratamiento de datos personales de ${companyName}.`
                  : "Acepto la política de tratamiento de datos personales de la empresa responsable."
              }
              error={errors.dataProcessing as FieldError}
            />
          </>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={submitting}
        disabled={submitting || policyLoading}
        startContent={<Icon icon="tabler:check" />}
      >
        {submitting ? "Enviando..." : "Aceptar y registrar consentimiento"}
      </Button>
    </form>
  );
}
