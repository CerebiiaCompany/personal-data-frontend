"use client";

import Button from "@/components/base/Button";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import { fetchTreatments } from "@/lib/treatment.api";
import {
  createSystemInventory,
  fetchSystemCatalog,
  fetchSystemInventoryCountries,
  updateSystemInventory,
} from "@/lib/systemInventory.api";
import { CustomSelectOption } from "@/types/forms.types";
import {
  IsoCountry,
  SystemCatalogEntry,
  SystemInventory,
  SystemInventoryDeployment,
  SystemTreatmentRelationshipType,
  SYSTEM_INVENTORY_CATEGORY_OPTIONS,
  SYSTEM_INVENTORY_DEPLOYMENT_OPTIONS,
  SYSTEM_TREATMENT_RELATIONSHIP_OPTIONS,
} from "@/types/systemInventory.types";
import { Treatment } from "@/types/treatment.types";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Props {
  companyId: string;
  mode: "create" | "edit";
  initial?: SystemInventory | null;
  onSaved: (system: SystemInventory) => void;
  onCancel: () => void;
}

interface LinkDraft {
  treatmentId: string;
  relationshipType: SystemTreatmentRelationshipType | "";
}

const sectionClass =
  "rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6";

const CATALOG_OTHER_VALUE = "__other__";

export default function SystemInventoryForm({ companyId, mode, initial, onSaved, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [provider, setProvider] = useState(initial?.provider ?? "");
  const [deployment, setDeployment] = useState<SystemInventoryDeployment | "">(initial?.deployment ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [hasExternalAccess, setHasExternalAccess] = useState(initial?.hasExternalAccess ?? false);
  const [catalogId, setCatalogId] = useState<string | null>(initial?.catalogId ?? null);
  const [links, setLinks] = useState<LinkDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [catalog, setCatalog] = useState<SystemCatalogEntry[]>([]);
  const [countries, setCountries] = useState<IsoCountry[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);

  useEffect(() => {
    Promise.all([
      fetchSystemCatalog(companyId),
      fetchSystemInventoryCountries(companyId),
      mode === "create" ? fetchTreatments(companyId, { pageSize: 200 }) : Promise.resolve(null),
    ]).then(([catalogRes, countriesRes, treatmentsRes]) => {
      if (catalogRes.data) setCatalog(catalogRes.data);
      if (countriesRes.data) setCountries(countriesRes.data);
      if (treatmentsRes?.data) setTreatments(treatmentsRes.data);
    });
  }, [companyId, mode]);

  const catalogOptions: CustomSelectOption<string>[] = useMemo(
    () => [
      { value: CATALOG_OTHER_VALUE, title: "— Otro (completar manualmente) —" },
      ...catalog.map((entry) => ({ value: entry.id, title: entry.name })),
    ],
    [catalog]
  );

  const countryOptions: CustomSelectOption<string>[] = useMemo(() => {
    const fromApi = countries.map((c) => ({ value: c.code, title: c.name }));
    if (!fromApi.some((option) => option.value === "ZZ")) {
      fromApi.push({ value: "ZZ", title: "No estoy seguro" });
    }
    return fromApi;
  }, [countries]);

  // Complemento — Catálogo de Sistemas Predefinidos, Sección 4: lista fija
  // propuesta. Si un sistema existente (edición) trae un valor que no está
  // en esa lista — dato de antes de este selector, o cargado por otra
  // vía —, se antepone como opción propia para no cambiarlo ni blanquearlo
  // en silencio al abrir el formulario.
  const categoryOptions: CustomSelectOption<string>[] = useMemo(() => {
    if (initial?.category && !SYSTEM_INVENTORY_CATEGORY_OPTIONS.some((o) => o.value === initial.category)) {
      return [{ value: initial.category, title: initial.category }, ...SYSTEM_INVENTORY_CATEGORY_OPTIONS];
    }
    return SYSTEM_INVENTORY_CATEGORY_OPTIONS;
  }, [initial?.category]);

  const treatmentOptions: CustomSelectOption<string>[] = useMemo(
    () => treatments.map((t) => ({ value: t.id, title: t.name })),
    [treatments]
  );

  const usedTreatmentIds = useMemo(() => new Set(links.map((l) => l.treatmentId)), [links]);

  function applyCatalogSelection(selected: string) {
    if (selected === CATALOG_OTHER_VALUE) {
      setCatalogId(null);
      return;
    }
    const entry = catalog.find((e) => e.id === selected);
    if (!entry) return;
    setCatalogId(entry.id);
    setName((prev) => prev || entry.name);
    setCategory((prev) => prev || entry.category);
    setProvider((prev) => prev || entry.defaultProvider || "");
    if (entry.defaultDeployment) setDeployment((prev) => prev || entry.defaultDeployment!);
    if (entry.defaultCountry) setCountry((prev) => prev || entry.defaultCountry!);
  }

  function addLinkRow() {
    setLinks((prev) => [...prev, { treatmentId: "", relationshipType: "" }]);
  }

  function updateLinkRow(index: number, patch: Partial<LinkDraft>) {
    setLinks((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeLinkRow(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("El nombre del sistema es obligatorio");
      return;
    }
    if (!category.trim()) {
      toast.error("La categoría es obligatoria");
      return;
    }
    if (!deployment) {
      toast.error("Selecciona el tipo de despliegue");
      return;
    }
    if (!country) {
      toast.error("Selecciona el país donde reside el sistema");
      return;
    }
    const incompleteLink = links.some((l) => l.treatmentId && !l.relationshipType);
    if (incompleteLink) {
      toast.error("Cada tratamiento vinculado necesita un tipo de relación");
      return;
    }

    setSubmitting(true);

    const basePayload = {
      name: name.trim(),
      category: category.trim(),
      provider: provider.trim() || null,
      deployment,
      country,
      hasExternalAccess,
    };

    const res =
      mode === "create"
        ? await createSystemInventory(companyId, {
            ...basePayload,
            catalogId,
            links: links
              .filter((l) => l.treatmentId && l.relationshipType)
              .map((l) => ({
                treatmentId: l.treatmentId,
                relationshipType: l.relationshipType as SystemTreatmentRelationshipType,
              })),
          })
        : await updateSystemInventory(companyId, initial!.id, basePayload);

    setSubmitting(false);

    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }

    toast.success(mode === "create" ? "Sistema registrado" : "Cambios guardados");
    if (res.data) onSaved(res.data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <section className={sectionClass}>
        <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">Identificación</h2>
        <div className="flex flex-col gap-4">
          {mode === "create" && catalog.length > 0 && (
            <CustomSelect
              label="Sistema del catálogo (opcional)"
              options={catalogOptions}
              value={catalogId ?? CATALOG_OTHER_VALUE}
              unselectedText="— Selecciona —"
              onChange={applyCatalogSelection}
            />
          )}
          <CustomInput
            label="Nombre del sistema *"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Salesforce, Defontana, AWS S3"
          />
          <CustomSelect
            label="Categoría *"
            options={categoryOptions}
            value={category}
            unselectedText="— Selecciona una categoría —"
            onChange={setCategory}
          />
          <CustomInput
            label="Proveedor"
            name="provider"
            value={provider ?? ""}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="Ej. Salesforce Inc."
          />
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">Despliegue y ubicación</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <CustomSelect
            label="Despliegue *"
            options={SYSTEM_INVENTORY_DEPLOYMENT_OPTIONS}
            value={deployment}
            unselectedText="— Selecciona —"
            onChange={(v) => setDeployment(v)}
          />
          <CustomSelect
            label="País donde reside el sistema *"
            options={countryOptions}
            value={country}
            unselectedText="— Selecciona un país —"
            onChange={(v) => setCountry(v)}
          />
        </div>
        <p className="mt-2 text-xs text-[#64748B]">
          Si aún no puedes confirmar el país, elige «No estoy seguro». El sistema queda registrado y puedes
          actualizarlo después. Un país distinto de Chile, una vez confirmado, marca transferencia internacional
          en los tratamientos vinculados.
        </p>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-medium text-[#1A2B5B]">
          <input
            type="checkbox"
            checked={hasExternalAccess}
            onChange={(e) => setHasExternalAccess(e.target.checked)}
            className="rounded border-zinc-300"
          />
          El sistema tiene acceso externo (terceros o encargados)
        </label>
        <p className="mt-1 text-xs text-[#64748B]">
          Si lo marcas, el sistema quedará con un Acuerdo de Encargo de Tratamiento (DPA) pendiente.
        </p>
      </section>

      {mode === "create" && (
        <section className={sectionClass}>
          <h2 className="mb-1 text-sm font-semibold text-[#1A2B5B]">Tratamientos vinculados (opcional)</h2>
          <p className="mb-4 text-xs text-[#64748B]">
            Puedes vincular este sistema a tratamientos existentes ahora, o hacerlo después desde el
            detalle del sistema.
          </p>
          <div className="flex flex-col gap-3">
            {links.map((link, index) => (
              <div key={index} className="grid gap-3 rounded-xl border border-[#EAF0FA] bg-[#FAFCFF] p-3 sm:grid-cols-[1fr_1fr_auto]">
                <CustomSelect
                  label="Tratamiento"
                  options={treatmentOptions.filter(
                    (o) => o.value === link.treatmentId || !usedTreatmentIds.has(o.value)
                  )}
                  value={link.treatmentId}
                  unselectedText="— Selecciona —"
                  onChange={(v) => updateLinkRow(index, { treatmentId: v })}
                />
                <CustomSelect
                  label="Relación"
                  options={SYSTEM_TREATMENT_RELATIONSHIP_OPTIONS}
                  value={link.relationshipType}
                  unselectedText="— Selecciona —"
                  onChange={(v) => updateLinkRow(index, { relationshipType: v })}
                />
                <button
                  type="button"
                  onClick={() => removeLinkRow(index)}
                  className="inline-flex items-center justify-center self-end rounded-lg p-2.5 text-red-600 hover:bg-red-50"
                  aria-label="Quitar vínculo"
                >
                  <Icon icon="tabler:trash" className="text-lg" />
                </button>
              </div>
            ))}
            <div>
              <Button
                type="button"
                hierarchy="secondary"
                onClick={addLinkRow}
                startContent={<Icon icon="tabler:plus" className="text-lg" />}
              >
                Vincular tratamiento
              </Button>
            </div>
          </div>
        </section>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" hierarchy="tertiary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" hierarchy="primary" loading={submitting}>
          {mode === "create" ? "Registrar sistema" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
