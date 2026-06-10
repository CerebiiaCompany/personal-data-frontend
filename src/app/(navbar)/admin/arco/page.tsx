"use client";

import ArcoOfficersManager from "@/components/arco/ArcoOfficersManager";
import ArcoRequestsFilters, {
  emptyArcoRequestsFilters,
} from "@/components/arco/ArcoRequestsFilters";
import ArcoRequestsTable from "@/components/arco/ArcoRequestsTable";
import ArcoSummaryCards from "@/components/arco/ArcoSummaryCards";
import Button from "@/components/base/Button";
import Pagination from "@/components/base/Pagination";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useArcoMyAccess } from "@/hooks/useArcoMyAccess";
import { useCompanyArcoRequests } from "@/hooks/useCompanyArcoRequests";
import { useCompanyArcoSummary } from "@/hooks/useCompanyArcoSummary";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { fetchArcoOfficers } from "@/lib/arcoAdmin.api";
import { useSessionStore } from "@/store/useSessionStore";
import { ArcoOfficerUser } from "@/types/arco.admin.types";
import { ArcoRequestStatus } from "@/types/arco.types";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ArcoAdminPage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();
  const companyId = useActiveCompanyId();
  const { canView, loading: accessLoading } = useArcoMyAccess({ companyId });

  const canManageOfficers =
    user?.role === "COMPANY_ADMIN" || user?.role === "SUPERADMIN";

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState(emptyArcoRequestsFilters);
  const [cardFilter, setCardFilter] = useState<string>("");
  const [officers, setOfficers] = useState<ArcoOfficerUser[]>([]);

  const { debouncedValue: docNumberDebounced, search: docNumberSearch, setSearch: setDocNumberSearch } =
    useDebouncedSearch();

  useEffect(() => {
    setFilters((prev) => ({ ...prev, docNumber: docNumberSearch }));
  }, [docNumberSearch]);

  useEffect(() => {
    if (!accessLoading && user && !canView) {
      router.push("/sin-acceso");
    }
  }, [user, canView, accessLoading, router]);

  useEffect(() => {
    if (!companyId || !canView) return;
    fetchArcoOfficers(companyId).then((res) => {
      setOfficers(res.data?.officers ?? []);
    });
  }, [companyId, canView]);

  const summaryQuery = useCompanyArcoSummary(companyId, canView);

  const listStatus = useMemo(() => {
    if (cardFilter === "overdue") return filters.status || undefined;
    if (cardFilter && cardFilter !== "overdue") {
      return cardFilter as ArcoRequestStatus;
    }
    return filters.status || undefined;
  }, [cardFilter, filters.status]);

  const overdueFilter = cardFilter === "overdue";

  const {
    data: requests,
    meta,
    loading,
    error,
    refresh,
  } = useCompanyArcoRequests({
    companyId,
    page,
    pageSize,
    status: listStatus,
    requestType: filters.requestType || undefined,
    docNumber: docNumberDebounced || undefined,
    assignedToId: filters.assignedToId || undefined,
    overdue: overdueFilter || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    enabled: canView,
  });

  useEffect(() => {
    setPage(1);
  }, [
    filters.status,
    filters.requestType,
    filters.assignedToId,
    filters.dateFrom,
    filters.dateTo,
    docNumberDebounced,
    cardFilter,
  ]);

  const handleCardFilter = (filter: string) => {
    setCardFilter((prev) => (prev === filter ? "" : filter));
    if (filter !== "overdue") {
      setFilters((prev) => ({
        ...prev,
        status: filter === cardFilter ? "" : (filter as ArcoRequestStatus),
      }));
    }
  };

  const clearFilters = () => {
    setFilters(emptyArcoRequestsFilters);
    setDocNumberSearch("");
    setCardFilter("");
    setPage(1);
  };

  const hasActiveFilters =
    filters.status ||
    filters.requestType ||
    filters.docNumber ||
    filters.assignedToId ||
    filters.dateFrom ||
    filters.dateTo ||
    cardFilter;

  if (!user || accessLoading || !canView) return null;

  const inputClass =
    "h-[42px] w-full px-3 border border-[#E4EAF6] rounded-xl text-sm bg-white text-[#0B1737] focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-[#F8FAFC]">
      <div className="w-full px-5 pt-4 pb-2 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <header className="rounded-2xl border border-[#E8EDF7] bg-white px-5 py-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <nav className="flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
                <Link href="/admin" className="hover:underline">
                  Inicio
                </Link>
                <Icon icon="tabler:chevron-right" className="text-base" />
                <span className="font-semibold text-[#1A2B5B]">
                  Solicitudes ARCO
                </span>
              </nav>
              <h1 className="text-[26px] font-bold tracking-tight text-[#1A2B5B] sm:text-[28px]">
                Gestión ARCO
              </h1>
              <p className="max-w-2xl text-sm text-[#64748B]">
                Atiende solicitudes de acceso, rectificación, cancelación y
                oposición de titulares de datos.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href="/admin/arco/audit">
                <Button
                  hierarchy="secondary"
                  startContent={<Icon icon="tabler:timeline" />}
                >
                  Trazabilidad
                </Button>
              </Link>
              <Button
                hierarchy="tertiary"
                onClick={() => {
                  summaryQuery.refresh();
                  refresh();
                }}
                startContent={<Icon icon="tabler:refresh" />}
              >
                Actualizar
              </Button>
            </div>
          </div>
        </header>

        <details
          open
          className="group mt-4 rounded-2xl border border-[#D4DEEE] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3FF] text-[#3357A5]">
                <Icon icon="tabler:user-shield" className="text-xl" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1A2B5B]">
                  Responsables ARCO
                </p>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  Encargados de recibir notificaciones y atender solicitudes
                </p>
              </div>
            </div>
            <Icon
              icon="tabler:chevron-down"
              className="shrink-0 text-lg text-[#64748B] transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="border-t border-[#EEF2F8] px-5 pb-5 pt-4 sm:px-6">
            {companyId ? (
              <ArcoOfficersManager
                companyId={companyId}
                canEdit={canManageOfficers}
              />
            ) : (
              <p className="text-sm text-[#64748B]">
                No se encontró la empresa activa.
              </p>
            )}
          </div>
        </details>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col gap-4 px-5 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <section className="rounded-2xl border border-[#E8EDF7] bg-white p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">Resumen</h2>
          <ArcoSummaryCards
            summary={summaryQuery.data}
            loading={summaryQuery.loading}
            activeFilter={cardFilter || filters.status}
            onFilterClick={handleCardFilter}
          />
        </section>

        <section className="rounded-2xl border border-[#E8EDF7] bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold text-[#1A2B5B]">Filtros</span>
            {hasActiveFilters && (
              <Button
                type="button"
                hierarchy="tertiary"
                onClick={clearFilters}
                startContent={<Icon icon="tabler:eraser" />}
                className="text-xs sm:text-sm"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
          <ArcoRequestsFilters
            values={{ ...filters, docNumber: docNumberSearch }}
            officers={officers}
            inputClass={inputClass}
            onChange={(patch) => {
              if ("docNumber" in patch) {
                setDocNumberSearch(patch.docNumber ?? "");
              }
              setFilters((prev) => ({ ...prev, ...patch }));
              if ("status" in patch) setCardFilter("");
            }}
          />
        </section>

        <section
          id="arco-table"
          className="overflow-visible rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]"
        >
          <div className="p-4 sm:p-5">
            <ArcoRequestsTable items={requests} loading={loading} error={error} />
          </div>
          {meta ? (
            <div className="border-t border-[#EEF2F8] px-4 py-3 sm:px-5">
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
