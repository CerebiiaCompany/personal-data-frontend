"use client";

import CampaignDeliveryStatusBadge from "@/components/campaigns/CampaignDeliveryStatusBadge";
import Button from "@/components/base/Button";
import LoadingCover from "@/components/layout/LoadingCover";
import { fetchCampaignDeliveries } from "@/lib/campaignDelivery.api";
import { CampaignDelivery } from "@/types/campaignDelivery.types";
import {
  formatDeliveryChannel,
  formatDeliveryDateTime,
  formatDeliveryDocument,
  formatDeliveryGender,
  formatDeliveryUserName,
} from "@/utils/campaignDelivery.utils";
import { parseApiError } from "@/utils/parseApiError";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  companyId: string;
  campaignId: string;
  delivery: CampaignDelivery | null;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[140px_1fr] sm:gap-3">
      <p className="text-xs font-medium text-[#64748B]">{label}</p>
      <div className="text-sm text-[#1A2B5B]">{value}</div>
    </div>
  );
}

export default function CampaignDeliveryDetailDialog({
  open,
  onClose,
  companyId,
  campaignId,
  delivery,
}: Props) {
  const [detail, setDetail] = useState<CampaignDelivery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !delivery) {
      setDetail(null);
      setError(null);
      return;
    }

    const deliveryId = delivery._id ?? delivery.formResponseId;
    if (!deliveryId) {
      setDetail(delivery);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await fetchCampaignDeliveries({
        companyId,
        campaignId,
        deliveryId,
      });
      if (cancelled) return;
      setLoading(false);
      if (res.error) {
        setError(parseApiError(res.error));
        setDetail(delivery);
        return;
      }
      const row = Array.isArray(res.data)
        ? res.data[0]
        : (res.data as CampaignDelivery | undefined);
      setDetail(row ?? delivery);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, delivery, companyId, campaignId]);

  if (!open) return null;

  const item = detail ?? delivery;
  if (!item) return null;

  const user = item.user;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E8EDF7] bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#EEF2F8] px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-[#1A2B5B]">Detalle de entrega</h3>
            <p className="mt-0.5 text-sm text-[#64748B]">{item.recipient}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#64748B] hover:bg-[#F1F5F9]"
            aria-label="Cerrar diálogo"
          >
            <Icon icon="tabler:x" className="text-xl" />
          </button>
        </div>

        <div className="relative space-y-4 px-5 py-4">
          {loading && <LoadingCover />}
          {error && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              No se pudo cargar el detalle completo. Mostrando datos del listado.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <CampaignDeliveryStatusBadge status={item.status} />
            <span className="inline-flex items-center gap-1 rounded-full border border-[#E4EAF6] bg-[#F8FAFC] px-2.5 py-0.5 text-xs font-medium text-[#334155]">
              <Icon
                icon={
                  item.deliveryChannel === "SMS"
                    ? "tabler:device-mobile-message"
                    : "tabler:mail"
                }
              />
              {formatDeliveryChannel(item.deliveryChannel)}
            </span>
          </div>

          <DetailRow label="Nombre" value={formatDeliveryUserName(user)} />
          <DetailRow label="Documento" value={formatDeliveryDocument(user)} />
          {user && (
            <>
              <DetailRow label="Correo" value={user.email ?? "—"} />
              <DetailRow label="Teléfono" value={user.phone ?? "—"} />
              <DetailRow
                label="Edad / Género"
                value={`${user.age ?? "—"} · ${formatDeliveryGender(user.gender)}`}
              />
            </>
          )}
          <DetailRow label="Destinatario" value={item.recipient} />
          <DetailRow label="Enviado" value={formatDeliveryDateTime(item.createdAt)} />
          <DetailRow
            label="Programado"
            value={formatDeliveryDateTime(item.scheduledFor)}
          />
          <DetailRow label="Actualizado" value={formatDeliveryDateTime(item.updatedAt)} />
          <DetailRow
            label="ID respuesta"
            value={
              <span className="break-all font-mono text-xs">{item.formResponseId}</span>
            }
          />
        </div>

        <div className="border-t border-[#EEF2F8] px-5 py-4">
          <Button hierarchy="secondary" onClick={onClose} className="w-full sm:w-auto">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
