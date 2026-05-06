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
import Link from "next/link";

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
    "h-[42px] w-full px-3 border border-[#E4EAF6] rounded-xl text-sm bg-white text-[#0B1737] placeholder:text-[#9AA8C2] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-[#F8FAFC]">
      <div className="w-full px-5 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <header className="rounded-2xl border border-[#E8EDF7] bg-white px-5 py-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
              <Link href="/admin" className="hover:underline">
                Inicio
              </Link>
              <Icon icon="tabler:chevron-right" className="text-base text-[#94A3B8]" />
              <span className="font-semibold text-[#1A2B5B]">Auditoría</span>
            </nav>
            <div className="space-y-2">
              <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#1A2B5B] sm:text-[28px]">
                Auditoría
              </h1>
              <p className="text-sm leading-relaxed text-[#64748B]">
                Registro de acciones realizadas en la aplicación para tu organización.
              </p>
            </div>
          </div>
        </header>
      </div>

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
        <section className="rounded-2xl border border-[#E8EDF7] bg-white p-4 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3FF] text-primary-700">
                <Icon icon="tabler:filter" className="text-lg" />
              </div>
              <span className="text-sm font-semibold text-[#1A2B5B] sm:text-base">
                Filtros
              </span>
            </div>
            {hasActiveFilters && (
              <Button
                type="button"
                hierarchy="tertiary"
                onClick={clearFilters}
                className="text-xs sm:text-sm text-[#64748B] hover:text-primary-700"
                startContent={<Icon icon="tabler:eraser" className="text-base" />}
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {/* Rango de fechas */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                <Icon icon="tabler:calendar" className="text-base text-[#8CA0C3]" />
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
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                <Icon icon="tabler:calendar-due" className="text-base text-[#8CA0C3]" />
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
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                <Icon icon="tabler:activity" className="text-base text-[#8CA0C3]" />
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
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                <Icon icon="tabler:folder" className="text-base text-[#8CA0C3]" />
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
            <div className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                <Icon icon="tabler:user-search" className="text-base text-[#8CA0C3]" />
                Usuario
              </label>
              <div className="relative">
                <Icon
                  icon="tabler:search"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-[#9AA8C2]"
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
        </section>

        <section
          id="audit-table-container"
          className="mt-4 flex w-full min-w-0 flex-col overflow-visible rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]"
        >
          <div className="overflow-visible p-4 sm:p-5">
            <AuditLogsTable
              items={data}
              loading={loading}
              error={error}
              refresh={refresh}
            />
          </div>
          {meta ? (
            <div className="shrink-0 border-t border-[#EEF2F8] px-4 py-3 sm:px-5">
              <Pagination
                meta={meta}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
