"use client";

import Button from "@/components/base/Button";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import CustomTextarea from "@/components/forms/CustomTextarea";
import EnumMultiSelect from "@/components/treatments/EnumMultiSelect";
import { useTreatmentPurposes } from "@/hooks/useTreatmentPurposes";
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
  dataCategories: DataCategory[];
  dataSubjectCategories: DataSubjectCategory[];
  internalOwnerId: string;
  retentionPeriod: string;
  securityMeasures: SecurityMeasure[];
  internationalTransferOccurs: boolean;
  internationalTransferCountry: string;
  internationalTransferMechanism: string;
}

function buildInitialState(t?: Treatment | null): FormState {
  return {
    name: t?.name ?? "",
    description: t?.description ?? "",
    purposeId: t?.purposeId ?? "",
    purposeDetail: t?.purposeDetail ?? "",
    legalBasis: t?.legalBasis ?? "",
    legalBasisJustification: t?.legalBasisJustification ?? "",
    dataCategories: t?.dataCategories ?? [],
    dataSubjectCategories: t?.dataSubjectCategories ?? [],
    internalOwnerId: t?.internalOwnerId ?? "",
    retentionPeriod: t?.retentionPeriod ?? "",
    securityMeasures: t?.securityMeasures ?? [],
    internationalTransferOccurs: t?.internationalTransferOccurs ?? false,
    internationalTransferCountry: t?.internationalTransferCountry ?? "",
    internationalTransferMechanism: t?.internationalTransferMechanism ?? "",
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

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildPayload(): CreateTreatmentPayload {
    const base: TreatmentInput = {
      description: nullableText(form.description),
      purposeId: form.purposeId || null,
      purposeDetail: nullableText(form.purposeDetail),
      legalBasis: form.legalBasis || null,
      legalBasisJustification: nullableText(form.legalBasisJustification),
      dataCategories: form.dataCategories,
      dataSubjectCategories: form.dataSubjectCategories,
      internalOwnerId: form.internalOwnerId || null,
      retentionPeriod: nullableText(form.retentionPeriod),
      securityMeasures: form.securityMeasures,
      internationalTransferOccurs: form.internationalTransferOccurs,
      internationalTransferCountry: form.internationalTransferOccurs
        ? nullableText(form.internationalTransferCountry)
        : null,
      internationalTransferMechanism: form.internationalTransferOccurs
        ? nullableText(form.internationalTransferMechanism)
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
          <CustomTextarea
            label="Justificación de la base legal"
            name="legalBasisJustification"
            rows={2}
            value={form.legalBasisJustification}
            onChange={(e) =>
              patch("legalBasisJustification", e.target.value)
            }
          />
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
            label="Periodo de conservación"
            name="retentionPeriod"
            value={form.retentionPeriod}
            onChange={(e) => patch("retentionPeriod", e.target.value)}
            placeholder="Ej. 5 años desde la terminación del contrato"
          />
        </div>
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
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
