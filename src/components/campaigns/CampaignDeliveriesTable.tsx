"use client";

import CampaignDeliveryStatusBadge from "@/components/campaigns/CampaignDeliveryStatusBadge";
import LoadingCover from "@/components/layout/LoadingCover";
import { CampaignDelivery } from "@/types/campaignDelivery.types";
import {
  providerChannelName,
  providerStatusColor,
  providerStatusLabel,
  deliveryChannelIcon,
  describeProviderError,
  formatDeliveryChannel,
  formatDeliveryDateTime,
  formatDeliveryDocument,
  formatDeliveryUserName,
  getDeliveryRowKey,
} from "@/utils/campaignDelivery.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";

interface Props {
  items: CampaignDelivery[] | null;
  loading: boolean;
  error: string | null;
  onRowClick?: (item: CampaignDelivery) => void;
}

export default function CampaignDeliveriesTable({
  items,
  loading,
  error,
  onRowClick,
}: Props) {
  if (loading && !items?.length) {
    return (
      <div className="relative min-h-[240px]">
        <LoadingCover />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-red-600">
        <Icon icon="tabler:alert-circle" className="text-3xl" />
        <p>{error}</p>
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-[#64748B]">
        <Icon icon="tabler:mail-off" className="text-3xl text-[#94A3B8]" />
        <p>No hay entregas registradas con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#EEF2F8] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            <th className="px-3 py-3">Nombre</th>
            <th className="px-3 py-3">Documento</th>
            <th className="px-3 py-3">Destinatario</th>
            <th className="px-3 py-3">Canal</th>
            <th className="px-3 py-3">Estado</th>
            <th className="px-3 py-3">Fecha de envío</th>
            {onRowClick && <th className="px-3 py-3 text-right">Detalle</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const unavailable = !item.user;
            return (
              <tr
                key={getDeliveryRowKey(item, index)}
                className="border-b border-[#F1F5F9] transition-colors hover:bg-[#F8FAFC]"
              >
                <td className="px-3 py-3">
                  <p
                    className={
                      unavailable
                        ? "italic text-[#94A3B8]"
                        : "font-medium text-[#1A2B5B]"
                    }
                  >
                    {formatDeliveryUserName(item.user)}
                  </p>
                </td>
                <td className="px-3 py-3 text-[#334155]">
                  {formatDeliveryDocument(item.user)}
                </td>
                <td className="px-3 py-3">
                  <p className="text-[#334155]">{item.recipient}</p>
                </td>
                <td className="px-3 py-3 text-[#334155]">
                  <span className="inline-flex items-center gap-1">
                    <Icon
                      icon={deliveryChannelIcon(item.deliveryChannel)}
                      className="text-base text-[#64748B]"
                    />
                    {formatDeliveryChannel(item.deliveryChannel)}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <CampaignDeliveryStatusBadge status={item.status} />
                  {item.providerStatus && (
                    <p
                      className={clsx(
                        "mt-1 text-[11px] font-semibold",
                        providerStatusColor(item.providerStatus)
                      )}
                    >
                      {providerChannelName(item.deliveryChannel)}:{" "}
                      {providerStatusLabel(item.deliveryChannel, item.providerStatus)}
                    </p>
                  )}
                  {(item.status === "FAILED" || item.providerStatus === "DEFERRED") &&
                    (item.providerErrorCode || item.providerErrorMessage) && (
                      <p
                        className={clsx(
                          "mt-0.5 max-w-[260px] text-[11px] leading-snug",
                          item.status === "FAILED" ? "text-red-700" : "text-amber-800"
                        )}
                        title={item.providerErrorMessage ?? undefined}
                      >
                        {describeProviderError(item.providerErrorCode, item.providerErrorMessage)}
                      </p>
                    )}
                  {item.status === "PENDING" && item.nextAttemptAt && (
                    <p className="mt-0.5 text-[11px] text-[#64748B]">
                      Próximo intento: {formatDeliveryDateTime(item.nextAttemptAt)}
                    </p>
                  )}
                </td>
                <td className="px-3 py-3 text-[#64748B]">
                  {item.status === "SUCCESS" && item.providerStatusAt ? (
                    formatDeliveryDateTime(item.providerStatusAt)
                  ) : item.lastAttemptAt ? (
                    <span title="Último intento">{formatDeliveryDateTime(item.lastAttemptAt)}</span>
                  ) : item.status !== "PENDING" ? (
                    formatDeliveryDateTime(item.createdAt)
                  ) : (
                    <span className="text-[#94A3B8]" title="Aún no se ha intentado enviar">
                      —
                    </span>
                  )}
                  {(item.attempts ?? 0) > 1 && (
                    <p className="text-[11px] text-[#94A3B8]">{item.attempts} intentos</p>
                  )}
                </td>
                {onRowClick && (
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRowClick(item)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-primary-900 hover:bg-primary-50"
                    >
                      Ver
                      <Icon icon="tabler:chevron-right" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
