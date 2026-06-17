"use client";

import { Icon } from "@iconify/react";
import clsx from "clsx";

export type StatusFilterTab =
  | "ALL"
  | "ACTIVE"
  | "SCHEDULED"
  | "PAUSED"
  | "COMPLETED";

export type TypeFilterTab = "ALL" | "MARKETING" | "CONSENT_REQUEST";

const STATUS_FILTERS: {
  id: StatusFilterTab;
  label: string;
  icon: string;
}[] = [
  { id: "ALL", label: "Todas", icon: "tabler:layout-grid" },
  { id: "ACTIVE", label: "Activas", icon: "tabler:player-play" },
  { id: "SCHEDULED", label: "Programadas", icon: "tabler:calendar-time" },
  { id: "PAUSED", label: "Pausadas", icon: "tabler:player-pause" },
  { id: "COMPLETED", label: "Completadas", icon: "tabler:circle-check" },
];

const TYPE_FILTERS: {
  id: TypeFilterTab;
  label: string;
  icon: string;
}[] = [
  { id: "ALL", label: "Todos", icon: "tabler:layout-grid" },
  { id: "MARKETING", label: "Marketing", icon: "tabler:speakerphone" },
  {
    id: "CONSENT_REQUEST",
    label: "Consentimiento",
    icon: "tabler:bell-ringing",
  },
];

interface Props {
  statusTab: StatusFilterTab;
  typeTab: TypeFilterTab;
  onStatusChange: (tab: StatusFilterTab) => void;
  onTypeChange: (tab: TypeFilterTab) => void;
  resultCount: number;
  totalCount: number;
  loading?: boolean;
}

function SegmentedGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string; icon: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">
        {label}
      </span>
      <div
        role="tablist"
        aria-label={label}
        className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-[#E8EDF7] bg-[#EFF3FA] p-1"
      >
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
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

export default function CampaignsFilters({
  statusTab,
  typeTab,
  onStatusChange,
  onTypeChange,
  resultCount,
  totalCount,
  loading,
}: Props) {
  const hasActiveFilters = statusTab !== "ALL" || typeTab !== "ALL";
  const activeFilterCount =
    (statusTab !== "ALL" ? 1 : 0) + (typeTab !== "ALL" ? 1 : 0);

  function clearFilters() {
    onStatusChange("ALL");
    onTypeChange("ALL");
  }

  return (
    <div className="border-b border-[#EEF2F8] bg-[#FAFBFD] px-4 py-4 sm:px-5 sm:py-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#1A2B5B]">
            <Icon icon="tabler:adjustments-horizontal" className="text-lg" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#0B1737]">
              Filtrar campañas
            </p>
            <p className="text-[12px] text-[#64748B]">
              {loading ? (
                "Cargando resultados…"
              ) : (
                <>
                  Mostrando{" "}
                  <span className="font-semibold text-[#334155]">
                    {resultCount}
                  </span>{" "}
                  de {totalCount}{" "}
                  {totalCount === 1 ? "campaña" : "campañas"}
                </>
              )}
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#64748B] transition-colors hover:border-[#CBD5E1] hover:text-[#334155]"
          >
            <Icon icon="tabler:x" className="text-sm" />
            Limpiar filtros
            {activeFilterCount > 0 && (
              <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1A2B5B] px-1 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-8">
        <SegmentedGroup
          label="Estado"
          options={STATUS_FILTERS}
          value={statusTab}
          onChange={onStatusChange}
        />
        <SegmentedGroup
          label="Tipo de campaña"
          options={TYPE_FILTERS}
          value={typeTab}
          onChange={onTypeChange}
        />
      </div>
    </div>
  );
}
