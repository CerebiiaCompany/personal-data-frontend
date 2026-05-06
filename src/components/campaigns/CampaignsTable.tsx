import React, { useEffect, useState } from "react";
import LoadingCover from "../layout/LoadingCover";
import {
  Campaign,
  CampaignGoal,
  campaignGoalLabels,
  deliveryChannelLabels,
} from "@/types/campaign.types";
import { formatDateToString } from "@/utils/date.utils";
import Button from "../base/Button";
import CustomToggle from "../forms/CustomToggle";
import { updateCampaign } from "@/lib/campaign.api";
import { useSessionStore } from "@/store/useSessionStore";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";
import { useAppSetting } from "@/hooks/useAppSetting";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import {
  asFiniteNumber,
  getCampaignInstanceCredits,
} from "@/utils/campaignCredits.utils";
import { creditsFormatter, priceFormatter } from "@/utils/formatters";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { useConfirm } from "../dialogs/ConfirmProvider";

interface Props {
  items: Campaign[] | null;
  loading: boolean;
  error: string | null;
}

function goalPill(goal: CampaignGoal): { label: string; className: string; icon: string } {
  const map: Record<
    CampaignGoal,
    { label: string; className: string; icon: string }
  > = {
    SALES: {
      label: campaignGoalLabels.SALES,
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icon: "tabler:shopping-cart",
    },
    PROMOTION: {
      label: "Marketing",
      className: "bg-violet-50 text-violet-800 border-violet-200",
      icon: "tabler:speakerphone",
    },
    POTENTIAL_CUSTOMERS: {
      label: campaignGoalLabels.POTENTIAL_CUSTOMERS,
      className: "bg-orange-50 text-orange-800 border-orange-200",
      icon: "tabler:user-check",
    },
    INTERACTION: {
      label: campaignGoalLabels.INTERACTION,
      className: "bg-sky-50 text-sky-800 border-sky-200",
      icon: "tabler:chart-infographic",
    },
    OTHER: {
      label: campaignGoalLabels.OTHER,
      className: "bg-slate-100 text-slate-700 border-slate-200",
      icon: "tabler:label",
    },
  };
  return map[goal] ?? map.OTHER;
}

function statusPill(item: Campaign): { label: string; className: string } {
  const st = item.status ?? "DRAFT";
  if (st === "COMPLETED" || st === "EXPIRED") {
    return {
      label: st === "EXPIRED" ? "Expirada" : "Completada",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
  }
  if (st === "SCHEDULED") {
    return {
      label: "Programada",
      className: "bg-blue-50 text-blue-800 border-blue-200",
    };
  }
  if (st === "ACTIVE" && item.active) {
    return { label: "Activa", className: "bg-emerald-50 text-emerald-800 border-emerald-200" };
  }
  if (st === "ACTIVE" && !item.active) {
    return {
      label: "Pausada",
      className: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }
  return { label: "Borrador", className: "bg-slate-100 text-slate-600 border-slate-200" };
}

function getScheduledDateTimeLabel(item: Campaign): string {
  const raw =
    item.scheduling?.scheduledDateTime ??
    item.scheduledFor ??
    item.scheduling?.startDate;
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "—";
  const datePart = formatDateToString({ date: raw });
  const timePart = d.toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} ${timePart}`;
}

function channelIcon(ch: string): string {
  if (ch === "SMS") return "tabler:device-mobile-message";
  if (ch === "EMAIL") return "tabler:mail";
  return "tabler:send";
}

const CampaignsTable = ({ items, loading, error }: Props) => {
  const confirm = useConfirm();
  const { can } = usePermissionCheck();
  const [localItems, setLocalItems] = useState<Campaign[] | null>(null);
  const user = useSessionStore((store) => store.user);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const trmCopSetting = useAppSetting("TRM_COP");
  const smsCampaignPriceSetting = useAppSetting(
    "SMS_CAMPAIGN_PRICE_PER_MESSAGE_MASIVAPP"
  );
  const emailCampaignPriceSetting = useAppSetting(
    "EMAIL_CAMPAIGN_PRICE_PER_MESSAGE"
  );

  const trmCop = asFiniteNumber(trmCopSetting.data?.value);
  const smsCampaignPrice = asFiniteNumber(smsCampaignPriceSetting.data?.value);
  const emailCampaignPrice = asFiniteNumber(
    emailCampaignPriceSetting.data?.value
  );

  async function setCampaignActive(id: string, value: boolean) {
    if (value === false) {
      toast.warning("No puedes desactivar una campaña en proceso");
      return;
    }
    const ok = await confirm({
      title: "¿Activar esta campaña?",
      confirmText: "Activar",
      description:
        "Una vez activada, la campaña se enviará a la audiencia y no podrás desactivarla hasta finalizar su programación.",
    });
    if (!ok) return;
    if (!localItems?.length || !user?.companyUserData?.companyId) return;

    const res = await updateCampaign(user.companyUserData.companyId, id, {
      active: value,
    });
    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }
    setLocalItems((prev) =>
      prev
        ? prev.map((c) => (c._id === id ? { ...c, active: value } : c))
        : prev
    );
    toast.success("Campaña activada");
  }

  const thClass =
    "text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8] py-3.5 px-4 border-b border-[#EEF2F8] bg-[#F8FAFC]";

  return (
    <div className="relative min-h-[220px] w-full flex-1 overflow-hidden rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
      {loading && (
        <div className="absolute inset-0 z-10 rounded-2xl bg-white/70">
          <LoadingCover />
        </div>
      )}

      {error && (
        <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {localItems && localItems.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className={clsx(thClass, "w-[72px]")}>
                  Estado
                </th>
                <th scope="col" className={thClass}>
                  Campaña
                </th>
                <th scope="col" className={clsx(thClass, "w-[140px]")}>
                  Objetivo
                </th>
                <th scope="col" className={clsx(thClass, "w-[180px]")}>
                  Programada
                </th>
                <th scope="col" className={clsx(thClass, "w-[120px]")}>
                  Canal
                </th>
                <th scope="col" className={clsx(thClass, "w-[200px]")}>
                  Alcance
                </th>
                <th scope="col" className={clsx(thClass, "w-[140px]")}>
                  Créditos
                </th>
                <th scope="col" className={clsx(thClass, "w-[200px] text-right")}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {localItems.map((item) => {
                const audienceTotal = item.audience.total ?? item.audience.count ?? 0;
                const audienceDelivered = item.audience.delivered ?? 0;
                const pct =
                  audienceTotal > 0
                    ? Math.min(
                        100,
                        Math.round((audienceDelivered / audienceTotal) * 1000) / 10
                      )
                    : 0;

                const credits = getCampaignInstanceCredits({
                  item,
                  trmCop,
                  smsCampaignPricePerMessage: smsCampaignPrice,
                  emailCampaignPricePerMessage: emailCampaignPrice,
                });

                const goal = item.goal ? goalPill(item.goal) : null;
                const stPill = statusPill(item);
                const desc =
                  item.content?.bodyText?.trim().slice(0, 80) ||
                  item.content?.name ||
                  "";

                return (
                  <tr
                    key={item._id}
                    className="border-b border-[#F1F5F9] last:border-0 transition-colors hover:bg-[#F8FAFC]"
                  >
                    <td className="py-4 px-4 align-middle">
                      <div className="flex justify-center">
                        <CustomToggle
                          readOnly
                          onClick={() =>
                            can("campaigns.send") &&
                            setCampaignActive(item._id, !item.active)
                          }
                          checked={item.active}
                          className={
                            !can("campaigns.send")
                              ? "opacity-40 cursor-not-allowed"
                              : ""
                          }
                          title={
                            can("campaigns.send")
                              ? "Activar campaña"
                              : "Sin permiso para enviar campañas"
                          }
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 align-middle">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <span className="font-semibold text-[#0B1737] text-[15px] leading-snug line-clamp-2">
                          {item.name}
                        </span>
                        {desc ? (
                          <span className="text-[13px] text-[#64748B] line-clamp-2">
                            {desc}
                            {item.content?.bodyText && item.content.bodyText.length > 80
                              ? "…"
                              : ""}
                          </span>
                        ) : null}
                        <span
                          className={clsx(
                            "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                            stPill.className
                          )}
                        >
                          {stPill.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-middle">
                      {goal ? (
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold",
                            goal.className
                          )}
                        >
                          <Icon icon={goal.icon} className="text-base shrink-0" />
                          {goal.label}
                        </span>
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 align-middle">
                      <div className="flex items-start gap-2 text-[13px] text-[#334155]">
                        <Icon
                          icon="tabler:calendar"
                          className="text-lg text-[#64748B] shrink-0 mt-0.5"
                        />
                        <span>{getScheduledDateTimeLabel(item)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-middle">
                      <div className="flex items-center gap-2 text-[13px] font-medium text-[#334155]">
                        <Icon
                          icon={channelIcon(item.deliveryChannel)}
                          className="shrink-0 text-lg text-[#1A2B5B]"
                        />
                        {deliveryChannelLabels[item.deliveryChannel] ??
                          item.deliveryChannel}
                      </div>
                    </td>
                    <td className="py-4 px-4 align-middle">
                      <div className="flex flex-col gap-1.5 min-w-[160px]">
                        <div className="flex items-center justify-between gap-2 text-[13px] font-semibold text-[#0B1737] tabular-nums">
                          <span>
                            {audienceDelivered.toLocaleString("es-CO")} /{" "}
                            {audienceTotal.toLocaleString("es-CO")}
                          </span>
                          <span className="text-[#64748B] font-semibold">{pct}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                          <div
                            className="h-full rounded-full bg-[#1A2B5B] transition-[width] duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-middle">
                      {credits != null ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[14px] font-bold text-[#0B1737] tabular-nums">
                            {creditsFormatter.format(Math.round(credits))}
                          </span>
                          <span className="text-[12px] text-[#94A3B8]">
                            ≈ COP {priceFormatter.format(Math.round(credits))}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#94A3B8] text-sm">…</span>
                      )}
                    </td>
                    <td className="py-4 px-4 align-middle text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          href={`/admin/campanas/${item._id}`}
                          hierarchy="secondary"
                          className="rounded-xl! border-[#1A2B5B]! bg-white! px-3! py-2! text-[12px]! font-semibold! text-[#1A2B5B]! hover:bg-[#F8FAFC]!"
                        >
                          Ver detalle
                        </Button>
                        {can("campaigns.send") && (
                          <button
                            type="button"
                            title={
                              item.active
                                ? "Pausar (no disponible hasta finalizar envío)"
                                : "Activar campaña"
                            }
                            onClick={() => {
                              if (item.active) {
                                toast.warning(
                                  "No puedes desactivar una campaña en proceso"
                                );
                              } else {
                                void setCampaignActive(item._id, true);
                              }
                            }}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4EAF6] bg-white text-[#334155] hover:bg-[#F1F5F9] transition-colors"
                          >
                            <Icon
                              icon={item.active ? "tabler:player-pause" : "tabler:player-play"}
                              className="text-lg"
                            />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : !loading && localItems && localItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <Icon
            icon="tabler:megaphone-off"
            className="text-4xl text-[#CBD5E1] mb-3"
          />
          <p className="text-[#64748B] text-sm font-medium max-w-sm">
            No hay campañas que coincidan con los filtros o aún no has creado ninguna.
          </p>
          <p className="text-[#94A3B8] text-xs mt-2">
            Usa &quot;Crear campaña&quot; para comenzar un envío segmentado.
          </p>
        </div>
      ) : !loading && !localItems ? (
        <div className="py-12 px-4 text-center text-sm text-[#64748B]">
          No se pudieron cargar las campañas.
        </div>
      ) : null}
    </div>
  );
};

export default CampaignsTable;
