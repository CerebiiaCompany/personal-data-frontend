"use client";

import ArcoRequestsTable from "@/components/arco/ArcoRequestsTable";
import ArcoSummaryCards from "@/components/arco/ArcoSummaryCards";
import Button from "@/components/base/Button";
import Pagination from "@/components/base/Pagination";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useCompanyArcoRequests } from "@/hooks/useCompanyArcoRequests";
import { useCompanyArcoSummary } from "@/hooks/useCompanyArcoSummary";
import { usePermissions } from "@/hooks/usePermissions";
import { useSessionStore } from "@/store/useSessionStore";
import {
  ARCO_REQUEST_STATUS_LABELS,
  ARCO_REQUEST_TYPE_LABELS,
  ArcoRequestStatus,
  ArcoRequestType,
} from "@/types/arco.types";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ArcoAdminPage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const companyId = useActiveCompanyId();

  const canView = hasPermission("arcoRequests", "view");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<ArcoRequestStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<ArcoRequestType | "">("");
  const [cardFilter, setCardFilter] = useState<string>("");

  useEffect(() => {
    if (user && !canView) {
      router.push("/sin-acceso");
    }
  }, [user, canView, router]);

  const summaryQuery = useCompanyArcoSummary(companyId, canView);

  const listStatus = useMemo(() => {
    if (cardFilter === "overdue") return statusFilter || undefined;
    if (cardFilter && cardFilter !== "overdue") {
      return cardFilter as ArcoRequestStatus;
    }
    return statusFilter || undefined;
  }, [cardFilter, statusFilter]);

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
    requestType: typeFilter || undefined,
    enabled: canView,
  });

  const displayedRequests = useMemo(() => {
    if (!requests) return null;
    if (cardFilter !== "overdue") return requests;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return requests.filter((r) => {
      if (r.status === "RESOLVED" || r.status === "REJECTED") return false;
      const due = new Date(r.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < now;
    });
  }, [requests, cardFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, cardFilter]);

  const handleCardFilter = (filter: string) => {
    setCardFilter((prev) => (prev === filter ? "" : filter));
    if (filter !== "overdue") {
      setStatusFilter(filter === cardFilter ? "" : (filter as ArcoRequestStatus));
    }
  };

  const clearFilters = () => {
    setStatusFilter("");
    setTypeFilter("");
    setCardFilter("");
    setPage(1);
  };

  const hasActiveFilters = statusFilter || typeFilter || cardFilter;

  if (!user || !canView) return null;

  const inputClass =
    "h-[42px] w-full px-3 border border-[#E4EAF6] rounded-xl text-sm bg-white text-[#0B1737] focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-[#F8FAFC]">
      <div className="w-full px-5 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
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
                oposición de titulares de datos. Los encargados se configuran en{" "}
                <Link
                  href="/admin/administracion/perfil-empresa"
                  className="font-medium text-primary-900 underline"
                >
                  perfil de empresa
                </Link>
                .
              </p>
            </div>
            <Button
              hierarchy="tertiary"
              onClick={() => {
                summaryQuery.refresh();
                refresh();
              }}
              startContent={<Icon icon="tabler:refresh" />}
              className="shrink-0"
            >
              Actualizar
            </Button>
          </div>
        </header>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col gap-4 px-5 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <section className="rounded-2xl border border-[#E8EDF7] bg-white p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">Resumen</h2>
          <ArcoSummaryCards
            summary={summaryQuery.data}
            loading={summaryQuery.loading}
            activeFilter={cardFilter || statusFilter}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#64748B]">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ArcoRequestStatus | "");
                  setCardFilter("");
                }}
                className={inputClass}
              >
                <option value="">Todos</option>
                {(Object.keys(ARCO_REQUEST_STATUS_LABELS) as ArcoRequestStatus[]).map(
                  (s) => (
                    <option key={s} value={s}>
                      {ARCO_REQUEST_STATUS_LABELS[s]}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#64748B]">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as ArcoRequestType | "")
                }
                className={inputClass}
              >
                <option value="">Todos</option>
                {(Object.keys(ARCO_REQUEST_TYPE_LABELS) as ArcoRequestType[]).map(
                  (t) => (
                    <option key={t} value={t}>
                      {ARCO_REQUEST_TYPE_LABELS[t]}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </section>

        <section
          id="arco-table"
          className="overflow-visible rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]"
        >
          <div className="p-4 sm:p-5">
            <ArcoRequestsTable
              items={displayedRequests}
              loading={loading}
              error={error}
            />
          </div>
          {meta && cardFilter !== "overdue" ? (
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
