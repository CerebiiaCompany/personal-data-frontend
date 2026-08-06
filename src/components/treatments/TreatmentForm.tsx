"use client";

import Button from "@/components/base/Button";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import CustomTextarea from "@/components/forms/CustomTextarea";
import EnumMultiSelect from "@/components/treatments/EnumMultiSelect";
import TreatmentSystemsSection from "@/components/treatments/TreatmentSystemsSection";
import { useTreatmentPurposes } from "@/hooks/useTreatmentPurposes";
import { usePolicyTemplates } from "@/hooks/usePolicyTemplates";
import {
  createTreatment,
  fetchTreatment,
  updateTreatment,
} from "@/lib/treatment.api";
import { fetchCompanyUsers } from "@/lib/user.api";
import { CustomSelectOption } from "@/types/forms.types";
import { SessionUser } from "@/types/user.types";
import {
  computeContainsSensitiveData,
  CreateTreatmentPayload,
  DataCategory,
  DataSubjectCategory,
  DATA_CATEGORY_OPTIONS,
  DATA_SUBJECT_CATEGORY_OPTIONS,
  LegalBasis,
  LEGAL_BASIS_OPTIONS,
  RetentionStartEvent,
  RetentionUnit,
  RETENTION_START_EVENT_OPTIONS,
  RETENTION_UNIT_OPTIONS,
  SecurityMeasure,
  SECURITY_MEASURE_OPTIONS,
  Treatment,
  TreatmentInput,
} from "@/types/treatment.types";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Props {
  companyId: string;
  mode: "create" | "edit";
  initial?: Treatment | null;
  onSaved: (treatment: Treatment) => void;
  onCancel: () => void;
}

interface FormState {
  name: string;
  description: string;
  purposeId: string;
  purposeDetail: string;
  legalBasis: LegalBasis | "";
  legalBasisJustification: string;
  // Item CON-001/B8 (Art. 12 + Art. 14) — solo se usa/gatea cuando
  // legalBasis === "CONSENT".
  consentTemplateId: string;
  // Item B6: subcampos guiados, solo usados cuando legalBasis ===
  // LEGITIMATE_INTEREST — ver LEGITIMATE_INTEREST_LABELS/build/parse más
  // abajo para el formato en que se concatenan dentro de
  // legalBasisJustification (no hay migración de schema para esta tarea).
  legitimateInterestPurpose: string;
  legitimateInterestNecessity: string;
  legitimateInterestBalance: string;
  dataCategories: DataCategory[];
  dataSubjectCategories: DataSubjectCategory[];
  internalOwnerId: string;
  retentionValue: string;
  retentionUnit: RetentionUnit | "";
  retentionStartEvent: RetentionStartEvent | "";
  securityMeasures: SecurityMeasure[];
  internationalTransferOccurs: boolean;
  internationalTransferCountry: string;
  internationalTransferMechanism: string;
  // Item D (RF-72, Art. 16 sexies) — solo se piden/gatean canActivate cuando
  // dataCategories incluye GEOLOCATION. geolocationSharedWithThirdParties es
  // "" mientras no se responde (distinto de false = "respondió que no").
  geolocationDuration: string;
  geolocationSharedWithThirdParties: boolean | "";
  geolocationThirdPartiesIdentity: string;
}

// Item B6 — LEGITIMATE_INTEREST: 3 subcampos guiados (finalidad legítima,
// necesidad/proporcionalidad, resultado del balance) que la ley pide
// documentar por separado, pero el schema NO tiene 3 columnas para esto (no
// se migra en esta tarea) — se concatenan dentro de legalBasisJustification
// con este formato exacto, separadas por una línea "---" propia para que
// cada subcampo pueda tener varias líneas sin romper el parseo al reabrir el
// formulario:
//
//   Finalidad legítima:
//   <texto>
//   ---
//   Necesidad y proporcionalidad:
//   <texto>
//   ---
//   Resultado del balance:
//   <texto>
//
// Si legalBasisJustification no matchea NINGUNA de las 3 etiquetas (texto
// libre de antes de este cambio, o de otra base legal), todo el texto se
// conserva en el subcampo "purpose" para no perder información existente.
const LEGITIMATE_INTEREST_LABELS = {
  purpose: "Finalidad legítima",
  necessity: "Necesidad y proporcionalidad",
  balance: "Resultado del balance",
} as const;

function buildLegitimateInterestJustification(fields: {
  purpose: string;
  necessity: string;
  balance: string;
}): string | null {
  const sections = [
    fields.purpose.trim() && `${LEGITIMATE_INTEREST_LABELS.purpose}:\n${fields.purpose.trim()}`,
    fields.necessity.trim() && `${LEGITIMATE_INTEREST_LABELS.necessity}:\n${fields.necessity.trim()}`,
    fields.balance.trim() && `${LEGITIMATE_INTEREST_LABELS.balance}:\n${fields.balance.trim()}`,
  ].filter((s): s is string => Boolean(s));
  return sections.length > 0 ? sections.join("\n---\n") : null;
}

function parseLegitimateInterestJustification(text: string | null): {
  purpose: string;
  necessity: string;
  balance: string;
} {
  const empty = { purpose: "", necessity: "", balance: "" };
  if (!text) return empty;

  const extract = (label: string): string | null => {
    const re = new RegExp(`${label}:\\n([\\s\\S]*?)(?:\\n---\\n|$)`);
    const match = text.match(re);
    return match ? match[1].trim() : null;
  };

  const purpose = extract(LEGITIMATE_INTEREST_LABELS.purpose);
  const necessity = extract(LEGITIMATE_INTEREST_LABELS.necessity);
  const balance = extract(LEGITIMATE_INTEREST_LABELS.balance);

  if (purpose === null && necessity === null && balance === null) {
    return { purpose: text, necessity: "", balance: "" };
  }
  return { purpose: purpose ?? "", necessity: necessity ?? "", balance: balance ?? "" };
}

function buildInitialState(t?: Treatment | null): FormState {
  const legitimateInterest =
    t?.legalBasis === "LEGITIMATE_INTEREST"
      ? parseLegitimateInterestJustification(t.legalBasisJustification)
      : { purpose: "", necessity: "", balance: "" };

  return {
    name: t?.name ?? "",
    description: t?.description ?? "",
    purposeId: t?.purposeId ?? "",
    purposeDetail: t?.purposeDetail ?? "",
    legalBasis: t?.legalBasis ?? "",
    legalBasisJustification: t?.legalBasisJustification ?? "",
    consentTemplateId: t?.consentTemplateId ?? "",
    legitimateInterestPurpose: legitimateInterest.purpose,
    legitimateInterestNecessity: legitimateInterest.necessity,
    legitimateInterestBalance: legitimateInterest.balance,
    dataCategories: t?.dataCategories ?? [],
    dataSubjectCategories: t?.dataSubjectCategories ?? [],
    internalOwnerId: t?.internalOwnerId ?? "",
    retentionValue: t?.retentionValue != null ? String(t.retentionValue) : "",
    retentionUnit: t?.retentionUnit ?? "",
    retentionStartEvent: t?.retentionStartEvent ?? "",
    securityMeasures: t?.securityMeasures ?? [],
    internationalTransferOccurs: t?.internationalTransferOccurs ?? false,
    internationalTransferCountry: t?.internationalTransferCountry ?? "",
    internationalTransferMechanism: t?.internationalTransferMechanism ?? "",
    geolocationDuration: t?.geolocationDuration ?? "",
    geolocationSharedWithThirdParties: t?.geolocationSharedWithThirdParties ?? "",
    geolocationThirdPartiesIdentity: t?.geolocationThirdPartiesIdentity ?? "",
  };
}

/** "" → null; texto con contenido → recortado. */
function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

const sectionClass =
  "rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6";

const TreatmentForm = ({
  companyId,
  mode,
  initial,
  onSaved,
  onCancel,
}: Props) => {
  const [form, setForm] = useState<FormState>(() => buildInitialState(initial));
  const [submitting, setSubmitting] = useState(false);
  const [owners, setOwners] = useState<SessionUser[]>([]);
  // Versión sobre la que se está editando. Sirve como guarda optimista en el
  // frontend: antes de guardar re-leemos la versión actual del backend y, si
  // cambió respecto a esta base, avisamos en vez de pisar en silencio (el
  // backend solo devuelve 409 ante concurrencia real, no ante pestañas obsoletas).
  const [baselineVersion, setBaselineVersion] = useState<number | undefined>(
    initial?.version
  );

  const { data: purposes } = useTreatmentPurposes({ companyId });
  // Item CON-001/B8 — solo se necesita cargar cuando la base legal elegida
  // es CONSENT, pero el hook no soporta "enabled" condicional; se carga
  // igual (mismo criterio que purposes/owners de arriba, listas chicas por
  // empresa) y el selector solo se renderiza cuando aplica.
  const { data: consentTemplates } = usePolicyTemplates({ companyId });

  useEffect(() => {
    setForm(buildInitialState(initial));
    setBaselineVersion(initial?.version);
  }, [initial]);

  // Responsable interno: se puebla en modo best-effort. Si el usuario no tiene
  // permiso para listar colaboradores (403) simplemente no se ofrece el select
  // y no se muestra ningún error.
  useEffect(() => {
    let active = true;
    fetchCompanyUsers({ companyId, pageSize: 200 }).then((res) => {
      if (!active) return;
      if (res.error) return;
      setOwners((res.data as SessionUser[]) ?? []);
    });
    return () => {
      active = false;
    };
  }, [companyId]);

  const purposeOptions = useMemo<CustomSelectOption<string>[]>(() => {
    const base: CustomSelectOption<string>[] = [
      { value: "", title: "— Sin finalidad —" },
    ];
    for (const p of purposes ?? []) {
      base.push({
        value: p.id,
        title: p.companyId ? p.label : `${p.label} (global)`,
      });
    }
    return base;
  }, [purposes]);

  const legalBasisOptions = useMemo<CustomSelectOption<string>[]>(
    () => [{ value: "", title: "— Sin base legal —" }, ...LEGAL_BASIS_OPTIONS],
    []
  );

  const consentTemplateOptions = useMemo<CustomSelectOption<string>[]>(() => {
    const base: CustomSelectOption<string>[] = [
      { value: "", title: "— Selecciona una plantilla de consentimiento —" },
    ];
    for (const t of consentTemplates ?? []) {
      base.push({ value: t._id, title: t.name });
    }
    return base;
  }, [consentTemplates]);

  const ownerOptions = useMemo<CustomSelectOption<string>[]>(() => {
    const base: CustomSelectOption<string>[] = [
      { value: "", title: "— Sin responsable —" },
    ];
    for (const u of owners) {
      base.push({
        value: u._id,
        title: `${u.name} ${u.lastName}`.trim() || u.username,
      });
    }
    return base;
  }, [owners]);

  const containsSensitiveData = useMemo(
    () => computeContainsSensitiveData(form.dataCategories),
    [form.dataCategories]
  );

  // Item D (RF-72, Art. 16 sexies).
  const hasGeolocation = form.dataCategories.includes("GEOLOCATION");

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /**
   * Todo-o-nada, igual que la validación del backend (treatment.controller.ts):
   * los 3 campos de retención se guardan juntos o no se guarda ninguno — un
   * valor sin unidad o sin evento disparador no es información utilizable.
   */
  function validateRetentionFields(): string | null {
    const anySet = Boolean(
      form.retentionValue.trim() || form.retentionUnit || form.retentionStartEvent
    );
    if (!anySet) return null;

    const value = Number(form.retentionValue);
    if (!form.retentionValue.trim() || !Number.isInteger(value) || value <= 0) {
      return "La duración de la retención debe ser un entero mayor a 0";
    }
    if (!form.retentionUnit) return "Selecciona la unidad de la retención";
    if (!form.retentionStartEvent) return "Selecciona el evento que inicia el conteo de la retención";
    return null;
  }

  /** Item B6: LEGAL_OBLIGATION exige "Norma específica" (frontend-only — no
   * hay cambio en canActivate, ver treatment.controller.ts item B5). */
  function validateLegalBasisFields(): string | null {
    if (form.legalBasis === "LEGAL_OBLIGATION" && !form.legalBasisJustification.trim()) {
      return "La norma específica es obligatoria para la base legal 'Obligación legal'";
    }
    return null;
  }

  function buildPayload(): CreateTreatmentPayload {
    const hasRetention = Boolean(
      form.retentionValue.trim() && form.retentionUnit && form.retentionStartEvent
    );
    // Item B6: LEGITIMATE_INTEREST concatena sus 3 subcampos guiados dentro
    // de legalBasisJustification (ver build/parseLegitimateInterestJustification);
    // el resto de bases legales usa el campo de texto libre tal cual, como
    // siempre — el backend no cambia, sigue siendo un solo string.
    const legalBasisJustification =
      form.legalBasis === "LEGITIMATE_INTEREST"
        ? buildLegitimateInterestJustification({
            purpose: form.legitimateInterestPurpose,
            necessity: form.legitimateInterestNecessity,
            balance: form.legitimateInterestBalance,
          })
        : nullableText(form.legalBasisJustification);
    const base: TreatmentInput = {
      description: nullableText(form.description),
      purposeId: form.purposeId || null,
      purposeDetail: nullableText(form.purposeDetail),
      legalBasis: form.legalBasis || null,
      legalBasisJustification,
      consentTemplateId: form.legalBasis === "CONSENT" ? form.consentTemplateId || null : null,
      dataCategories: form.dataCategories,
      dataSubjectCategories: form.dataSubjectCategories,
      internalOwnerId: form.internalOwnerId || null,
      retentionValue: hasRetention ? Number(form.retentionValue) : null,
      retentionUnit: hasRetention ? (form.retentionUnit as RetentionUnit) : null,
      retentionStartEvent: hasRetention ? (form.retentionStartEvent as RetentionStartEvent) : null,
      securityMeasures: form.securityMeasures,
      internationalTransferOccurs: form.internationalTransferOccurs,
      internationalTransferCountry: form.internationalTransferOccurs
        ? nullableText(form.internationalTransferCountry)
        : null,
      internationalTransferMechanism: form.internationalTransferOccurs
        ? nullableText(form.internationalTransferMechanism)
        : null,
      geolocationDuration: nullableText(form.geolocationDuration),
      geolocationSharedWithThirdParties:
        form.geolocationSharedWithThirdParties === "" ? null : form.geolocationSharedWithThirdParties,
      geolocationThirdPartiesIdentity: form.geolocationSharedWithThirdParties
        ? nullableText(form.geolocationThirdPartiesIdentity)
        : null,
    };
    return { ...base, name: form.name.trim() };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("El nombre del tratamiento es obligatorio");
      return;
    }

    const retentionError = validateRetentionFields();
    if (retentionError) {
      toast.error(retentionError);
      return;
    }

    const legalBasisError = validateLegalBasisFields();
    if (legalBasisError) {
      toast.error(legalBasisError);
      return;
    }

    setSubmitting(true);

    // Guarda anti-sobrescritura (solo edición): re-leemos la versión actual y,
    // si difiere de la base sobre la que empezamos a editar, abortamos con aviso
    // de conflicto para no pisar cambios de otra pestaña/usuario en silencio.
    if (mode === "edit" && initial) {
      const current = await fetchTreatment(companyId, initial.id);
      if (
        current.data &&
        baselineVersion !== undefined &&
        current.data.version !== baselineVersion
      ) {
        setSubmitting(false);
        toast.error(
          "Este tratamiento cambió mientras lo editabas. Recarga la página para ver la versión más reciente antes de guardar."
        );
        return;
      }
    }

    const payload = buildPayload();
    const res =
      mode === "create"
        ? await createTreatment(companyId, payload)
        : await updateTreatment(companyId, initial!.id, payload);
    setSubmitting(false);

    if (res.error) {
      // Concurrencia de versionado: dos ediciones simultáneas de un campo que
      // dispara versión. No se reintenta automáticamente (ADR-0001).
      if (
        res.error.code === "db/duplicate-key" ||
        res.error.status === 409
      ) {
        toast.error(
          "Este tratamiento cambió mientras lo editabas. Recarga la página y vuelve a intentarlo."
        );
        return;
      }
      showApiErrorToast(res.error, res.error.status);
      return;
    }

    toast.success(
      mode === "create" ? "Tratamiento creado" : "Cambios guardados"
    );
    // Actualizamos la base para permitir guardados sucesivos en el mismo form
    // sin falsos positivos de conflicto.
    if (res.data) {
      setBaselineVersion(res.data.version);
      onSaved(res.data);
    }
  }

  const inputBase =
    "h-11 w-full rounded-lg border border-disabled px-3 text-primary-900 outline-none focus:border-primary-900";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Identificación */}
      <section className={sectionClass}>
        <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
          Identificación
        </h2>
        <div className="flex flex-col gap-4">
          <CustomInput
            label="Nombre del tratamiento *"
            name="name"
            value={form.name}
            onChange={(e) => patch("name", e.target.value)}
            placeholder="Ej. Gestión de nómina de empleados"
          />
          <CustomTextarea
            label="Descripción"
            name="description"
            rows={3}
            value={form.description}
            onChange={(e) => patch("description", e.target.value)}
            placeholder="Describe brevemente en qué consiste la actividad de tratamiento."
          />
        </div>
      </section>

      {/* Finalidad y base legal */}
      <section className={sectionClass}>
        <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
          Finalidad y base legal
        </h2>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <CustomSelect
              label="Finalidad"
              options={purposeOptions}
              value={form.purposeId}
              unselectedText="— Sin finalidad —"
              onChange={(v) => patch("purposeId", v)}
            />
            <CustomSelect
              label="Base legal"
              options={legalBasisOptions}
              value={form.legalBasis}
              unselectedText="— Sin base legal —"
              onChange={(v) => patch("legalBasis", v as LegalBasis | "")}
            />
          </div>
          <CustomTextarea
            label="Detalle de la finalidad"
            name="purposeDetail"
            rows={2}
            value={form.purposeDetail}
            onChange={(e) => patch("purposeDetail", e.target.value)}
            placeholder="Complementa la finalidad seleccionada (no la reemplaza)."
          />
          {/* Item B6: ayuda contextual según la base legal elegida. Todas
              las variantes siguen escribiendo en legalBasisJustification —
              el backend no cambia, solo cambia qué se le pide al usuario. */}
          {form.legalBasis === "CONSENT" && (
            <div className="flex flex-col gap-1">
              <CustomSelect
                label="Plantilla de consentimiento *"
                options={consentTemplateOptions}
                value={form.consentTemplateId}
                unselectedText="— Selecciona una plantilla de consentimiento —"
                onChange={(v) => patch("consentTemplateId", v)}
              />
              <p className="pl-2 text-xs text-[#8B97AB]">
                Obligatoria para poder activar el tratamiento (Art. 12: el
                responsable debe poder probar el consentimiento válido del
                titular).
              </p>
            </div>
          )}
          {form.legalBasis === "LEGAL_OBLIGATION" && (
            <CustomInput
              label="Norma específica *"
              name="legalBasisJustification"
              value={form.legalBasisJustification}
              onChange={(e) => patch("legalBasisJustification", e.target.value)}
              placeholder="Ej. Ley 21.719, Art. 12 / Código del Trabajo, Art. 59"
            />
          )}
          {form.legalBasis === "LEGITIMATE_INTEREST" && (
            <div className="flex flex-col gap-4 rounded-xl border border-[#EAF0FA] bg-[#FAFCFF] p-4">
              <p className="text-xs text-[#64748B]">
                El interés legítimo exige documentar estos 3 elementos por
                separado (test de ponderación).
              </p>
              <CustomTextarea
                label="1. Finalidad legítima"
                name="legitimateInterestPurpose"
                rows={2}
                value={form.legitimateInterestPurpose}
                onChange={(e) => patch("legitimateInterestPurpose", e.target.value)}
                placeholder="¿Qué interés real y concreto persigue la empresa?"
              />
              <CustomTextarea
                label="2. Necesidad y proporcionalidad"
                name="legitimateInterestNecessity"
                rows={2}
                value={form.legitimateInterestNecessity}
                onChange={(e) => patch("legitimateInterestNecessity", e.target.value)}
                placeholder="¿Por qué este tratamiento es necesario y no hay una alternativa menos invasiva?"
              />
              <CustomTextarea
                label="3. Resultado del balance"
                name="legitimateInterestBalance"
                rows={2}
                value={form.legitimateInterestBalance}
                onChange={(e) => patch("legitimateInterestBalance", e.target.value)}
                placeholder="¿Por qué el interés de la empresa prevalece sobre los derechos del titular?"
              />
            </div>
          )}
          {(form.legalBasis === "" ||
            form.legalBasis === "CONTRACT_PERFORMANCE" ||
            form.legalBasis === "VITAL_INTEREST" ||
            form.legalBasis === "PUBLIC_INTEREST_OR_AUTHORITY" ||
            form.legalBasis === "PUBLIC_SOURCE") && (
            <CustomTextarea
              label="Justificación de la base legal"
              name="legalBasisJustification"
              rows={2}
              value={form.legalBasisJustification}
              onChange={(e) =>
                patch("legalBasisJustification", e.target.value)
              }
            />
          )}
        </div>
      </section>

      {/* Categorías */}
      <section className={sectionClass}>
        <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
          Datos y titulares
        </h2>
        <div className="flex flex-col gap-5">
          <EnumMultiSelect
            label="Categorías de datos"
            hint="Las categorías marcadas como (sensible) activan automáticamente el indicador de datos sensibles."
            options={DATA_CATEGORY_OPTIONS}
            value={form.dataCategories}
            onChange={(v) => patch("dataCategories", v)}
          />
          <div className="flex items-center gap-2 rounded-xl border border-[#EEF2F8] bg-[#F8FAFC] px-3 py-2 text-sm">
            <Icon
              icon={
                containsSensitiveData
                  ? "tabler:shield-lock"
                  : "tabler:shield-check"
              }
              className={
                containsSensitiveData
                  ? "text-lg text-rose-600"
                  : "text-lg text-emerald-600"
              }
            />
            <span className="text-[#475569]">
              Datos sensibles:{" "}
              <strong className="text-[#1A2B5B]">
                {containsSensitiveData ? "Sí" : "No"}
              </strong>{" "}
              <span className="text-xs text-[#94A3B8]">
                (calculado automáticamente por el sistema)
              </span>
            </span>
          </div>
          <EnumMultiSelect
            label="Categorías de titulares"
            options={DATA_SUBJECT_CATEGORY_OPTIONS}
            value={form.dataSubjectCategories}
            onChange={(v) => patch("dataSubjectCategories", v)}
          />
        </div>
      </section>

      {/* Item D (RF-72, Art. 16 sexies): controles adicionales cuando el
          tratamiento incluye geolocalización entre sus categorías de datos. */}
      {hasGeolocation && (
        <section className={sectionClass}>
          <h2 className="mb-1 text-sm font-semibold text-[#1A2B5B]">
            Geolocalización — controles adicionales
          </h2>
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-relaxed text-rose-900">
            <Icon icon="tabler:alert-triangle" className="mt-0.5 shrink-0 text-base" />
            Este tratamiento requiere controles adicionales (Art. 16 sexies).
          </div>
          <div className="flex flex-col gap-4">
            <CustomInput
              label="Duración del tratamiento de geolocalización *"
              name="geolocationDuration"
              value={form.geolocationDuration}
              onChange={(e) => patch("geolocationDuration", e.target.value)}
              placeholder="Ej. 6 meses desde la recolección"
            />
            <div className="flex flex-col gap-2">
              <span className="pl-2 text-sm font-medium text-stone-500">
                ¿Los datos de geolocalización se comunican a terceros? *
              </span>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#1A2B5B]">
                  <input
                    type="radio"
                    name="geolocationSharedWithThirdParties"
                    checked={form.geolocationSharedWithThirdParties === true}
                    onChange={() => patch("geolocationSharedWithThirdParties", true)}
                  />
                  Sí
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#1A2B5B]">
                  <input
                    type="radio"
                    name="geolocationSharedWithThirdParties"
                    checked={form.geolocationSharedWithThirdParties === false}
                    onChange={() => patch("geolocationSharedWithThirdParties", false)}
                  />
                  No
                </label>
              </div>
            </div>
            {form.geolocationSharedWithThirdParties === true && (
              <CustomInput
                label="Identidad de los terceros *"
                name="geolocationThirdPartiesIdentity"
                value={form.geolocationThirdPartiesIdentity}
                onChange={(e) => patch("geolocationThirdPartiesIdentity", e.target.value)}
                placeholder="Ej. Transportadora XYZ S.A."
              />
            )}
          </div>
        </section>
      )}

      {/* Item A (RF-01 a RF-07) — Inventario de Sistemas, "Paso 3.5". */}
      <TreatmentSystemsSection companyId={companyId} treatmentId={initial?.id ?? null} />

      {/* Responsable y conservación */}
      <section className={sectionClass}>
        <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
          Responsable y conservación
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {owners.length > 0 && (
            <CustomSelect
              label="Responsable interno"
              options={ownerOptions}
              value={form.internalOwnerId}
              unselectedText="— Sin responsable —"
              onChange={(v) => patch("internalOwnerId", v)}
            />
          )}
          <CustomInput
            label="Duración de la retención"
            name="retentionValue"
            type="number"
            min={1}
            value={form.retentionValue}
            onChange={(e) => patch("retentionValue", e.target.value)}
            placeholder="Ej. 5"
          />
          <CustomSelect
            label="Unidad"
            options={RETENTION_UNIT_OPTIONS}
            value={form.retentionUnit}
            unselectedText="— Selecciona una unidad —"
            onChange={(v) => patch("retentionUnit", v as RetentionUnit | "")}
          />
          <CustomSelect
            label="¿Qué evento inicia el conteo?"
            options={RETENTION_START_EVENT_OPTIONS}
            value={form.retentionStartEvent}
            unselectedText="— Selecciona un evento —"
            onChange={(v) => patch("retentionStartEvent", v as RetentionStartEvent | "")}
          />
        </div>
        {initial?.retentionPeriod && (
          <p className="mt-3 text-xs text-[#8B97AB]">
            Periodo de conservación (histórico, solo lectura): &ldquo;{initial.retentionPeriod}&rdquo;.
            Complétalo arriba con los campos estructurados para reemplazarlo.
          </p>
        )}
      </section>

      {/* Seguridad */}
      <section className={sectionClass}>
        <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
          Medidas de seguridad
        </h2>
        <EnumMultiSelect
          options={SECURITY_MEASURE_OPTIONS}
          value={form.securityMeasures}
          onChange={(v) => patch("securityMeasures", v)}
        />
      </section>

      {/* Transferencias internacionales */}
      <section className={sectionClass}>
        <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
          Transferencias internacionales
        </h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#1A2B5B]">
          <input
            type="checkbox"
            checked={form.internationalTransferOccurs}
            onChange={(e) =>
              patch("internationalTransferOccurs", e.target.checked)
            }
            className="rounded border-zinc-300"
          />
          Hay transferencia internacional de datos
        </label>
        {form.internationalTransferOccurs && (
          <div className="mt-4 flex flex-col gap-4">
            {/* Item B9: contenido educativo, sin campos nuevos — ayuda a
                reconocer transferencias internacionales "invisibles" (un SaaS
                extranjero, aunque no se piense en él como "transferencia"). */}
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <Icon icon="tabler:bulb" className="mt-0.5 shrink-0 text-lg text-amber-600" />
              <div className="text-xs leading-relaxed text-amber-900">
                <p className="font-semibold">
                  ¿Sabías que usar un SaaS extranjero ya cuenta como transferencia internacional?
                </p>
                <p className="mt-1">
                  No hace falta enviar un archivo manualmente a otro país: si
                  los datos quedan almacenados o procesados en servidores fuera
                  de tu país, ya es una transferencia. Ejemplos comunes:
                  Mailchimp y HubSpot (email marketing/CRM), Google Analytics
                  (analítica web), AWS y Google Cloud (hosting/almacenamiento),
                  Zendesk (soporte al cliente), Slack (comunicación interna).
                  Si tu empresa usa alguna herramienta así con los datos de
                  este tratamiento, indícalo abajo.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="pl-2 text-sm font-medium text-stone-500">
                  País de destino
                </label>
                <input
                  className={inputBase}
                  value={form.internationalTransferCountry}
                  onChange={(e) =>
                    patch("internationalTransferCountry", e.target.value)
                  }
                  placeholder="Ej. Estados Unidos"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="pl-2 text-sm font-medium text-stone-500">
                  Mecanismo de transferencia
                </label>
                <input
                  className={inputBase}
                  value={form.internationalTransferMechanism}
                  onChange={(e) =>
                    patch("internationalTransferMechanism", e.target.value)
                  }
                  placeholder="Ej. Cláusulas contractuales tipo"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          hierarchy="secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {mode === "create" ? "Crear tratamiento" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
};

export default TreatmentForm;
