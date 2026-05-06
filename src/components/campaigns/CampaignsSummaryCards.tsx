import { Icon } from "@iconify/react";
import { creditsFormatter, priceFormatter } from "@/utils/formatters";

function formatIntEs(n: number): string {
  return n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

interface Props {
  activeCount: number;
  totalCampaigns: number;
  accumulatedReach: number;
  creditsConsumed: number;
  /** Porcentaje 0–100 o null si no aplica */
  deliveryRatePct: number | null;
  loading?: boolean;
}

export default function CampaignsSummaryCards({
  activeCount,
  totalCampaigns,
  accumulatedReach,
  creditsConsumed,
  deliveryRatePct,
  loading,
}: Props) {
  const rateLabel =
    deliveryRatePct != null && Number.isFinite(deliveryRatePct)
      ? `${Math.round(deliveryRatePct * 10) / 10}%`
      : "—";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
      <div className="flex items-center gap-3.5 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#1A2B5B]">
          <Icon icon="tabler:speakerphone" className="text-xl" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Campañas activas
          </p>
          <p className="text-[20px] font-bold text-[#0B1737] tabular-nums">
            {loading ? "…" : formatIntEs(activeCount)}
          </p>
          <p className="text-[12px] text-[#94A3B8]">
            de {loading ? "…" : formatIntEs(totalCampaigns)} totales
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3.5 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#1A2B5B]">
          <Icon icon="tabler:users" className="text-xl" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Alcance acumulado
          </p>
          <p className="text-[20px] font-bold text-[#0B1737] tabular-nums">
            {loading ? "…" : formatIntEs(accumulatedReach)}
          </p>
          <p className="text-[12px] text-[#94A3B8]">destinatarios</p>
        </div>
      </div>

      <div className="flex items-center gap-3.5 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#1A2B5B]">
          <Icon icon="tabler:link" className="text-xl" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Créditos consumidos
          </p>
          <p className="text-[20px] font-bold text-[#0B1737] tabular-nums leading-snug">
            {loading ? "…" : creditsFormatter.format(Math.round(creditsConsumed))}
          </p>
          <p className="text-[12px] text-[#94A3B8]">
            ≈ COP{" "}
            {loading
              ? "…"
              : priceFormatter.format(Math.round(creditsConsumed))}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3.5 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#1A2B5B]">
          <Icon icon="tabler:trending-up" className="text-xl" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Tasa de entrega
          </p>
          <p className="text-[20px] font-bold text-[#0B1737] tabular-nums">
            {loading ? "…" : rateLabel}
          </p>
          <p className="text-[12px] text-[#94A3B8]">últimos 30 días</p>
        </div>
      </div>
    </div>
  );
}
