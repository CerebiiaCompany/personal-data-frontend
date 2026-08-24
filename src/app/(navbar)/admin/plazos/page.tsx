"use client";

import Button from "@/components/base/Button";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useComplianceDashboard } from "@/hooks/useComplianceDashboard";
import { ComplianceArcoActiveRequest } from "@/types/compliance.types";
import {
  ARCO_DOC_TYPE_LABELS,
  formatArcoAssignedTo,
  formatArcoDate,
  formatArcoRequestLabel,
  getArcoDaysUntilDue,
} from "@/utils/arcoAdmin.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";

// Item PLAZ-005 (Art. 11) — vista de plazos activos con semáforo de
// urgencia. Reutiliza COMPLIANCE_getDashboard (arcoRequests.active), que ya
// trae TODAS las solicitudes PENDING/IN_PROGRESS con su dueDate — no se creó
// un endpoint nuevo, como pide el ítem.
// Semáforo visual de urgencia ARCO (30 días corridos - Ley 21.719):
// Verde: >= 15 días corridos restantes
// Ámbar: Entre 6 y 14 días corridos restantes
// Rojo / Crítico: <= 5 días corridos restantes o vencida
type Urgency = "green" | "amber" | "red";

const URGENCY_CONFIG: Record<
  Urgency,
  { label: string; dot: string; badge: string }
> = {
  green: { label: "Verde (≥15 días)", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  amber: { label: "Ámbar (6-14 días)", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  red: { label: "Rojo (≤5 días / Vencida)", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
};

function getUrgency(daysRemaining: number | null): Urgency {
  if (daysRemaining === null) return "green";
  if (daysRemaining <= 5) return "red";
  if (daysRemaining <= 14) return "amber";
  return "green";
}

export default function PlazosPage() {
  const companyId = useActiveCompanyId();
  const { data, loading, error, refresh } = useComplianceDashboard({ companyId });

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [assignedFilter, setAssignedFilter] = useState<string>("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("");

  const requests = data?.arcoRequests.active ?? [];

  const rows = useMemo(() => {
    return requests
      .map((r: ComplianceArcoActiveRequest) => ({
        ...r,
        daysRemaining: getArcoDaysUntilDue(r.dueDate),
      }))
      .map((r) => ({ ...r, urgency: getUrgency(r.daysRemaining) }))
      .sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0));
  }, [requests]);

  const assignees = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of requests) {
      if (r.assignedTo) map.set(r.assignedTo.id, formatArcoAssignedTo(r.assignedTo));
    }
    return [...map.entries()];
  }, [requests]);

  const filteredRows = rows.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (assignedFilter && r.assignedToId !== assignedFilter) return false;
    if (urgencyFilter && r.urgency !== urgencyFilter) return false;
    return true;
  });

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
                <Icon icon="tabler:chevron-right" className="text-base text-[#94A3B8]" />
                <span className="font-semibold text-[#1A2B5B]">Plazos</span>
              </nav>
              <h1 className="text-[26px] font-bold tracking-tight text-[#1A2B5B] sm:text-[28px]">
                Plazos activos
              </h1>
              <p className="max-w-2xl text-sm text-[#64748B]">
                Solicitudes ARCO pendientes o en curso, ordenadas por urgencia (Art. 11).
              </p>
            </div>
          </div>
        </header>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col gap-4 px-5 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <section className="rounded-2xl border border-[#E8EDF7] bg-white p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#64748B]">Estado</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
                <option value="">Todos</option>
                <option value="PENDING">Pendiente</option>
                <option value="IN_PROGRESS">En progreso</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#64748B]">Responsable</label>
              <select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)} className={inputClass}>
                <option value="">Todos</option>
                {assignees.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#64748B]">Urgencia</label>
              <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className={inputClass}>
                <option value="">Todas</option>
                {Object.entries(URGENCY_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="overflow-visible rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
          <div className="flex items-center justify-between border-b border-[#EEF2F8] px-4 py-3 sm:px-5">
            <span className="text-sm font-semibold text-[#1A2B5B]">
              {filteredRows.length} solicitud(es)
            </span>
            <Button hierarchy="tertiary" onClick={refresh} startContent={<Icon icon="tabler:refresh" />}>
              Actualizar
            </Button>
          </div>
          <div className="overflow-x-auto p-4 sm:p-5">
            {loading ? (
              <p className="py-8 text-center text-sm text-[#64748B]">Cargando…</p>
            ) : error ? (
              <p className="py-8 text-center text-sm text-red-600">{error}</p>
            ) : filteredRows.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#64748B]">
                No hay solicitudes activas con estos filtros.
              </p>
            ) : (
              <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Titular</th>
                    <th className="px-3 py-2">Recibida</th>
                    <th className="px-3 py-2">Vence</th>
                    <th className="px-3 py-2">Días restantes</th>
                    <th className="px-3 py-2">Responsable</th>
                    <th className="px-3 py-2">Urgencia</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => {
                    const cfg = URGENCY_CONFIG[r.urgency];
                    return (
                      <tr key={r.id} className="rounded-xl bg-[#F8FAFC] align-middle">
                        <td className="rounded-l-xl px-3 py-2.5 font-medium text-[#1A2B5B]">
                          {formatArcoRequestLabel(r.requestType as any)}
                        </td>
                        <td className="px-3 py-2.5 text-[#334155]">
                          {ARCO_DOC_TYPE_LABELS[r.docType as keyof typeof ARCO_DOC_TYPE_LABELS] ?? r.docType} ·{" "}
                          {r.docNumber}
                        </td>
                        <td className="px-3 py-2.5 text-[#334155]">{formatArcoDate(r.createdAt)}</td>
                        <td className="px-3 py-2.5 text-[#334155]">{formatArcoDate(r.dueDate)}</td>
                        <td className="px-3 py-2.5 font-medium text-[#1A2B5B]">
                          {r.daysRemaining !== null
                            ? r.daysRemaining < 0
                              ? `Vencido hace ${Math.abs(r.daysRemaining)}d`
                              : `${r.daysRemaining}d`
                            : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-[#334155]">{formatArcoAssignedTo(r.assignedTo)}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={clsx(
                              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                              cfg.badge
                            )}
                          >
                            <span className={clsx("h-2 w-2 rounded-full", cfg.dot)} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="rounded-r-xl px-3 py-2.5 text-right">
                          <Link
                            href={`/admin/arco/${r.id}`}
                            className="text-xs font-semibold text-primary-900 hover:underline"
                          >
                            Ver / actuar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
