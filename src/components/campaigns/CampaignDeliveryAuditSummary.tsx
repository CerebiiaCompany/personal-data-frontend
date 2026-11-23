"use client";

import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { toast } from "sonner";
import Button from "@/components/base/Button";
import { useConfirm } from "@/components/dialogs/ConfirmProvider";
import { retryFailedCampaignDeliveries } from "@/lib/campaignDelivery.api";
import {
  CampaignDeliveryReason,
  CampaignDeliverySummary,
} from "@/types/campaignDelivery.types";
import { describeProviderError, formatDeliveryDateTime } from "@/utils/campaignDelivery.utils";
import { parseApiError } from "@/utils/parseApiError";

interface Props {
  companyId: string;
  campaignId: string;
  summary: CampaignDeliverySummary | null;
  loading: boolean;
  canRetry: boolean;
  onChanged: () => void;
  /** Filtra la tabla de entregas por estado/motivo. */
  onFilter: (filter: { status?: "SUCCESS" | "FAILED" | "PENDING" | "DEFERRED"; reason?: string }) => void;
}

const fmt = (n: number) => n.toLocaleString("es-CO");

function KpiCard({
  label,
  value,
  hint,
  tone,
  icon,
  onClick,
}: {
  label: string;
  value: number;
  hint?: string;
  tone: "green" | "amber" | "orange" | "red" | "slate";
  icon: string;
  onClick?: () => void;
}) {
  const tones = {
    green: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    orange: "border-orange-100 bg-orange-50 text-orange-700",
    red: "border-red-100 bg-red-50 text-red-700",
    slate: "border-[#E8EDF7] bg-[#F8FAFC] text-[#334155]",
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={clsx(
        "flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition",
        tones[tone],
        onClick && "hover:brightness-[0.98] hover:shadow-sm"
      )}
    >
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">
        <Icon icon={icon} className="text-sm" />
        {label}
      </span>
      <span className="text-2xl font-bold tabular-nums">{fmt(value)}</span>
      {hint && <span className="text-[11px] opacity-80">{hint}</span>}
    </button>
  );
}

function ReasonsTable({
  title,
  reasons,
  tone,
  onSelect,
}: {
  title: string;
  reasons: CampaignDeliveryReason[];
  tone: "red" | "amber";
  onSelect?: (code: string) => void;
}) {
  if (!reasons.length) return null;
  return (
    <div className="rounded-xl border border-[#E8EDF7] overflow-hidden">
      <div
        className={clsx(
          "px-4 py-2 text-xs font-semibold",
          tone === "red" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"
        )}
      >
        {title}
      </div>
      <ul className="divide-y divide-[#EEF2F8]">
        {reasons.map((r, i) => {
          const hint = describeProviderError(r.code, null);
          return (
            <li key={`${r.code}-${i}`} className="flex items-start gap-3 px-4 py-2.5">
              <span
                className={clsx(
                  "mt-0.5 min-w-[42px] rounded-md px-1.5 py-0.5 text-center text-xs font-bold tabular-nums",
                  tone === "red" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                )}
              >
                {fmt(r.count)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#0B1737]">
                  {hint ?? r.message ?? "Sin detalle"}
                </p>
                {r.message && hint && r.message !== hint && (
                  <p className="mt-0.5 break-words text-[11px] text-[#64748B]">Proveedor: {r.message}</p>
                )}
                {r.code && <p className="mt-0.5 font-mono text-[10px] text-[#94A3B8]">{r.code}</p>}
              </div>
              {onSelect && r.code && (
                <button
                  type="button"
                  onClick={() => onSelect(r.code!)}
                  className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-primary-900 hover:bg-primary-50"
                >
                  Ver
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Auditoría de envío de la campaña: cuántos salieron, cuántos están en cola,
 * reprogramados (cupo diario) o fallidos y por qué; estado del cupo diario de
 * correo y reintento manual de los fallidos.
 */
export default function CampaignDeliveryAuditSummary({
  companyId,
  campaignId,
  summary,
  loading,
  canRetry,
  onChanged,
  onFilter,
}: Props) {
  const confirm = useConfirm();
  const [retrying, setRetrying] = useState(false);

  if (!summary) {
    return (
      <div className="px-4 py-6 text-sm text-[#64748B] sm:px-5">
        {loading ? "Cargando auditoría…" : "Sin datos de auditoría."}
      </div>
    );
  }

  const q = summary.emailQuota;
  const done = summary.sent + summary.failed;

  async function handleRetry() {
    const ok = await confirm({
      title: "Reintentar correos fallidos",
      description: `Se volverán a poner en cola ${fmt(summary!.failed)} correo(s) fallido(s). Respetan el cupo diario: si hoy ya no hay cupo, salen cuando se reinicie.`,
      confirmText: "Reintentar",
    });
    if (!ok) return;
    setRetrying(true);
    const res = await retryFailedCampaignDeliveries(companyId, campaignId);
    setRetrying(false);
    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }
    toast.success(`${fmt(res.data?.requeued ?? 0)} correo(s) puestos en cola para reintentar.`);
    onChanged();
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Enviados"
          value={summary.sent}
          tone="green"
          icon="tabler:circle-check"
          hint={summary.lastSentAt ? `Último: ${formatDeliveryDateTime(summary.lastSentAt)}` : undefined}
          onClick={() => onFilter({ status: "SUCCESS" })}
        />
        <KpiCard
          label="En cola"
          value={summary.queued + summary.retryQueued}
          tone="slate"
          icon="tabler:clock"
          hint={summary.retryQueued ? `${fmt(summary.retryQueued)} reintento(s)` : "Esperando su turno"}
          onClick={() => onFilter({ status: "PENDING" })}
        />
        <KpiCard
          label="Reprogramados"
          value={summary.deferred}
          tone="orange"
          icon="tabler:calendar-repeat"
          hint={
            summary.nextAttemptAt
              ? `Próximo intento: ${formatDeliveryDateTime(summary.nextAttemptAt)}`
              : "Por cupo diario / proveedor"
          }
          onClick={summary.deferred ? () => onFilter({ status: "DEFERRED" }) : undefined}
        />
        <KpiCard
          label="Fallidos"
          value={summary.failed}
          tone={summary.failed ? "red" : "slate"}
          icon="tabler:alert-triangle"
          hint={summary.failed ? "Ver motivos abajo" : "Sin fallos"}
          onClick={summary.failed ? () => onFilter({ status: "FAILED" }) : undefined}
        />
      </div>

      {/* Progreso */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-[#64748B]">
          <span>
            Procesados {fmt(done)} de {fmt(summary.total)}
          </span>
          <span className="font-semibold text-[#0B1737]">{summary.progressPct}%</span>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#EEF2F8]">
          {summary.total > 0 && (
            <>
              <div className="bg-emerald-500" style={{ width: `${(summary.sent / summary.total) * 100}%` }} />
              <div className="bg-red-400" style={{ width: `${(summary.failed / summary.total) * 100}%` }} />
              <div className="bg-orange-300" style={{ width: `${(summary.deferred / summary.total) * 100}%` }} />
            </>
          )}
        </div>
        {summary.firstSentAt && (
          <p className="mt-1.5 text-[11px] text-[#94A3B8]">
            Primer envío: {formatDeliveryDateTime(summary.firstSentAt)}
          </p>
        )}
      </div>

      {/* Cupo diario de correo */}
      {q?.enabled && (
        <div className="flex flex-col gap-2 rounded-xl border border-[#E8EDF7] bg-[#F8FAFC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <Icon icon="tabler:mail-cog" className="mt-0.5 text-lg text-[#1A2B5B]" />
            <div>
              <p className="text-[13px] font-semibold text-[#0B1737]">
                Cupo de correo de hoy: {fmt(q.used)} / {fmt(q.limit)} usados
              </p>
              <p className="text-[11px] text-[#64748B]">
                Campañas: {fmt(q.campaignRemaining)} disponibles de {fmt(q.campaignCap)} · {fmt(q.reserve)} reservados
                para códigos y avisos · se reinicia {formatDeliveryDateTime(q.resetsAt)}
              </p>
              {q.providerBlockedUntil && (
                <p className="mt-1 text-[11px] font-medium text-orange-700">
                  El proveedor está rechazando por cupo; se vuelve a intentar a las{" "}
                  {formatDeliveryDateTime(q.providerBlockedUntil)}.
                </p>
              )}
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0] sm:w-40">
            <div
              className={clsx("h-full", q.used >= q.campaignCap ? "bg-orange-400" : "bg-[#1A2B5B]")}
              style={{ width: `${Math.min(100, (q.used / Math.max(1, q.limit)) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <ReasonsTable
        title="Motivos de fallo"
        reasons={summary.failureReasons}
        tone="red"
        onSelect={(code) => onFilter({ status: "FAILED", reason: code })}
      />
      <ReasonsTable
        title="Motivos de reprogramación (se reintentan solos)"
        reasons={summary.deferReasons}
        tone="amber"
        onSelect={(code) => onFilter({ status: "DEFERRED", reason: code })}
      />

      {summary.canRetryFailed && canRetry && (
        <div className="flex flex-col gap-2 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-red-800">
            {fmt(summary.failed)} correo(s) fallaron. Si ya corregiste la causa (p. ej. credenciales del
            proveedor), puedes volver a ponerlos en cola.
          </p>
          <Button
            hierarchy="secondary"
            onClick={handleRetry}
            loading={retrying}
            disabled={retrying}
            startContent={!retrying ? <Icon icon="tabler:rotate-clockwise" /> : undefined}
            className="shrink-0"
          >
            Reintentar fallidos
          </Button>
        </div>
      )}
    </div>
  );
}
