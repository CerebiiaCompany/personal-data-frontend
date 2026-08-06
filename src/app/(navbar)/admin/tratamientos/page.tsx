"use client";

import Button from "@/components/base/Button";
import Pagination from "@/components/base/Pagination";
import CheckPermission from "@/components/checkers/CheckPermission";
import ModuleHelpButton from "@/components/tour/ModuleHelpButton";
import TreatmentsFilters, {
  emptyTreatmentsFilters,
} from "@/components/treatments/TreatmentsFilters";
import TreatmentsTable from "@/components/treatments/TreatmentsTable";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { useTreatments } from "@/hooks/useTreatments";
import { downloadTreatmentsExport } from "@/lib/treatment.api";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAVY = "#1A2B5B";

export default function TreatmentsPage() {
  const companyId = useActiveCompanyId();
  const { shouldFetch } = usePermissionCheck();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState(emptyTreatmentsFilters);
  const { debouncedValue: searchDebounced, search: searchValue, setSearch: setSearchValue } =
    useDebouncedSearch();
  // Item RAT-009 (Art. 14)
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);

  async function handleExport(format: "pdf" | "xlsx") {
    if (!companyId) return;
    setExporting(format);
    const res = await downloadTreatmentsExport(companyId, format);
    setExporting(null);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
    }
  }

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: searchValue }));
  }, [searchValue]);

  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.legalBasis, filters.containsSensitiveData, searchDebounced]);

  const clearFilters = () => {
    setFilters(emptyTreatmentsFilters);
    setSearchValue("");
    setPage(1);
  };

  const hasActiveFilters =
    filters.status || filters.legalBasis || filters.containsSensitiveData || filters.search;

  const { data, meta, loading, error, refresh } = useTreatments({
    companyId,
    page,
    pageSize,
    status: filters.status || undefined,
    legalBasis: filters.legalBasis || undefined,
    containsSensitiveData:
      filters.containsSensitiveData === "" ? undefined : filters.containsSensitiveData === "true",
    search: searchDebounced || undefined,
    enabled: shouldFetch("treatments.view"),
  });

  return (
    <div className="flex min-h-full w-full flex-col bg-[#F8FAFC]">
      <div className="w-full shrink-0 px-5 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <header
          data-tour="tratamientos-header"
          className="rounded-2xl border border-[#E8EDF7] bg-white px-5 py-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:px-6 sm:py-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <nav className="flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
                  <Link href="/admin" className="hover:underline">
                    Inicio
                  </Link>
                  <Icon
                    icon="tabler:chevron-right"
                    className="shrink-0 text-base text-[#94A3B8]"
                  />
                  <span className="font-semibold" style={{ color: NAVY }}>
                    Tratamientos (RAT)
                  </span>
                </nav>
                <ModuleHelpButton tourId="tratamientos" />
              </div>
              <h1
                className="text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]"
                style={{ color: NAVY }}
              >
                Registro de Actividades de Tratamiento
              </h1>
              <p className="max-w-2xl text-[13px] leading-relaxed text-[#64748B] sm:text-sm">
                Inventario de las actividades de tratamiento de datos personales
                de la empresa, su base legal, categorías y ciclo de vida.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">
              <Button
                hierarchy="tertiary"
                onClick={refresh}
                startContent={<Icon icon="tabler:refresh" />}
              >
                Actualizar
              </Button>
              <Button
                hierarchy="secondary"
                loading={exporting === "pdf"}
                disabled={exporting !== null}
                onClick={() => handleExport("pdf")}
                startContent={<Icon icon="tabler:file-type-pdf" />}
              >
                Exportar PDF
              </Button>
              <Button
                hierarchy="secondary"
                loading={exporting === "xlsx"}
                disabled={exporting !== null}
                onClick={() => handleExport("xlsx")}
                startContent={<Icon icon="tabler:file-type-xls" />}
              >
                Exportar XLSX
              </Button>
              <div data-tour="tratamientos-create">
                <CheckPermission group="treatments" permission="create">
                  <Button
                    href="/admin/tratamientos/crear"
                    className="rounded-xl! border-[#1A2B5B]! bg-[#1A2B5B]! px-5! py-2.5! text-[13px]! font-semibold! text-white!"
                    startContent={<Icon icon="tabler:plus" className="text-lg" />}
                  >
                    Nuevo tratamiento
                  </Button>
                </CheckPermission>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="w-full px-5 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <section
          data-tour="tratamientos-filters"
          className="rounded-2xl border border-[#E8EDF7] bg-white px-5 py-4 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:px-6"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold" style={{ color: NAVY }}>
              Filtros
            </h2>
            {hasActiveFilters ? (
              <Button hierarchy="tertiary" onClick={clearFilters} className="text-xs!">
                Limpiar filtros
              </Button>
            ) : null}
          </div>
          <TreatmentsFilters
            values={{ ...filters, search: searchValue }}
            inputClass="h-[42px] w-full px-3 border border-[#E4EAF6] rounded-xl text-sm bg-white text-[#0B1737] focus:outline-none focus:ring-2 focus:ring-primary-500"
            onChange={(patch) => {
              if (patch.search !== undefined) {
                setSearchValue(patch.search);
                return;
              }
              setFilters((prev) => ({ ...prev, ...patch }));
            }}
          />
        </section>
      </div>

      <div className="w-full px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
        <section
          data-tour="tratamientos-table"
          className="overflow-hidden rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]"
        >
          <TreatmentsTable items={data} loading={loading} error={error} />
          {meta ? (
            <div className="border-t border-[#EEF2F8] px-4 py-2 sm:px-5">
              <Pagination
                meta={meta}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
