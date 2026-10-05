"use client";

import {
  SystemInventoryDeployment,
  SystemInventoryDpaStatus,
  SystemInventoryRiskLevel,
  SYSTEM_INVENTORY_DEPLOYMENT_OPTIONS,
  SYSTEM_INVENTORY_DPA_STATUS_LABELS,
  SYSTEM_INVENTORY_RISK_LEVEL_LABELS,
} from "@/types/systemInventory.types";
import { Icon } from "@iconify/react/dist/iconify.js";

export interface SystemInventoryFilterValues {
  deployment: SystemInventoryDeployment | "";
  riskLevel: SystemInventoryRiskLevel | "";
  dpaStatus: SystemInventoryDpaStatus | "";
  hasExternalAccess: "true" | "false" | "";
  search: string;
}

export const emptySystemInventoryFilters: SystemInventoryFilterValues = {
  deployment: "",
  riskLevel: "",
  dpaStatus: "",
  hasExternalAccess: "",
  search: "",
};

const DPA_STATUS_OPTIONS: { value: SystemInventoryDpaStatus; title: string }[] = [
  { value: "NOT_REQUIRED", title: SYSTEM_INVENTORY_DPA_STATUS_LABELS.NOT_REQUIRED },
  { value: "PENDING", title: SYSTEM_INVENTORY_DPA_STATUS_LABELS.PENDING },
  { value: "SIGNED", title: SYSTEM_INVENTORY_DPA_STATUS_LABELS.SIGNED },
];

const RISK_LEVEL_OPTIONS: { value: SystemInventoryRiskLevel; title: string }[] = [
  { value: "NORMAL", title: SYSTEM_INVENTORY_RISK_LEVEL_LABELS.NORMAL },
  { value: "ALTO", title: SYSTEM_INVENTORY_RISK_LEVEL_LABELS.ALTO },
];

interface Props {
  values: SystemInventoryFilterValues;
  inputClass: string;
  onChange: (patch: Partial<SystemInventoryFilterValues>) => void;
}

// Mismo patrón que TreatmentsFilters.tsx: grid de controles simples, sin
// debounce propio (el buscador por texto se debounce en la página).
const SystemInventoryFilters = ({ values, inputClass, onChange }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Despliegue</label>
        <select
          value={values.deployment}
          onChange={(e) => onChange({ deployment: e.target.value as SystemInventoryDeployment | "" })}
          className={inputClass}
        >
          <option value="">Todos</option>
          {SYSTEM_INVENTORY_DEPLOYMENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Nivel de riesgo</label>
        <select
          value={values.riskLevel}
          onChange={(e) => onChange({ riskLevel: e.target.value as SystemInventoryRiskLevel | "" })}
          className={inputClass}
        >
          <option value="">Todos</option>
          {RISK_LEVEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Estado del DPA</label>
        <select
          value={values.dpaStatus}
          onChange={(e) => onChange({ dpaStatus: e.target.value as SystemInventoryDpaStatus | "" })}
          className={inputClass}
        >
          <option value="">Todos</option>
          {DPA_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Acceso externo</label>
        <select
          value={values.hasExternalAccess}
          onChange={(e) => onChange({ hasExternalAccess: e.target.value as "true" | "false" | "" })}
          className={inputClass}
        >
          <option value="">Todos</option>
          <option value="true">Con acceso externo</option>
          <option value="false">Sin acceso externo</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Buscar</label>
        <div className="relative">
          <Icon
            icon="tabler:search"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <input
            type="text"
            value={values.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Buscar por nombre..."
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>
    </div>
  );
};

export default SystemInventoryFilters;
