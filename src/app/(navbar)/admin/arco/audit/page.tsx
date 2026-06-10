"use client";

import ArcoAuditTable from "@/components/arco/ArcoAuditTable";
import Button from "@/components/base/Button";
import Pagination from "@/components/base/Pagination";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useArcoMyAccess } from "@/hooks/useArcoMyAccess";
import { useCompanyArcoAudit } from "@/hooks/useCompanyArcoAudit";
import { useSessionStore } from "@/store/useSessionStore";
import {
  ARCO_REQUEST_TYPE_LABELS,
  ArcoRequestType,
} from "@/types/arco.types";
import { ARCO_AUDIT_EVENT_TYPE_OPTIONS } from "@/utils/arcoAdmin.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ArcoAuditPage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();
  const companyId = useActiveCompanyId();
  const { canView, loading: accessLoading } = useArcoMyAccess({ companyId });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [eventType, setEventType] = useState("");
  const [requestType, setRequestType] = useState<ArcoRequestType | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!accessLoading && user && !canView) {
      router.push("/sin-acceso");
    }
  }, [user, canView, accessLoading, router]);

  const { data, meta, loading, error, refresh } = useCompanyArcoAudit({
    companyId,
    page,
    pageSize,
    eventType: eventType || undefined,
    requestType: requestType || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    enabled: canView,
  });

  useEffect(() => {
    setPage(1);
  }, [eventType, requestType, dateFrom, dateTo]);

  const hasActiveFilters = eventType || requestType || dateFrom || dateTo;

  const clearFilters = () => {
    setEventType("");
    setRequestType("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  if (!user || accessLoading || !canView) return null;

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
                <Link href="/admin/arco" className="hover:underline">
                  Solicitudes ARCO
                </Link>
                <Icon icon="tabler:chevron-right" className="text-base" />
                <span className="font-semibold text-[#1A2B5B]">Trazabilidad</span>
              </nav>
              <h1 className="text-[26px] font-bold tracking-tight text-[#1A2B5B] sm:text-[28px]">
                Trazabilidad ARCO
              </h1>
              <p className="max-w-2xl text-sm text-[#64748B]">
                Línea de tiempo de eventos: creación, notificación a encargados,
                cambios de estado, asignaciones y respuestas.
              </p>
            </div>
            <Button
              hierarchy="tertiary"
              onClick={refresh}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#64748B]">Evento</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className={inputClass}
              >
                <option value="">Todos</option>
                {ARCO_AUDIT_EVENT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#64748B]">Tipo solicitud</label>
              <select
                value={requestType}
                onChange={(e) =>
                  setRequestType(e.target.value as ArcoRequestType | "")
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#64748B]">Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#64748B]">Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section
          id="arco-audit-table"
          className="overflow-visible rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]"
        >
          <div className="p-4 sm:p-5">
            <ArcoAuditTable items={data} loading={loading} error={error} />
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
