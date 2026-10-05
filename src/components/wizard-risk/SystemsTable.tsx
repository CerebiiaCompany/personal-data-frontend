"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "@/components/base/Button";
import { SystemRecord } from "@/types/wizardRisk.types";
import { emptySystemDraft, isCerebiiaSystem } from "@/utils/wizardInference";
import {
  canonicalizeServerCountry,
  DEFAULT_ISO_COUNTRIES,
  isConfirmedForeignCountry,
  UNKNOWN_SERVER_COUNTRY,
  UNKNOWN_SERVER_COUNTRY_LABEL,
} from "@/services/wizard-inference/engine/serverCountry";
import { fetchSystemCatalog, fetchSystemInventoryCountries } from "@/lib/systemInventory.api";
import { IsoCountry, SystemCatalogEntry } from "@/types/systemInventory.types";
import WizardStepShell from "./WizardStepShell";
import WizardStickyNav from "./WizardStickyNav";

const FIELDS: { key: keyof Pick<SystemRecord, "name" | "type" | "provider" | "storedData" | "serverCountry">; label: string; placeholder: string }[] = [
  { key: "name", label: "Nombre", placeholder: "Nombre del sistema" },
  { key: "type", label: "Tipo", placeholder: "Sitio web, SaaS, pagos…" },
  { key: "provider", label: "Proveedor", placeholder: "Proveedor o fabricante" },
  { key: "storedData", label: "Datos almacenados", placeholder: "Qué datos personales guarda" },
  { key: "serverCountry", label: "País del servidor", placeholder: "Seleccionar país" },
];

const DETAIL_FIELDS = FIELDS.filter((field) => field.key !== "name");

interface SystemsTableProps {
  systems: SystemRecord[];
  onChange: (systems: SystemRecord[]) => void;
  isLoading?: boolean;
  onPrevious?: () => void;
  onNext: () => void;
  showPreviousButton?: boolean;
  companyId?: string;
}

function catalogEntryToSystemRecord(entry: SystemCatalogEntry, countryCode: string): SystemRecord {
  const serverCountry = canonicalizeServerCountry(countryCode) || UNKNOWN_SERVER_COUNTRY;
  const abroad = isConfirmedForeignCountry(serverCountry);
  return {
    id: `catalog-${entry.id}`,
    name: entry.name,
    type: entry.category,
    provider: entry.defaultProvider || "Por confirmar",
    storedData: "Datos personales según el uso del sistema en la empresa",
    serverCountry,
    inferredFrom: "catalog",
    catalogId: entry.id,
    deployment: entry.defaultDeployment === "CLOUD" || abroad ? "cloud" : "onprem",
    hasSensitiveData: false,
    dpoProvidesServices: false,
  };
}

function isEmpty(value: string | undefined): boolean {
  return !(value ?? "").trim();
}

function isCountryMissing(value: string | undefined, countries: IsoCountry[]): boolean {
  return !canonicalizeServerCountry(value, countries);
}

function missingFieldsOf(row: SystemRecord, countries: IsoCountry[]) {
  return FIELDS.filter((field) =>
    field.key === "serverCountry" ? isCountryMissing(row.serverCountry, countries) : isEmpty(row[field.key])
  );
}

const inputClass =
  "w-full rounded-xl border border-[#D8E0EF] bg-[#F8FAFC] px-3.5 py-2.5 text-sm font-medium text-[#1A2B5B] placeholder:font-normal placeholder:text-[#94A3B8] outline-none transition-colors focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/15 disabled:bg-[#F1F5F9] disabled:text-[#64748B]";

const inputEmptyClass =
  "w-full rounded-xl border border-[#F0B429] bg-white px-3.5 py-2.5 text-sm font-medium text-[#1A2B5B] placeholder:font-normal placeholder:text-[#94A3B8] outline-none focus:border-[#D97706] focus:ring-2 focus:ring-amber-400/20";

function CountrySelect({
  value,
  countries,
  disabled,
  markEmpty,
  empty,
  onChange,
  ariaLabel,
}: {
  value: string;
  countries: IsoCountry[];
  disabled?: boolean;
  markEmpty?: boolean;
  empty?: boolean;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  const selected = canonicalizeServerCountry(value, countries);
  const extra =
    selected &&
    selected !== UNKNOWN_SERVER_COUNTRY &&
    !countries.some((country) => country.code === selected)
      ? [{ code: selected, name: value || selected }]
      : [];

  return (
    <select
      value={selected}
      disabled={disabled}
      aria-invalid={markEmpty}
      aria-label={ariaLabel}
      data-incomplete={empty ? "true" : undefined}
      onChange={(event) => onChange(event.target.value)}
      className={markEmpty ? inputEmptyClass : inputClass}
    >
      <option value="">Seleccionar país</option>
      {[...extra, ...countries].map((country) => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ))}
      <option value={UNKNOWN_SERVER_COUNTRY}>{UNKNOWN_SERVER_COUNTRY_LABEL}</option>
    </select>
  );
}

export default function SystemsTable({
  systems,
  onChange,
  isLoading = false,
  onPrevious,
  onNext,
  showPreviousButton = true,
  companyId,
}: SystemsTableProps) {
  const [draft, setDraft] = useState(emptySystemDraft());
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [catalog, setCatalog] = useState<SystemCatalogEntry[]>([]);
  const [countries, setCountries] = useState<IsoCountry[]>([]);
  const firstIncompleteRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!companyId) return;
    Promise.all([fetchSystemCatalog(companyId), fetchSystemInventoryCountries(companyId)]).then(
      ([catalogRes, countriesRes]) => {
        if (catalogRes.data) setCatalog(catalogRes.data);
        if (countriesRes.data) setCountries(countriesRes.data);
      }
    );
  }, [companyId]);

  const countryOptions = countries.length > 0 ? countries : DEFAULT_ISO_COUNTRIES;

  const usedNames = useMemo(
    () => new Set(systems.map((row) => row.name.trim().toLowerCase()).filter(Boolean)),
    [systems]
  );

  const catalogByCategory = useMemo(() => {
    const groups = new Map<string, SystemCatalogEntry[]>();
    for (const entry of catalog) {
      if (isCerebiiaSystem(entry)) continue;
      const list = groups.get(entry.category) ?? [];
      list.push(entry);
      groups.set(entry.category, list);
    }
    return [...groups.entries()];
  }, [catalog]);

  const incompleteRows = useMemo(
    () => systems.filter((row) => missingFieldsOf(row, countryOptions).length > 0),
    [systems, countryOptions]
  );

  function suggestFromCatalog(name: string): { provider?: string; serverCountry?: string } | null {
    const normalized = name.trim().toLowerCase();
    if (!normalized) return null;
    const entry = catalog.find((c) => c.name.trim().toLowerCase() === normalized);
    if (!entry) return null;
    return {
      provider: entry.defaultProvider || undefined,
      serverCountry: entry.defaultCountry || undefined,
    };
  }

  function updateRow(id: string, field: keyof SystemRecord, value: string) {
    onChange(systems.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function handleNameBlur(
    currentRow: Pick<SystemRecord, "name" | "provider" | "serverCountry">,
    apply: (patch: { provider?: string; serverCountry?: string }) => void
  ) {
    const suggestion = suggestFromCatalog(currentRow.name);
    if (!suggestion) return;
    const patch: { provider?: string; serverCountry?: string } = {};
    if (suggestion.provider && !currentRow.provider.trim()) patch.provider = suggestion.provider;
    if (suggestion.serverCountry && !currentRow.serverCountry.trim()) patch.serverCountry = suggestion.serverCountry;
    if (Object.keys(patch).length > 0) apply(patch);
  }

  function handleAddFromCatalog(entry: SystemCatalogEntry) {
    if (usedNames.has(entry.name.trim().toLowerCase())) return;
    const countryCode = entry.defaultCountry || "";
    onChange([...systems, catalogEntryToSystemRecord(entry, countryCode)]);
  }

  function handleAdd() {
    if (!draft.name.trim() || !draft.type.trim() || !draft.provider.trim() || !draft.storedData.trim() || !draft.serverCountry.trim()) {
      return;
    }
    onChange([...systems, { id: crypto.randomUUID(), ...draft }]);
    setDraft(emptySystemDraft());
  }

  function handleRemove(id: string) {
    const target = systems.find((row) => row.id === id);
    if (target && (target.locked || isCerebiiaSystem(target))) return;
    onChange(systems.filter((row) => row.id !== id));
  }

  function handleNext() {
    if (systems.length === 0 || incompleteRows.length > 0) {
      setAttemptedNext(true);
      firstIncompleteRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      firstIncompleteRef.current?.querySelector<HTMLElement>("[data-incomplete='true']")?.focus();
      return;
    }
    onNext();
  }

  const canAddDraft =
    draft.name.trim() && draft.type.trim() && draft.provider.trim() && draft.storedData.trim() && draft.serverCountry.trim();

  const warning =
    systems.length === 0
      ? "Agrega al menos un sistema para continuar."
      : incompleteRows.length > 0
        ? `Hay ${incompleteRows.length} sistema${incompleteRows.length === 1 ? "" : "s"} con campos vacíos.`
        : undefined;

  return (
    <>
      <WizardStepShell wide>
        <h2 className="text-xl font-bold tracking-tight text-[#1A2B5B] sm:text-2xl">Inventario de Sistemas</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
          El catálogo puede sugerir el país del servidor. Si no puedes confirmarlo, elige «No estoy seguro»:
          no se asume Chile ni una transferencia internacional, y quedará pendiente de verificar.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {systems.map((system, index) => {
            const locked = Boolean(system.locked || isCerebiiaSystem(system));
            const missing = missingFieldsOf(system, countryOptions);
            const incomplete = missing.length > 0;
            const isFirstIncomplete = incomplete && incompleteRows[0]?.id === system.id;
            const showEmpty = attemptedNext || incomplete;

            return (
              <article
                key={system.id}
                ref={isFirstIncomplete ? firstIncompleteRef : undefined}
                className="rounded-2xl border border-[#E4EAF6] bg-white p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                        Sistema {index + 1}
                      </span>
                      {locked && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1A2B5B]">
                          <Icon icon="tabler:lock" className="text-sm" />
                          CEREBIIA
                        </span>
                      )}
                      {incomplete && (
                        <span className="text-[11px] font-medium text-[#B45309]">
                          Falta {missing.map((field) => field.label.toLowerCase()).join(", ")}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={system.name}
                      placeholder="Nombre del sistema"
                      disabled={isLoading || locked}
                      aria-label={`Nombre del sistema ${index + 1}`}
                      data-incomplete={isEmpty(system.name) ? "true" : undefined}
                      onChange={(event) => updateRow(system.id, "name", event.target.value)}
                      onBlur={() =>
                        handleNameBlur(system, (patch) => {
                          onChange(systems.map((row) => (row.id === system.id ? { ...row, ...patch } : row)));
                        })
                      }
                      className={`${isEmpty(system.name) && showEmpty ? inputEmptyClass : inputClass} text-base`}
                    />
                  </div>
                  {!locked && (
                    <button
                      type="button"
                      onClick={() => handleRemove(system.id)}
                      disabled={isLoading}
                      aria-label={`Eliminar ${system.name || "sistema"}`}
                      className="mt-6 shrink-0 rounded-lg p-2 text-[#94A3B8] transition-colors hover:bg-[#F8FAFC] hover:text-red-600"
                    >
                      <Icon icon="tabler:trash" className="text-lg" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {DETAIL_FIELDS.map((field) => {
                    const empty =
                      field.key === "serverCountry"
                        ? isCountryMissing(system.serverCountry, countryOptions)
                        : isEmpty(system[field.key]);
                    const markEmpty = empty && showEmpty;
                    return (
                      <label
                        key={field.key}
                        className={field.key === "storedData" ? "flex min-w-0 flex-col gap-1.5 sm:col-span-2 lg:col-span-3" : "flex min-w-0 flex-col gap-1.5"}
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                          {field.label}
                        </span>
                        {field.key === "serverCountry" ? (
                          <CountrySelect
                            value={system.serverCountry ?? ""}
                            countries={countryOptions}
                            disabled={isLoading || locked}
                            markEmpty={markEmpty}
                            empty={empty}
                            ariaLabel={`${field.label} de ${system.name || "sistema"}`}
                            onChange={(value) => updateRow(system.id, field.key, value)}
                          />
                        ) : (
                          <input
                            type="text"
                            value={system[field.key] ?? ""}
                            placeholder={field.placeholder}
                            disabled={isLoading || (locked && field.key !== "storedData")}
                            aria-invalid={markEmpty}
                            aria-label={`${field.label} de ${system.name || "sistema"}`}
                            data-incomplete={empty ? "true" : undefined}
                            onChange={(event) => updateRow(system.id, field.key, event.target.value)}
                            className={markEmpty ? inputEmptyClass : inputClass}
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              </article>
            );
          })}

          {systems.length === 0 && (
            <p className="rounded-2xl border border-dashed border-[#D8E0EF] px-4 py-10 text-center text-sm text-[#64748B]">
              No se identificaron sistemas automáticamente. Agrega al menos uno para continuar.
            </p>
          )}
        </div>

        {catalogByCategory.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-[#1A2B5B]">Catálogo predefinido</p>
            <p className="mt-1 text-sm text-[#64748B]">Pulsa los que usa tu empresa.</p>
            <div className="mt-3 space-y-3">
              {catalogByCategory.map(([category, entries]) => (
                <div key={category}>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {entries.map((entry) => {
                      const added = usedNames.has(entry.name.trim().toLowerCase());
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          disabled={isLoading || added}
                          onClick={() => handleAddFromCatalog(entry)}
                          className={
                            added
                              ? "rounded-full bg-[#EEF2FF] px-3 py-1.5 text-xs font-medium text-[#1A2B5B]"
                              : "rounded-full border border-[#D8E0EF] bg-white px-3 py-1.5 text-xs font-medium text-[#1A2B5B] transition-colors hover:border-[#1A2B5B]"
                          }
                        >
                          {added ? entry.name : `+ ${entry.name}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-[#E4EAF6] pt-5">
          <p className="mb-3 text-sm font-semibold text-[#1A2B5B]">Otro sistema</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FIELDS.map((field) =>
              field.key === "serverCountry" ? (
                <CountrySelect
                  key={field.key}
                  value={draft.serverCountry}
                  countries={countryOptions}
                  disabled={isLoading}
                  ariaLabel={field.label}
                  onChange={(value) => setDraft((current) => ({ ...current, serverCountry: value }))}
                />
              ) : (
                <input
                  key={field.key}
                  type="text"
                  placeholder={field.label}
                  value={draft[field.key]}
                  disabled={isLoading}
                  aria-label={field.label}
                  onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                  onBlur={
                    field.key === "name"
                      ? () => handleNameBlur(draft, (patch) => setDraft((current) => ({ ...current, ...patch })))
                      : undefined
                  }
                  className={inputClass}
                />
              )
            )}
          </div>
          <Button
            hierarchy="secondary"
            className="mt-3 w-full rounded-xl! border-[#D7E2F5]! text-[#1A2B5B]! sm:w-auto"
            onClick={handleAdd}
            disabled={isLoading || !canAddDraft}
            startContent={<Icon icon="tabler:plus" />}
          >
            Agregar
          </Button>
        </div>
      </WizardStepShell>
      <WizardStickyNav
        onPrevious={onPrevious}
        onNext={handleNext}
        showPrevious={showPreviousButton}
        nextEnabled
        warning={warning}
        isLoading={isLoading}
      />
    </>
  );
}
