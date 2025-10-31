"use client";

import SectionHeader from "@/components/base/SectionHeader";
import LoadingCover from "@/components/layout/LoadingCover";
import { fetchCampaigns } from "@/lib/campaign.api";
import { useSessionStore } from "@/store/useSessionStore";
import { Campaign, campaignGoalLabels, deliveryChannelLabels } from "@/types/campaign.types";
import { formatDateToString } from "@/utils/date.utils";
import { parseApiError } from "@/utils/parseApiError";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const user = useSessionStore((s) => s.user);
  const [data, setData] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!user?.companyUserData?.companyId || !campaignId) return;
      setLoading(true);
      const res = await fetchCampaigns({ companyId: user.companyUserData.companyId, id: campaignId });
      if (res.error) {
        setError(parseApiError(res.error));
        setLoading(false);
        return;
      }
      setData(res.data as Campaign);
      setLoading(false);
    })();
  }, [user?.companyUserData?.companyId, campaignId]);

  const getScheduledDate = (item?: Campaign): string => {
    if (!item) return "";
    if (item.scheduledFor) return formatDateToString({ date: item.scheduledFor });
    if (item.scheduling?.scheduledDateTime) return formatDateToString({ date: item.scheduling.scheduledDateTime });
    if (item.scheduling?.startDate && item.scheduling?.endDate) {
      return `${formatDateToString({ date: item.scheduling.startDate })} - ${formatDateToString({ date: item.scheduling.endDate })}`;
    }
    return "—";
  };

  return (
    <div className="flex flex-col relative">
      <SectionHeader />
      <div className="px-8 py-6 flex flex-col gap-6 items-stretch">
        {loading && <LoadingCover wholePage={true} />}
        {error && <p className="text-red-500">{error}</p>}
        {data && (
          <div className="grid gap-6">
            <h4 className="font-bold text-2xl text-primary-900">Detalle de campaña</h4>

            <div className="grid gap-4 rounded-xl border border-disabled p-6 bg-white">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-stone-500">Nombre</p>
                  <p className="font-semibold text-primary-900">{data.name}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Objetivo</p>
                  <p className="font-semibold text-primary-900">{campaignGoalLabels[data.goal] || data.goal}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Fecha programada</p>
                  <p className="font-semibold text-primary-900">{getScheduledDate(data)}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Hora</p>
                  <p className="font-semibold text-primary-900">
                    {data.scheduling?.scheduledDateTime
                      ? new Date(data.scheduling.scheduledDateTime).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Ruta de envío</p>
                  <p className="font-semibold text-primary-900 flex items-center gap-1">
                    <Icon icon={data.deliveryChannel === "SMS" ? "tabler:device-mobile-message" : "tabler:mail"} className="text-lg" />
                    {deliveryChannelLabels[data.deliveryChannel] || data.deliveryChannel}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-xl border border-disabled p-6 bg-white">
              <h6 className="text-primary-900 font-semibold">Audiencia</h6>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-stone-500">Rango de edad</p>
                  <p className="font-semibold text-primary-900">{data.audience.minAge} - {data.audience.maxAge}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Género</p>
                  <p className="font-semibold text-primary-900">{data.audience.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Total / Entregados</p>
                  <p className="font-semibold text-primary-900">{(data.audience.total ?? data.audience.count) || 0} / {data.audience.delivered ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-xl border border-disabled p-6 bg-white">
              <h6 className="text-primary-900 font-semibold">Contenido</h6>
              <div className="grid gap-2">
                <div>
                  <p className="text-sm text-stone-500">Nombre</p>
                  <p className="font-semibold text-primary-900">{data.content?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Mensaje</p>
                  <p className="text-primary-900 whitespace-pre-wrap">{data.content?.bodyText}</p>
                </div>
                {data.content?.link && (
                  <div>
                    <p className="text-sm text-stone-500">Enlace</p>
                    <a href={data.content.link} target="_blank" className="text-primary-600 underline break-all">{data.content.link}</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


