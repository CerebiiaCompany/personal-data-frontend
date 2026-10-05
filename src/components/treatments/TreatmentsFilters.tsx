"use client";

import {
  LEGAL_BASIS_OPTIONS,
  LegalBasis,
  TREATMENT_STATUS_OPTIONS,
  TreatmentStatus,
  VERIFICATION_STATUS_LABELS,
  VerificationStatus,
} from "@/types/treatment.types";
import { Icon } from "@iconify/react/dist/iconify.js";

export interface TreatmentsFilterValues {
  status: TreatmentStatus | "";
  legalBasis: LegalBasis | "";
  containsSensitiveData: "true" | "false" | "";
  verificationStatus: VerificationStatus | "";
  search: string;
}

export const emptyTreatmentsFilters: TreatmentsFilterValues = {
  status: "",
  legalBasis: "",
  containsSensitiveData: "",
  verificationStatus: "",
  search: "",
};

// Item C-04/N-15 — CONFIRMED se omite a propósito: es el estado normal, sin
// incertidumbre, y ya es lo que se ve por defecto sin filtrar.
const PENDING_VERIFICATION_STATUS_OPTIONS: { value: VerificationStatus; title: string }[] = [
  { value: "PENDING_VERIFICATION", title: VERIFICATION_STATUS_LABELS.PENDING_VERIFICATION },
  { value: "PENDING_DEACTIVATION", title: VERIFICATION_STATUS_LABELS.PENDING_DEACTIVATION },
];

interface Props {
  values: TreatmentsFilterValues;
  inputClass: string;
  onChange: (patch: Partial<TreatmentsFilterValues>) => void;
}

// Mismo patrón que ArcoRequestsFilters.tsx (filtros del portal ARCO): grid de
// controles simples, sin debounce propio (el buscador por texto se debounce
// en la página, igual que ARCO lo hace con docNumber).
const TreatmentsFilters = ({ values, inputClass, onChange }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Estado</label>
        <select
          value={values.status}
          onChange={(e) => onChange({ status: e.target.value as TreatmentStatus | "" })}
          className={inputClass}
        >
          <option value="">Todos</option>
          {TREATMENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Base legal</label>
        <select
          value={values.legalBasis}
          onChange={(e) => onChange({ legalBasis: e.target.value as LegalBasis | "" })}
          className={inputClass}
        >
          <option value="">Todas</option>
          {LEGAL_BASIS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Datos sensibles</label>
        <select
          value={values.containsSensitiveData}
          onChange={(e) =>
            onChange({ containsSensitiveData: e.target.value as "true" | "false" | "" })
          }
          className={inputClass}
        >
          <option value="">Todos</option>
          <option value="true">Con datos sensibles</option>
          <option value="false">Sin datos sensibles</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Incertidumbre</label>
        <select
          value={values.verificationStatus}
          onChange={(e) =>
            onChange({ verificationStatus: e.target.value as VerificationStatus | "" })
          }
          className={inputClass}
        >
          <option value="">Todos</option>
          {PENDING_VERIFICATION_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.title}
            </option>
          ))}
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

export default TreatmentsFilters;
