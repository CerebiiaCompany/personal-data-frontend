"use client";

import Button from "@/components/base/Button";
import Pagination from "@/components/base/Pagination";
import CampaignDeliveriesTable from "@/components/campaigns/CampaignDeliveriesTable";
import CampaignDeliveryDetailDialog from "@/components/campaigns/CampaignDeliveryDetailDialog";
import { useCampaignDeliveries } from "@/hooks/useCampaignDeliveries";
import {
  CampaignDelivery,
  CampaignDeliveryStatus,
} from "@/types/campaignDelivery.types";
import { CAMPAIGN_DELIVERY_STATUS_LABELS } from "@/utils/campaignDelivery.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useEffect, useState } from "react";

type StatusFilter = CampaignDeliveryStatus | "";

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "", label: "Todos" },
  { id: "SUCCESS", label: CAMPAIGN_DELIVERY_STATUS_LABELS.SUCCESS },
  { id: "FAILED", label: CAMPAIGN_DELIVERY_STATUS_LABELS.FAILED },
  { id: "PENDING", label: CAMPAIGN_DELIVERY_STATUS_LABELS.PENDING },
];

interface Props {
  companyId: string;
  campaignId: string;
  audienceTotal?: number;
  audienceDelivered?: number;
}

export default function CampaignDeliveriesSection({
  companyId,
  campaignId,
  audienceTotal,
  audienceDelivered,
}: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState<CampaignDelivery | null>(null);

  const fromIso = fromDate ? new Date(`${fromDate}T00:00:00`).toISOString() : undefined;
  const toIso = toDate
    ? new Date(`${toDate}T23:59:59.999`).toISOString()
    : undefined;

  const { data, meta, loading, error, refresh } = useCampaignDeliveries({
    companyId,
    campaignId,
    page,
    pageSize,
    status: statusFilter || undefined,
    from: fromIso,
    to: toIso,
  });

  useEffect(() => {
    setPage(1);
  }, [statusFilter, fromDate, toDate, pageSize]);

  const hasDateFilters = Boolean(fromDate || toDate);
  const totalCount = meta?.totalCount ?? data?.length ?? 0;

  const inputClass =
    "h-[42px] w-full px-3 border border-[#E4EAF6] rounded-xl text-sm bg-white text-[#0B1737] focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <>
      <section className="overflow-visible rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
        <div className="border-b border-[#EEF2F8] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1A2B5B]">
                Auditoría de entregas
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-[#64748B]">
                Consulta a quién de la audiencia del formulario se envió el mensaje de la
                campaña y el estado de cada entrega.
              </p>
            </div>
            <Button
              hierarchy="tertiary"
              onClick={() => refresh()}
              startContent={<Icon icon="tabler:refresh" />}
              className="shrink-0"
            >
              Actualizar
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#E8EDF7] bg-[#F8FAFC] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                Registros (filtro actual)
              </p>
              <p className="text-xl font-bold tabular-nums text-[#0B1737]">
                {loading ? "…" : totalCount.toLocaleString("es-CO")}
              </p>
            </div>
            {(audienceTotal != null || audienceDelivered != null) && (
              <div className="rounded-xl border border-[#E8EDF7] bg-[#F8FAFC] px-4 py-3 sm:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Audiencia campaña
                </p>
                <p className="text-xl font-bold tabular-nums text-[#0B1737]">
                  {audienceDelivered ?? 0}
                  <span className="text-base font-normal text-[#64748B]">
                    {" "}
                    / {audienceTotal ?? audienceDelivered ?? 0} destinatarios
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-b border-[#EEF2F8] px-4 py-4 sm:px-5">
          <p className="mb-3 text-xs font-medium text-[#64748B]">Estado de entrega</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id || "all"}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  statusFilter === tab.id
                    ? "border-primary-900 bg-primary-900 text-white"
                    : "border-[#E4EAF6] bg-white text-[#334155] hover:bg-[#F8FAFC]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#64748B]">Desde</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#64748B]">Hasta</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={inputClass}
              />
            </div>
            {hasDateFilters && (
              <div className="flex items-end">
                <Button
                  type="button"
                  hierarchy="tertiary"
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                  }}
                  startContent={<Icon icon="tabler:eraser" />}
                  className="w-full sm:w-auto"
                >
                  Limpiar fechas
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <CampaignDeliveriesTable
            items={data}
            loading={loading}
            error={error}
            onRowClick={setSelectedDelivery}
          />
        </div>

        {meta && (meta.totalPages ?? 0) > 1 ? (
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
        ) : meta?.totalCount ? (
          <div className="border-t border-[#EEF2F8] px-4 py-3 text-xs text-[#64748B] sm:px-5">
            {meta.totalCount} resultado{meta.totalCount === 1 ? "" : "s"}
          </div>
        ) : null}
      </section>

      <CampaignDeliveryDetailDialog
        open={Boolean(selectedDelivery)}
        onClose={() => setSelectedDelivery(null)}
        companyId={companyId}
        campaignId={campaignId}
        delivery={selectedDelivery}
      />
    </>
  );
}
