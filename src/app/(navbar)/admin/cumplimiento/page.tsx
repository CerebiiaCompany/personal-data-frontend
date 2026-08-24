"use client";

import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useComplianceDashboard } from "@/hooks/useComplianceDashboard";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import Link from "next/link";

// Fase 1 PRD v2.2 item C (RF-33 a RF-35) — Dashboard de Cumplimiento. Todo
// se lee en vivo desde useComplianceDashboard (sin caché, ver
// compliance.controller.ts). Sin librerías de gráficos nuevas: reutiliza el
// patrón de stat-tiles ya usado en /admin (DashboardStatCard) y colores de
// estado ya establecidos en este mismo módulo (TreatmentStatusBadge,
// ArchiveTreatmentDialog) — emerald/amber/rose, no una paleta nueva.

const cardClass =
  "rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6";

function StatTile({
  icon,
  label,
  value,
  subtitle,
  loading,
}: {
  icon: string;
  label: string;
  value: string;
  subtitle?: string;
  loading?: boolean;
}) {
  if (loading) {
    return <div className="h-[128px] w-full animate-pulse rounded-2xl bg-[#EEF3FB]" />;
  }
  return (
    <div className="flex min-h-[128px] flex-col justify-between rounded-2xl border border-[#E5EBF7] bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(15,35,70,0.04)]">
      <div className="flex items-center gap-2 text-[#2A4F96]">
        <span className="grid h-7 w-7 place-content-center rounded-full border border-[#E6ECFB] bg-[#F3F6FF]">
          <Icon icon={icon} className="text-[15px] text-[#5B76B3]" />
        </span>
        <p className="text-[14px] font-medium text-[#2C416F]">{label}</p>
      </div>
      <div>
        <p className="text-[32px] font-bold leading-none text-[#08152F]">{value}</p>
        {subtitle && <p className="mt-2 text-sm text-[#6C7FA6]">{subtitle}</p>}
      </div>
    </div>
  );
}

function scoreStatus(score: number): { className: string; label: string } {
  if (score >= 75) return { className: "text-emerald-600 border-emerald-200 bg-emerald-50", label: "Buen nivel" };
  if (score >= 50) return { className: "text-amber-600 border-amber-200 bg-amber-50", label: "Atención" };
  return { className: "text-rose-600 border-rose-200 bg-rose-50", label: "Crítico" };
}

const CRITERIA_LABELS: Record<string, string> = {
  hasActiveRat: "Tiene al menos un tratamiento (RAT) activo",
  hasPublishedPolicy: "Tiene una política de tratamiento publicada",
  hasDesignatedDataOfficer: "Tiene un Oficial de Protección de Datos (DPO) designado",
  hasNoOverdueArcoRequests: "No tiene solicitudes ARCO vencidas",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ComplianceDashboardPage() {
  const companyId = useActiveCompanyId();
  const { data, loading } = useComplianceDashboard({ companyId, enabled: Boolean(companyId) });

  const score = data?.complianceScore.value ?? 0;
  const status = scoreStatus(score);

  return (
    <div className="flex h-full max-h-full flex-col gap-5 overflow-y-auto bg-[#F8FAFE] p-5 sm:p-6 md:p-7">
      <section className={cardClass}>
        <h1 className="text-[24px] font-bold leading-tight text-[#0A1633] sm:text-[26px]">
          Dashboard de Cumplimiento
        </h1>
        <p className="mt-1 text-sm text-[#60749C]">
          Estado en tiempo real del RAT, solicitudes ARCO y consentimientos —
          sin caché, calculado en cada carga.
        </p>
      </section>

      {/* Score de cumplimiento — hero number, no un chart. */}
      <section className={cardClass}>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#1A2B5B]">Score de cumplimiento</h2>
            <p className="mt-1 text-xs text-[#64748B]">
              4 criterios de igual peso (25 pts c/u).
            </p>
          </div>
          {!loading && (
            <span
              className={clsx(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold",
                status.className
              )}
            >
              {status.label}
            </span>
          )}
        </div>
        {loading ? (
          <div className="mt-4 h-16 w-32 animate-pulse rounded-xl bg-[#EEF3FB]" />
        ) : (
          <p className="mt-2 text-[56px] font-bold leading-none text-[#08152F]">
            {score}
            <span className="text-2xl font-semibold text-[#94A3B8]">/100</span>
          </p>
        )}
        {data && (
          <ul className="mt-5 flex flex-col gap-2">
            {Object.entries(data.complianceScore.criteria).map(([key, met]) => (
              <li key={key} className="flex items-center gap-2 text-sm">
                <Icon
                  icon={met ? "tabler:circle-check-filled" : "tabler:circle-x-filled"}
                  className={met ? "text-lg text-emerald-600" : "text-lg text-rose-500"}
                />
                <span className={met ? "text-[#334155]" : "text-[#334155] font-medium"}>
                  {CRITERIA_LABELS[key] ?? key}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon="tabler:list-details"
          label="Tratamientos activos"
          value={data ? `${data.treatments.activePercentage}%` : "—"}
          subtitle={data ? `${data.treatments.active} de ${data.treatments.total} tratamientos` : undefined}
          loading={loading}
        />
        <StatTile
          icon="tabler:scale"
          label="Solicitudes ARCO abiertas"
          value={data ? String(data.arcoRequests.open) : "—"}
          subtitle={data ? `${data.arcoRequests.overdue} vencidas · ${data.arcoRequests.resolvedThisMonth} resueltas este mes` : undefined}
          loading={loading}
        />
        <StatTile
          icon="tabler:shield-check"
          label="Consentimientos activos"
          value={data ? String(data.consents.active) : "—"}
          subtitle={data ? `${data.consents.revoked} revocados` : undefined}
          loading={loading}
        />
        <StatTile
          icon="tabler:alert-triangle"
          label="ARCO por vencer (5 días)"
          value={data ? String(data.arcoRequests.dueSoon.length) : "—"}
          subtitle="Alertas de vencimiento próximo"
          loading={loading}
        />
      </div>

      <section className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
          Solicitudes ARCO próximas a vencer
        </h2>
        {loading ? (
          <div className="h-24 w-full animate-pulse rounded-xl bg-[#EEF3FB]" />
        ) : data && data.arcoRequests.dueSoon.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  <th className="pb-2 pr-4">Tipo</th>
                  <th className="pb-2 pr-4">Documento</th>
                  <th className="pb-2">Vence</th>
                </tr>
              </thead>
              <tbody>
                {data.arcoRequests.dueSoon.map((req) => (
                  <tr key={req.id} className="border-t border-[#EEF2F8]">
                    <td className="py-2 pr-4 text-[#1A2B5B]">{req.requestType}</td>
                    <td className="py-2 pr-4 text-[#475569]">
                      {req.docType} {req.docNumber}
                    </td>
                    <td className="py-2 font-semibold text-amber-700">{formatDate(req.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[#94A3B8]">
            No hay solicitudes ARCO por vencer en los próximos 5 días.
          </p>
        )}
        <Link
          href="/admin/arco"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline"
        >
          Ver todas las solicitudes ARCO
          <Icon icon="tabler:arrow-right" className="text-sm" />
        </Link>
      </section>
    </div>
  );
}
