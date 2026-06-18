"use client";

import { Icon } from "@iconify/react";
import clsx from "clsx";
import { ConsentStatus } from "@/types/collectFormResponse.types";

export type ConsentStatusFilter = "ALL" | ConsentStatus;

const FILTER_OPTIONS: {
  id: ConsentStatusFilter;
  label: string;
  icon: string;
}[] = [
  { id: "ALL", label: "Todos", icon: "tabler:layout-grid" },
  { id: "ACTIVE", label: "Activos", icon: "tabler:circle-check" },
  { id: "PENDING", label: "Pendientes", icon: "tabler:clock" },
  { id: "REVOKED", label: "Revocados", icon: "tabler:circle-x" },
  {
    id: "CLAIM_IN_PROGRESS",
    label: "En trámite",
    icon: "tabler:file-alert",
  },
  { id: "LEGAL_DISPUTE", label: "Disputa legal", icon: "tabler:gavel" },
];

interface Props {
  activeFilter: ConsentStatusFilter;
  onChange: (filter: ConsentStatusFilter) => void;
  resultCount: number;
  totalCount: number;
  loading?: boolean;
}

export default function FormResponsesFilters({
  activeFilter,
  onChange,
  resultCount,
  totalCount,
  loading,
}: Props) {
  const hasActiveFilter = activeFilter !== "ALL";

  return (
    <div className="border-b border-[#EEF2F8] bg-[#FAFBFD] px-4 py-4 sm:px-5 sm:py-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#1A2B5B]">
            <Icon icon="tabler:filter" className="text-lg" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#0B1737]">
              Filtrar por consentimiento
            </p>
            <p className="text-[12px] text-[#64748B]">
              {loading ? (
                "Cargando registros…"
              ) : (
                <>
                  Mostrando{" "}
                  <span className="font-semibold text-[#334155]">
                    {resultCount}
                  </span>{" "}
                  de {totalCount}{" "}
                  {totalCount === 1 ? "registro" : "registros"}
                </>
              )}
            </p>
          </div>
        </div>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => onChange("ALL")}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#64748B] transition-colors hover:border-[#CBD5E1] hover:text-[#334155]"
          >
            <Icon icon="tabler:x" className="text-sm" />
            Limpiar filtro
          </button>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Estado de consentimiento"
        className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-[#E8EDF7] bg-[#EFF3FA] p-1"
      >
        {FILTER_OPTIONS.map((opt) => {
          const active = activeFilter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
              title={opt.label}
              onClick={() => onChange(opt.id)}
              className={clsx(
                "inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all sm:text-[13px]",
                active
                  ? "bg-white text-[#1A2B5B] shadow-[0_1px_4px_rgba(15,35,70,0.08)] ring-1 ring-[#E2E8F0]"
                  : "text-[#64748B] hover:bg-white/70 hover:text-[#334155]"
              )}
            >
              <Icon
                icon={opt.icon}
                className={clsx(
                  "shrink-0 text-[15px] sm:text-base",
                  active ? "text-[#2563EB]" : "text-[#94A3B8]"
                )}
              />
              <span className="whitespace-nowrap">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
