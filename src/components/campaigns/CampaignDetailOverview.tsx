"use client";

import {
  Campaign,
  campaignGoalLabels,
  campaignStatusColors,
  campaignStatusLabels,
  deliveryChannelLabels,
} from "@/types/campaign.types";
import { formatDateToString } from "@/utils/date.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";

function getScheduledDate(item: Campaign): string {
  if (item.scheduledFor) return formatDateToString({ date: item.scheduledFor });
  if (item.scheduling?.scheduledDateTime) {
    return formatDateToString({ date: item.scheduling.scheduledDateTime });
  }
  if (item.scheduling?.startDate && item.scheduling?.endDate) {
    return `${formatDateToString({ date: item.scheduling.startDate })} – ${formatDateToString({ date: item.scheduling.endDate })}`;
  }
  return "—";
}

function getScheduledTime(item: Campaign): string {
  const raw = item.scheduling?.scheduledDateTime ?? item.scheduledFor;
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

const GENDER_LABELS: Record<string, string> = {
  MALE: "Hombres",
  FEMALE: "Mujeres",
  OTHER: "Otro",
  ALL: "Todos",
};

function InfoCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold text-[#0B1737]">{children}</div>
    </div>
  );
}

interface Props {
  campaign: Campaign;
}

export default function CampaignDetailOverview({ campaign }: Props) {
  const status = campaign.status ?? "DRAFT";
  const statusClass =
    campaignStatusColors[status] ?? "bg-slate-100 text-slate-700 border-slate-200";
  const isConsent = campaign.type === "CONSENT_REQUEST";
  const audienceTotal = campaign.audience.total ?? campaign.audience.count ?? 0;
  const audienceDelivered = campaign.audience.delivered ?? 0;
  const deliveryPct =
    audienceTotal > 0 ? Math.round((audienceDelivered / audienceTotal) * 1000) / 10 : null;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#1A2B5B]">
            <Icon
              icon={isConsent ? "tabler:bell-ringing" : "tabler:speakerphone"}
              className="text-xl"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
              Tipo
            </p>
            <p className="font-bold text-[#0B1737]">
              {isConsent ? "Consentimiento" : "Marketing"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#1A2B5B]">
            <Icon
              icon={
                campaign.deliveryChannel === "SMS"
                  ? "tabler:device-mobile-message"
                  : "tabler:mail"
              }
              className="text-xl"
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
              Canal
            </p>
            <p className="font-bold text-[#0B1737]">
              {deliveryChannelLabels[campaign.deliveryChannel]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#1A2B5B]">
            <Icon icon="tabler:users" className="text-xl" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
              Entregados / Total
            </p>
            <p className="font-bold tabular-nums text-[#0B1737]">
              {audienceDelivered} / {audienceTotal}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#1A2B5B]">
            <Icon icon="tabler:chart-donut" className="text-xl" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
              Tasa entrega (audiencia)
            </p>
            <p className="font-bold tabular-nums text-[#0B1737]">
              {deliveryPct != null ? `${deliveryPct}%` : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-[#1A2B5B]">Información general</h2>
          <span
            className={clsx(
              "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              statusClass
            )}
          >
            {campaignStatusLabels[status] ?? status}
          </span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCell label="Nombre">{campaign.name}</InfoCell>
          <InfoCell label="Objetivo">
            {campaignGoalLabels[campaign.goal] || campaign.goal}
          </InfoCell>
          <InfoCell label="Fecha programada">{getScheduledDate(campaign)}</InfoCell>
          <InfoCell label="Hora">{getScheduledTime(campaign)}</InfoCell>
          <InfoCell label="Activa">{campaign.active ? "Sí" : "No"}</InfoCell>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-[#1A2B5B]">Audiencia</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <InfoCell label="Edad">
              {campaign.audience.minAge} – {campaign.audience.maxAge}
            </InfoCell>
            <InfoCell label="Género">
              {GENDER_LABELS[campaign.audience.gender] ?? campaign.audience.gender}
            </InfoCell>
            <InfoCell label="Destinatarios">{audienceTotal}</InfoCell>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-[#1A2B5B]">Contenido</h2>
          <div className="grid gap-4">
            <InfoCell label="Título del mensaje">{campaign.content?.name ?? "—"}</InfoCell>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
                Cuerpo
              </p>
              <p className="mt-2 whitespace-pre-wrap rounded-xl border border-[#EEF2F8] bg-[#F8FAFC] p-3 text-sm text-[#334155]">
                {campaign.content?.bodyText || "—"}
              </p>
            </div>
            {campaign.content?.link && (
              <InfoCell label="Enlace">
                <a
                  href={campaign.content.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-medium text-primary-700 underline"
                >
                  {campaign.content.link}
                </a>
              </InfoCell>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
