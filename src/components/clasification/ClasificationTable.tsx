import {
  ClasificationListSummary,
  CollectFormClasification,
} from "@/types/collectForm.types";
import { Icon } from "@iconify/react";
import React, { useMemo } from "react";
import LoadingCover from "../layout/LoadingCover";
import { formatDateToString } from "@/utils/date.utils";
import Link from "next/link";
import clsx from "clsx";
import CheckPermission from "@/components/checkers/CheckPermission";
import { useConsentResponsesExport } from "@/hooks/useConsentResponsesExport";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { useSessionStore } from "@/store/useSessionStore";

interface Props {
  /** Filas mostradas (p. ej. filtradas por búsqueda en cliente) */
  items: CollectFormClasification[] | null;
  /** Si se define, las tarjetas de resumen usan este listado completo; si no, usan `items` */
  aggregateSource?: CollectFormClasification[] | null;
  /** Totales del backend (`summary`); si existe, sustituye el cálculo desde `aggregateSource` */
  listSummary?: ClasificationListSummary | null;
  loading: boolean;
  error: string | null;
  onCreateConsentCampaign?: (formId: string, formName: string) => void;
}

function formatNumberEs(n: number): string {
  return n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function formatRelativeDayEs(date: Date): string {
  const today = new Date();
  const a = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const b = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const diffDays = Math.round((b.getTime() - a.getTime()) / 86400000);
  if (diffDays <= 0) return "(hoy)";
  if (diffDays === 1) return "(ayer)";
  return `(hace ${diffDays} días)`;
}

function defaultFormDescription(item: CollectFormClasification): string {
  if (item.description?.trim()) return item.description.trim();
  return "Datos recolectados mediante formulario de consentimiento.";
}

const ClasificationTable = ({
  items,
  aggregateSource,
  listSummary,
  loading,
  error,
  onCreateConsentCampaign,
}: Props) => {
  const user = useSessionStore((store) => store.user);
  const companyId = user?.companyUserData?.companyId;
  const { isCompanyAdmin } = usePermissionCheck();
  const canExportExcel = isCompanyAdmin;
  const { startExport, exporting, isExportingForm } =
    useConsentResponsesExport(companyId);

  function exportClassificationData(collectFormId: string) {
    startExport({ collectFormId });
  }

  const statsItems = aggregateSource ?? items;

  const aggregates = useMemo(() => {
    if (listSummary) {
      const totalRecords = listSummary.totalResponses ?? 0;
      const verifiedTotal = listSummary.verifiedResponses ?? 0;
      const verifiedPct =
        totalRecords > 0
          ? Math.round((verifiedTotal / totalRecords) * 1000) / 10
          : 0;
      let lastActivity: Date | null = null;
      if (listSummary.lastResponseAt) {
        const d = new Date(listSummary.lastResponseAt);
        if (!Number.isNaN(d.getTime())) lastActivity = d;
      }
      return {
        activeForms: listSummary.activeFormsCount ?? 0,
        totalRecords,
        verifiedTotal,
        verifiedPct,
        lastActivity,
      };
    }

    if (!statsItems?.length) {
      return {
        activeForms: 0,
        totalRecords: 0,
        verifiedTotal: 0,
        verifiedPct: 0,
        lastActivity: null as Date | null,
      };
    }
    const activeForms = statsItems.filter((it) => it.isActive !== false).length;
    const totalRecords = statsItems.reduce(
      (s, it) => s + (it.totalResponses || 0),
      0
    );
    const verifiedTotal = statsItems.reduce(
      (s, it) => s + (it.verifiedResponses || 0),
      0
    );
    const verifiedPct =
      totalRecords > 0 ? Math.round((verifiedTotal / totalRecords) * 1000) / 10 : 0;

    let lastActivity: Date | null = null;
    for (const it of statsItems) {
      const raw =
        it.lastResponseAt ?? it.updatedAt ?? it.updated ?? it.createdAt;
      const d = new Date(raw as string | Date);
      if (!Number.isNaN(d.getTime())) {
        if (!lastActivity || d > lastActivity) lastActivity = d;
      }
    }

    return {
      activeForms,
      totalRecords,
      verifiedTotal,
      verifiedPct,
      lastActivity,
    };
  }, [listSummary, statsItems]);

  const showSummaryCards =
    listSummary != null || (statsItems != null && statsItems.length > 0);

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 min-w-0 relative">
      {loading && (
        <div className="absolute inset-0 z-10 min-h-[200px] rounded-2xl bg-white/60">
          <LoadingCover />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm font-medium mb-4">
          {error}
        </div>
      )}

      {showSummaryCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,35,70,0.04)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FE] text-[#2563EB]">
              <Icon icon="tabler:file-text" className="text-xl" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#64748B]">Formularios</p>
              <p className="text-[15px] font-bold text-[#0B1737] truncate">
                {formatNumberEs(aggregates.activeForms)} activos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,35,70,0.04)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FE] text-[#2563EB]">
              <Icon icon="tabler:users" className="text-xl" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#64748B]">
                Total Registros
              </p>
              <p className="text-[15px] font-bold text-[#0B1737] leading-snug">
                {formatNumberEs(aggregates.totalRecords)}{" "}
                <span className="text-[12px] font-semibold text-[#64748B]">
                  en todos los formularios
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,35,70,0.04)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#16A34A]">
              <Icon icon="tabler:shield-check" className="text-xl" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#64748B]">Verificados</p>
              <p className="text-[15px] font-bold text-[#0B1737] leading-snug">
                {formatNumberEs(aggregates.verifiedTotal)}
                <span className="text-emerald-600 font-bold">
                  {" "}
                  ({aggregates.verifiedPct}% del total)
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,35,70,0.04)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFEDD5] text-[#EA580C]">
              <Icon icon="tabler:clock" className="text-xl" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#64748B]">
                Último Registro
              </p>
              <p className="text-[14px] font-bold text-[#0B1737] leading-snug">
                {aggregates.lastActivity ? (
                  <>
                    {formatDateToString({ date: aggregates.lastActivity })}{" "}
                    <span className="text-[12px] font-semibold text-[#64748B]">
                      {formatRelativeDayEs(aggregates.lastActivity)}
                    </span>
                  </>
                ) : (
                  <span className="text-[#94A3B8]">—</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {items && items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item) => {
            const pending = Math.max(
              0,
              (item.totalResponses || 0) - (item.verifiedResponses || 0)
            );
            const pct =
              item.totalResponses > 0
                ? Math.min(
                    100,
                    Math.round(
                      (item.verifiedResponses / item.totalResponses) * 1000
                    ) / 10
                  )
                : 0;
            return (
              <article
                key={item._id}
                className="flex flex-col rounded-2xl border border-[#E8EDF7] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,35,70,0.06)] min-h-[260px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F1FE] text-[#2563EB]">
                    <Icon icon="tabler:file-text" className="text-xl" />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {onCreateConsentCampaign && (
                      <CheckPermission group="campaigns" permission="create">
                        <button
                          type="button"
                          aria-label="Crear campaña de consentimiento"
                          onClick={() =>
                            onCreateConsentCampaign(item._id, item.name)
                          }
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Icon icon="tabler:send" className="text-xl" />
                        </button>
                      </CheckPermission>
                    )}
                    {canExportExcel && (
                      <button
                        type="button"
                        aria-label="Exportar a Excel"
                        onClick={() => exportClassificationData(item._id)}
                        disabled={exporting}
                        className={clsx(
                          "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-transparent transition-colors",
                          exporting
                            ? "opacity-40 cursor-not-allowed text-[#94A3B8]"
                            : "text-[#64748B] hover:bg-[#F1F5F9]"
                        )}
                      >
                        {isExportingForm(item._id) ? (
                          <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        ) : (
                          <Icon
                            icon="material-symbols:export-notes-outline"
                            className="text-xl"
                          />
                        )}
                      </button>
                    )}
                    <Link
                      href={`/admin/clasificacion/${item._id}`}
                      aria-label="Ver datos del formulario"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
                    >
                      <Icon icon="tabler:eye" className="text-xl" />
                    </Link>
                  </div>
                </div>

                <h2 className="mt-4 text-[16px] sm:text-[17px] font-bold text-[#0B1737] leading-snug line-clamp-2">
                  {item.name}
                </h2>
                <p className="mt-2 text-[13px] text-[#64748B] leading-relaxed line-clamp-3">
                  {defaultFormDescription(item)}
                </p>

                <div className="mt-3 flex items-center gap-2 text-[12px] text-[#94A3B8]">
                  <Icon icon="tabler:calendar" className="text-base shrink-0" />
                  <span>
                    Creado el {formatDateToString({ date: item.createdAt })}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-[#EEF2F8] pt-4 text-[13px]">
                  <span className="text-[#334155]">
                    <strong className="text-[#0B1737] tabular-nums">
                      {formatNumberEs(item.totalResponses || 0)}
                    </strong>{" "}
                    registros
                  </span>
                  <span className="text-emerald-600 font-semibold">
                    <strong className="tabular-nums">
                      {formatNumberEs(item.verifiedResponses || 0)}
                    </strong>{" "}
                    verificados
                  </span>
                  <span className="text-[#64748B]">
                    <strong className="text-[#0B1737] tabular-nums">
                      {formatNumberEs(pending)}
                    </strong>{" "}
                    pendientes
                  </span>
                </div>

                <div className="mt-auto pt-5">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E8EDF4]">
                    <div
                      className="h-full rounded-full bg-[#0D2B74] transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : !loading &&
        statsItems &&
        statsItems.length > 0 &&
        items &&
        items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white/90 py-14 px-4">
          <p className="text-center text-[#64748B] text-sm font-medium">
            No hay formularios que coincidan con la búsqueda
          </p>
        </div>
      ) : !loading && statsItems && statsItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white/90 py-14 px-4">
          <p className="text-center text-[#64748B] text-sm font-medium">
            No hay formularios para clasificar
          </p>
        </div>
      ) : !loading && !items ? (
        <div className="rounded-2xl border border-[#E8EDF7] bg-white/80 px-4 py-10 text-center text-[#64748B] text-sm">
          No se pudieron cargar los formularios o aún no hay datos disponibles.
        </div>
      ) : null}
    </div>
  );
};

export default ClasificationTable;
