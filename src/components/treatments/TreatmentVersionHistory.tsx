"use client";

import { useTreatmentVersions } from "@/hooks/useTreatmentVersions";
import {
  LEGAL_BASIS_LABELS,
  LegalBasis,
  TreatmentPurpose,
  TreatmentVersionChange,
  TREATMENT_VERSION_FIELD_LABELS,
} from "@/types/treatment.types";
import { Icon } from "@iconify/react";
import { useEffect } from "react";

interface Props {
  companyId: string;
  treatmentId: string;
  /** Versión viva del tratamiento; al cambiar, se re-consulta el historial. */
  version: number;
  purposes?: TreatmentPurpose[];
  enabled?: boolean;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const cardClass =
  "rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6";

const TreatmentVersionHistory = ({
  companyId,
  treatmentId,
  version,
  purposes,
  enabled = true,
}: Props) => {
  const { data, loading, error, refresh } = useTreatmentVersions({
    companyId,
    treatmentId,
    enabled,
  });

  // Re-consulta cuando el tratamiento cambia de versión (tras una edición).
  useEffect(() => {
    if (enabled) refresh();
  }, [version, enabled, refresh]);

  function formatValue(field: string, value: string | null): string {
    if (value === null || value === "") return "—";
    if (field === "legalBasis") {
      return LEGAL_BASIS_LABELS[value as LegalBasis] ?? value;
    }
    if (field === "purposeId") {
      return purposes?.find((p) => p.id === value)?.label ?? value;
    }
    return value;
  }

  function renderChange(change: TreatmentVersionChange) {
    const label =
      TREATMENT_VERSION_FIELD_LABELS[change.field] ?? change.field;
    return (
      <li key={change.field} className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
          {label}
        </span>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-md bg-[#F1F5FB] px-2 py-0.5 text-[#94A3B8] line-through">
            {formatValue(change.field, change.before)}
          </span>
          <Icon icon="tabler:arrow-right" className="text-[#94A3B8]" />
          <span className="rounded-md bg-[#EEF3FF] px-2 py-0.5 font-medium text-[#1A2B5B]">
            {formatValue(change.field, change.after)}
          </span>
        </div>
      </li>
    );
  }

  return (
    <section className={`${cardClass} lg:col-span-2`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#1A2B5B]">
          Historial de versiones
        </h2>
        <span className="text-xs text-[#94A3B8]">Versión actual: {version}</span>
      </div>

      {loading && data.length === 0 ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-[#F1F5FB]" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-[#64748B]">{error}</p>
      ) : data.length === 0 ? (
        <div className="flex items-start gap-2 rounded-xl border border-[#EEF2F8] bg-[#F8FAFC] px-3 py-3 text-sm text-[#64748B]">
          <Icon icon="tabler:history" className="mt-0.5 shrink-0 text-base text-[#94A3B8]" />
          Sin cambios registrados todavía. Las ediciones de finalidad, base
          legal, justificación o periodo de conservación quedarán versionadas
          aquí para trazabilidad.
        </div>
      ) : (
        <ol className="flex flex-col gap-4">
          {data.map((entry) => (
            <li key={entry.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF3FF] text-xs font-bold text-[#3357A5]">
                  v{entry.version}
                </span>
                <span className="mt-1 w-px flex-1 bg-[#E8EDF7]" />
              </div>
              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#64748B]">
                  <span className="font-semibold text-[#1A2B5B]">
                    {formatDateTime(entry.createdAt)}
                  </span>
                  {entry.changedBy && (
                    <span>
                      · por {entry.changedBy.name} {entry.changedBy.lastName}
                    </span>
                  )}
                </div>
                {entry.changeReason && (
                  <p className="mt-1 text-xs italic text-[#64748B]">
                    “{entry.changeReason}”
                  </p>
                )}
                <ul className="mt-2 flex flex-col gap-2">
                  {entry.changes.map(renderChange)}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default TreatmentVersionHistory;
