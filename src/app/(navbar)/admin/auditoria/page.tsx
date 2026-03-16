"use client";

import AuditLogsTable from "@/components/audit/AuditLogsTable";
import Button from "@/components/base/Button";
import Pagination from "@/components/base/Pagination";
import { useCompanyActionLogs } from "@/hooks/useCompanyActionLogs";
import { usePermissions } from "@/hooks/usePermissions";
import { useSessionStore } from "@/store/useSessionStore";
import {
  userActionLogTargetModelOptions,
  userActionLogTypeOptions,
} from "@/types/userActionLogs.types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { Icon } from "@iconify/react";

export default function AuditoriaPage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [targetModelFilter, setTargetModelFilter] = useState<string>("");
  const { debouncedValue: searchUserDebounced, search: searchUser, setSearch: setSearchUser } = useDebouncedSearch();

  const canViewAudit = hasPermission("audit", "view");

  useEffect(() => {
    if (user && !canViewAudit) {
      router.push("/sin-acceso");
    }
  }, [user, canViewAudit, router]);

  const { data, meta, loading, error, refresh } = useCompanyActionLogs({
    companyId: user?.companyUserData?.companyId,
    page,
    pageSize,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    type: typeFilter || undefined,
    targetModel: targetModelFilter || undefined,
    searchUser: searchUserDebounced || undefined,
    enabled: canViewAudit,
  });

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, typeFilter, targetModelFilter, searchUserDebounced]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const container = document.getElementById("audit-table-container");
    if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const hasActiveFilters =
    startDate || endDate || typeFilter || targetModelFilter || searchUser;

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setTypeFilter("");
    setTargetModelFilter("");
    setSearchUser("");
    setPage(1);
  };

  if (!user || !canViewAudit) {
    return null;
  }

  const inputBaseClass =
    "px-3 py-2.5 border border-stone-200 rounded-xl text-sm bg-white text-primary-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow";

  return (
    <div className="w-full p-3 sm:p-4 md:p-5 rounded-md border border-disabled flex flex-col">
      <header className="w-full flex flex-col gap-4 mb-4 sm:mb-5">
        <h4 className="font-semibold text-lg sm:text-xl text-primary-900 text-center sm:text-left">
          Auditoría
        </h4>
        <p className="text-sm text-stone-600">
          Registro de acciones realizadas en la aplicación para tu organización.
        </p>

        {/* Panel de filtros */}
        <div className="rounded-xl border border-stone-200 bg-primary-50/40 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-100 text-primary-700">
                <Icon icon="tabler:filter" className="text-xl" />
              </div>
              <span className="font-medium text-primary-900 text-sm sm:text-base">
                Filtros
              </span>
            </div>
            {hasActiveFilters && (
              <Button
                type="button"
                hierarchy="tertiary"
                onClick={clearFilters}
                className="text-xs sm:text-sm text-stone-600 hover:text-primary-700"
                startContent={<Icon icon="tabler:x" className="text-base" />}
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-4">
            {/* Rango de fechas */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                <Icon icon="tabler:calendar" className="text-base text-stone-500" />
                Desde
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputBaseClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                <Icon icon="tabler:calendar-due" className="text-base text-stone-500" />
                Hasta
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputBaseClass}
              />
            </div>

            {/* Acción */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                <Icon icon="tabler:activity" className="text-base text-stone-500" />
                Acción
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={inputBaseClass}
              >
                <option value="">Todas</option>
                {userActionLogTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Recurso */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                <Icon icon="tabler:folder" className="text-base text-stone-500" />
                Recurso
              </label>
              <select
                value={targetModelFilter}
                onChange={(e) => setTargetModelFilter(e.target.value)}
                className={inputBaseClass}
              >
                <option value="">Todos</option>
                {userActionLogTargetModelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Usuario */}
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                <Icon icon="tabler:user-search" className="text-base text-stone-500" />
                Usuario
              </label>
              <div className="relative">
                <Icon
                  icon="tabler:search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-base pointer-events-none"
                />
                <input
                  type="search"
                  placeholder="Nombre o apellido..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className={`${inputBaseClass} w-full pl-9`}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div id="audit-table-container" className="flex-1 flex flex-col min-h-0">
        <AuditLogsTable
          items={data}
          loading={loading}
          error={error}
          refresh={refresh}
        />
        {meta && (
          <Pagination
            meta={meta}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
}
