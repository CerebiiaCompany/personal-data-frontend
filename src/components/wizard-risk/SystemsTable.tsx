"use client";

import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "@/components/base/Button";
import { SystemDeployment, SystemRecord } from "@/types/wizardRisk.types";
import ValidationMessage from "./ValidationMessage";

const DEPLOYMENT_LABELS: Record<SystemDeployment, string> = {
  cloud: "Cloud",
  onprem: "On-premise",
  hybrid: "Híbrido",
};

interface SystemsTableProps {
  systems: SystemRecord[];
  onChange: (systems: SystemRecord[]) => void;
  isLoading?: boolean;
  onPrevious?: () => void;
  onNext: () => void;
  showPreviousButton?: boolean;
}

const EMPTY_DRAFT = {
  name: "",
  provider: "",
  deployment: "cloud" as SystemDeployment,
  hasSensitiveData: false,
  dpoProvidesServices: false,
};

export default function SystemsTable({
  systems,
  onChange,
  isLoading = false,
  onPrevious,
  onNext,
  showPreviousButton = true,
}: SystemsTableProps) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [showValidationError, setShowValidationError] = useState(false);

  function handleAdd() {
    if (!draft.name.trim() || !draft.provider.trim()) return;
    const record: SystemRecord = { id: crypto.randomUUID(), ...draft };
    onChange([...systems, record]);
    setDraft(EMPTY_DRAFT);
    setShowValidationError(false);
  }

  function handleRemove(id: string) {
    onChange(systems.filter((s) => s.id !== id));
  }

  function handleNext() {
    if (systems.length === 0) {
      setShowValidationError(true);
      return;
    }
    onNext();
  }

  const canAddDraft = draft.name.trim().length > 0 && draft.provider.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
      <h2 className="text-lg font-semibold text-primary-900 sm:text-xl">
        Lista los sistemas que tratan datos personales
      </h2>
      <p className="mt-2 text-sm text-stone-500">
        Agrega al menos un sistema (CRM, ERP, planilla de cálculo, base de datos, etc.).
      </p>

      <div className="mt-5 flex flex-col gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Nombre del sistema"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            disabled={isLoading}
            aria-label="Nombre del sistema"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-primary-700 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Proveedor"
            value={draft.provider}
            onChange={(e) => setDraft((d) => ({ ...d, provider: e.target.value }))}
            disabled={isLoading}
            aria-label="Proveedor del sistema"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-primary-700 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            Despliegue
            <select
              value={draft.deployment}
              onChange={(e) => setDraft((d) => ({ ...d, deployment: e.target.value as SystemDeployment }))}
              disabled={isLoading}
              className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm focus:border-primary-700 focus:outline-none"
            >
              {Object.entries(DEPLOYMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={draft.hasSensitiveData}
              onChange={(e) => setDraft((d) => ({ ...d, hasSensitiveData: e.target.checked }))}
              disabled={isLoading}
              className="h-4 w-4 accent-primary-700"
            />
            Trata datos sensibles
          </label>

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={draft.dpoProvidesServices}
              onChange={(e) => setDraft((d) => ({ ...d, dpoProvidesServices: e.target.checked }))}
              disabled={isLoading}
              className="h-4 w-4 accent-primary-700"
            />
            Proveedor firma DPA (encargado)
          </label>
        </div>

        <Button
          hierarchy="secondary"
          className="w-full sm:w-auto"
          onClick={handleAdd}
          disabled={isLoading || !canAddDraft}
          startContent={<Icon icon="tabler:plus" />}
        >
          Agregar sistema
        </Button>
      </div>

      {systems.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] table-auto border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-stone-500">
                <th className="px-2">Sistema</th>
                <th className="px-2">Proveedor</th>
                <th className="px-2">Despliegue</th>
                <th className="px-2">Sensible</th>
                <th className="px-2">DPA</th>
                <th className="px-2" />
              </tr>
            </thead>
            <tbody>
              {systems.map((system) => (
                <tr key={system.id} className="rounded-lg bg-white shadow-sm">
                  <td className="rounded-l-lg px-2 py-2 font-medium text-primary-900">{system.name}</td>
                  <td className="px-2 py-2 text-stone-700">{system.provider}</td>
                  <td className="px-2 py-2 text-stone-700">{DEPLOYMENT_LABELS[system.deployment]}</td>
                  <td className="px-2 py-2 text-stone-700">{system.hasSensitiveData ? "Sí" : "No"}</td>
                  <td className="px-2 py-2 text-stone-700">{system.dpoProvidesServices ? "Sí" : "No"}</td>
                  <td className="rounded-r-lg px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(system.id)}
                      disabled={isLoading}
                      aria-label={`Eliminar ${system.name}`}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Icon icon="tabler:trash" className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showValidationError && (
        <ValidationMessage
          message="Debe listar al menos 1 sistema para continuar."
          onDismiss={() => setShowValidationError(false)}
        />
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {showPreviousButton && onPrevious ? (
          <Button hierarchy="secondary" className="w-full sm:w-auto" onClick={onPrevious} disabled={isLoading}>
            Anterior
          </Button>
        ) : (
          <span />
        )}
        <Button
          hierarchy={systems.length > 0 ? "primary" : "secondary"}
          className="w-full sm:w-auto"
          onClick={handleNext}
          loading={isLoading}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
