"use client";

import Button from "@/components/base/Button";
import DashboardChartCard from "@/components/dashboard/DashboardChartCard";
import HorizontalBarChart from "@/components/dashboard/HorizontalBarChart";
import UserActionLogsTable from "@/components/dashboard/UserActionLogsTable";
import CompanyCreditsCard from "@/components/dashboard/CompanyCreditsCard";
import { DashboardStatCardSkeleton } from "@/components/dashboard/DashboardSkeletons";
import DataOfficerCard from "@/components/administration/DataOfficerCard";
import ModuleHelpButton from "@/components/tour/ModuleHelpButton";
import CustomSelect from "@/components/forms/CustomSelect";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useComplianceDashboard } from "@/hooks/useComplianceDashboard";
import { useCollectFormClasifications } from "@/hooks/useCollectFormClasifications";
import { useCompanyActionLogs } from "@/hooks/useCompanyActionLogs";
import { useCompanyCredits } from "@/hooks/useCompanyCredits";
import { useCompanyCollectFormsCount } from "@/hooks/useCollectFormMetrics";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { useSessionStore } from "@/store/useSessionStore";
import { CustomSelectOption } from "@/types/forms.types";
import { getMonthRange, MONTH_KEY, monthsOptions } from "@/types/months.types";
import { formatDateToString } from "@/utils/date.utils";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  subtitle: string;
  loading?: boolean;
}

function DashboardStatCard({ icon, label, value, subtitle, loading }: StatCardProps) {
  if (loading) {
    return <DashboardStatCardSkeleton />;
  }

  return (
    <div className="dashboard-content-in flex min-h-[128px] flex-col justify-between rounded-2xl border border-[#E5EBF7] bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(15,35,70,0.04)]">
      <div className="flex items-center gap-2 text-[#2A4F96]">
        <span className="grid h-7 w-7 place-content-center rounded-full border border-[#E6ECFB] bg-[#F3F6FF]">
          <Icon icon={icon} className="text-[15px] text-[#5B76B3]" />
        </span>
        <p className="text-[14px] font-medium text-[#2C416F]">{label}</p>
      </div>
      <div>
        <p className="text-[40px] font-bold leading-none text-[#08152F]">{value}</p>
        <p className="mt-2 text-sm text-[#6C7FA6]">{subtitle}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<MONTH_KEY | "">("");
  const [nowYear, setNowYear] = useState<string>("");
  const [nowMonth, setNowMonth] = useState<MONTH_KEY | "">("");
  const [periodReady, setPeriodReady] = useState(false);

  useEffect(() => {
    const now = new Date();
    const nextYear = String(now.getFullYear());
    const nextMonth = monthsOptions[now.getMonth()].value;
    setNowYear(nextYear);
    setNowMonth(nextMonth);
    setYear(nextYear);
    setMonth(nextMonth);
    setPeriodReady(true);
  }, []);

  const yearOptions = useMemo<CustomSelectOption<string>[]>(() => {
    if (!periodReady || !year) return [];
    const options: CustomSelectOption<string>[] = [];
    const baseYear = Number(year);
    for (let y = baseYear + 1; y >= baseYear - 5; y--) {
      options.push({ title: String(y), value: String(y) });
    }
    return options;
  }, [periodReady, year]);

  const yearNumber = useMemo(() => Number(year), [year]);
  const dateRange = useMemo(() => {
    if (!periodReady || !month || !Number.isFinite(yearNumber)) return null;
    return getMonthRange(month, yearNumber);
  }, [periodReady, month, yearNumber]);

  const user = useSessionStore((store) => store.user);
  const companyId = useActiveCompanyId();
  const companyPlanName = (user?.company?.plan?.name || "Plan actual").toLocaleUpperCase(
    "es-CO"
  );
  const companyPlanDescription =
    "Mejora tu plan o adquiere más beneficios para desbloquear todas las funciones.";
  const { shouldFetch, isCompanyAdmin, isSuperAdmin } = usePermissionCheck();

  const collectFormsClasifications = useCollectFormClasifications({
    companyId: companyId,
    pageSize: 6,
    startDate: dateRange?.startDate.toISOString(),
    endDate: dateRange?.endDate.toISOString(),
    enabled: shouldFetch("classification.view") && periodReady,
  });

  const collectFormsTotals = useCollectFormClasifications({
    companyId: companyId,
    pageSize: 200,
    enabled: shouldFetch("classification.view") && periodReady,
  });

  const campaigns = useCampaigns({
    companyId: companyId,
    pageSize: 5,
    active: true,
    startDate: dateRange?.startDate.toISOString(),
    endDate: dateRange?.endDate.toISOString(),
    enabled: shouldFetch("campaigns.view") && periodReady,
  });

  const userActionLogs = useCompanyActionLogs({
    companyId: companyId,
    startDate: dateRange?.startDate.toISOString(),
    endDate: dateRange?.endDate.toISOString(),
    pageSize: 3,
    enabled: (isCompanyAdmin || isSuperAdmin) && periodReady,
  });

  const companyCredits = useCompanyCredits(
    dateRange
      ? {
          year: dateRange.startDate.getFullYear(),
          month: dateRange.startDate.getMonth() + 1,
        }
      : undefined
  );

  const companyCollectFormsCount = useCompanyCollectFormsCount({
    enabled: shouldFetch("collect.view"),
  });

  const activeFormsCount = useMemo(
    () => companyCollectFormsCount.data?.totalForms ?? 0,
    [companyCollectFormsCount.data]
  );

  const totalRecords = useMemo(() => {
    const fromSummary = collectFormsTotals.summary?.totalResponses;
    if (typeof fromSummary === "number") return fromSummary;
    return (
      collectFormsTotals.data?.reduce(
        (acc, item) => acc + (item.totalResponses ?? 0),
        0
      ) ?? 0
    );
  }, [collectFormsTotals.data, collectFormsTotals.summary?.totalResponses]);

  const pendingApprovalsCount = useMemo(
    () =>
      collectFormsClasifications.data?.reduce(
        (acc, item) => acc + Math.max(item.totalResponses - item.verifiedResponses, 0),
        0
      ) ?? 0,
    [collectFormsClasifications.data]
  );

  const compliance = useComplianceDashboard({ companyId, enabled: Boolean(companyId) });
  const score = compliance.data?.complianceScore.score ?? 0;
  const category = compliance.data?.complianceScore.category ?? "Crítico";
  // Item CHK-093 (sprint pre go-live 2026-08-28): category ya viene calculada
  // por el backend (compliance.controller.ts categorizeScore) — este mapa
  // solo traduce esa categoría a estilo visual, sin reimplementar las bandas.
  const CATEGORY_CLASSNAME: Record<string, string> = {
    Crítico: "text-rose-600 border-rose-200 bg-rose-50",
    "Atención requerida": "text-amber-600 border-amber-200 bg-amber-50",
    "Buen nivel": "text-emerald-600 border-emerald-200 bg-emerald-50",
    Excelente: "text-emerald-700 border-emerald-300 bg-emerald-100",
  };
  const statusInfo = {
    className: CATEGORY_CLASSNAME[category] ?? CATEGORY_CLASSNAME["Crítico"],
    label: category,
  };

  const formsStatLoading =
    companyCollectFormsCount.loading || collectFormsClasifications.loading;
  const recordsStatLoading = collectFormsTotals.loading;

  return (
    <div className="flex h-full max-h-full flex-col gap-5 overflow-y-auto bg-[#F8FAFE] p-5 sm:p-6 md:p-7">
      <section
        data-tour="dashboard-header"
        className="rounded-2xl border border-[#E8EDF7] bg-white px-5 py-4 shadow-[0_2px_10px_rgba(15,35,70,0.03)] md:px-6 md:py-5"
      >
        <header className="flex h-fit flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="text-left">
              <h6 className="text-sm font-medium leading-tight text-[#62779E]">
                Hola,{" "}
                <span className="font-semibold text-[#2B59C3]">
                  {user?.name} {user?.lastName}
                </span>
              </h6>
              <p className="mt-0.5 text-xs text-[#778AAF]">Bienvenido/a de vuelta</p>
            </div>
            <ModuleHelpButton tourId="dashboard" />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[#0A1633]">
              <h4 className="mb-1 text-[38px] font-bold leading-none">
                Panel de inicio
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-base text-[#60749C]">
                  {periodReady
                    ? `${monthsOptions.find((option) => option.value === month)?.title ?? ""} ${year}`
                    : "—"}
                </p>
                <p className="text-base text-[#60749C]">
                  {dateRange
                    ? `${formatDateToString({ date: dateRange.startDate })} - ${formatDateToString({ date: dateRange.endDate })}`
                    : ""}
                </p>
              </div>
            </div>

            <div
              data-tour="dashboard-period"
              className="flex flex-wrap items-center gap-2 sm:flex-1 sm:justify-end"
            >
              {periodReady &&
                nowMonth &&
                nowYear &&
                (month !== nowMonth || year !== nowYear) && (
                <Button
                  onClick={() => {
                    setMonth(nowMonth);
                    setYear(nowYear);
                  }}
                  hierarchy="tertiary"
                  className="px-1! text-sm font-normal! text-[#1B4FCB] underline"
                >
                  Este mes
                </Button>
              )}
              <CustomSelect
                className="w-full flex-none sm:w-[92px] [&>button]:h-[38px] [&>button]:rounded-xl! [&>button]:border-[#DDE6F4]! [&>button]:bg-white! [&>button]:px-3! [&>button]:text-[14px] [&>button]:font-medium [&>button]:text-[#0A1736]!"
                value={month || undefined}
                onChange={(value) => setMonth(value)}
                options={monthsOptions}
              />
              <CustomSelect
                className="w-full flex-none sm:w-[76px] [&>button]:h-[38px] [&>button]:rounded-xl! [&>button]:border-[#DDE6F4]! [&>button]:bg-white! [&>button]:px-3! [&>button]:text-[14px] [&>button]:font-medium [&>button]:text-[#0A1736]!"
                value={year}
                onChange={(value) => setYear(value)}
                options={yearOptions}
              />
              <Button
                startContent={
                  <Icon icon={"lets-icons:export"} className="text-lg sm:text-xl" />
                }
                className="h-[38px] rounded-xl! border-[#0D2B74]! bg-[#0D2B74]! px-4! text-[14px] font-semibold shadow-[0_4px_10px_rgba(13,43,116,0.18)]"
              >
                Exportar
              </Button>
            </div>
          </div>
        </header>
      </section>

      {/* Secciones de Cumplimiento (Fusión Inicio + Cumplimiento) */}
      <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#1A2B5B]">Score de cumplimiento</h2>
            <p className="mt-1 text-xs text-[#64748B]">
              11 criterios en 3 dimensiones ponderadas.
            </p>
          </div>
          {!compliance.loading && (
            <span
              className={clsx(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold",
                statusInfo.className
              )}
            >
              {statusInfo.label}
            </span>
          )}
        </div>
        {compliance.loading ? (
          <div className="mt-4 h-16 w-32 animate-pulse rounded-xl bg-[#EEF3FB]" />
        ) : (
          <p className="mt-2 text-[56px] font-bold leading-none text-[#08152F]">
            {score}
            <span className="text-2xl font-semibold text-[#94A3B8]">/100</span>
          </p>
        )}
        {compliance.data && (
          <ul className="mt-5 flex flex-col gap-2">
            {compliance.data.complianceScore.criteria.map((c) => {
              const percent = Math.round(c.score * 100);
              const icon =
                c.score >= 1
                  ? "tabler:circle-check-filled"
                  : c.score === 0
                    ? "tabler:circle-x-filled"
                    : "tabler:circle-dashed";
              const iconClassName =
                c.score >= 1
                  ? "text-lg text-emerald-600"
                  : c.score === 0
                    ? "text-lg text-rose-500"
                    : "text-lg text-amber-500";
              return (
                <li key={c.code} className="flex items-center gap-2 text-sm">
                  <Icon icon={icon} className={iconClassName} />
                  <span className={c.score >= 1 ? "text-[#334155]" : "text-[#334155] font-medium"}>
                    {c.description}
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-[#94A3B8]">{percent}%</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          icon="tabler:list-details"
          label="Tratamientos activos"
          value={compliance.data ? `${compliance.data.treatments.activePercentage}%` : "—"}
          subtitle={compliance.data ? `${compliance.data.treatments.active} de ${compliance.data.treatments.total} tratamientos` : "Cargando..."}
          loading={compliance.loading}
        />
        <DashboardStatCard
          icon="tabler:scale"
          label="Solicitudes ARCO abiertas"
          value={compliance.data ? String(compliance.data.arcoRequests.open) : "—"}
          subtitle={compliance.data ? `${compliance.data.arcoRequests.overdue} vencidas · ${compliance.data.arcoRequests.resolvedThisMonth} resueltas este mes` : "Cargando..."}
          loading={compliance.loading}
        />
        <DashboardStatCard
          icon="tabler:shield-check"
          label="Consentimientos activos"
          value={compliance.data ? String(compliance.data.consents.active) : "—"}
          subtitle={compliance.data ? `${compliance.data.consents.revoked} revocados` : "Cargando..."}
          loading={compliance.loading}
        />
        <DashboardStatCard
          icon="tabler:alert-triangle"
          label="ARCO por vencer (5 días)"
          value={compliance.data ? String(compliance.data.arcoRequests.dueSoon.length) : "—"}
          subtitle="Alertas de vencimiento próximo"
          loading={compliance.loading}
        />
      </div>

      <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
          Solicitudes ARCO próximas a vencer
        </h2>
        {compliance.loading ? (
          <div className="h-24 w-full animate-pulse rounded-xl bg-[#EEF3FB]" />
        ) : compliance.data && compliance.data.arcoRequests.dueSoon.length > 0 ? (
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
                {compliance.data.arcoRequests.dueSoon.map((req) => (
                  <tr key={req.id} className="border-t border-[#EEF2F8]">
                    <td className="py-2 pr-4 text-[#1A2B5B]">{req.requestType}</td>
                    <td className="py-2 pr-4 text-[#475569]">
                      {req.docType} {req.docNumber}
                    </td>
                    <td className="py-2 font-semibold text-amber-700">
                      {formatDateToString({ date: new Date(req.dueDate) })}
                    </td>
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

      <div
        data-tour="dashboard-stats"
        className="grid w-full grid-cols-1 gap-3.5 lg:grid-cols-3"
      >
        <div className="min-h-[128px] lg:col-span-1">
          <CompanyCreditsCard
            data={companyCredits.data}
            loading={companyCredits.loading}
            error={companyCredits.error}
          />
        </div>

        <DashboardStatCard
          icon="tabler:file-check"
          label="Formularios activos"
          value={formatCompactNumber(activeFormsCount)}
          subtitle={`${formatCompactNumber(pendingApprovalsCount)} pendientes de aprobación`}
          loading={formsStatLoading}
        />

        <DashboardStatCard
          icon="tabler:users-group"
          label="Registros totales"
          value={formatCompactNumber(totalRecords)}
          subtitle="Acumulado histórico"
          loading={recordsStatLoading}
        />
      </div>

      <div data-tour="dashboard-officer">
        <DataOfficerCard compact hideWhenAssigned={false} />
      </div>

      <div
        data-tour="dashboard-activity"
        className="grid min-h-[420px] w-full flex-1 auto-rows-[minmax(250px,auto)] grid-cols-1 gap-4 overflow-visible md:gap-5 xl:grid-cols-2"
      >
        <DashboardChartCard
          title="Campañas activas"
          href="/admin/campanas"
          loading={campaigns.loading}
          empty={campaigns.data ? campaigns.data?.length < 1 : false}
          error={campaigns.error}
          skeletonRows={3}
        >
          <HorizontalBarChart
            items={campaigns.data?.map(({ _id, name, audience }) => ({
              id: _id,
              label: name,
              value: (audience as { delivered?: number }).delivered ?? 0,
              max:
                (audience as { total?: number }).total ??
                audience.count ??
                0,
            }))}
            barHeight="lg"
          />
          {campaigns.data &&
            campaigns.data.length > 0 &&
            campaigns.data.length < 3 && (
              <div className="flex flex-1 items-center justify-center py-4 text-center text-stone-500">
                <p className="px-2 text-xs sm:text-sm">
                  No hay campañas activas en el periodo seleccionado.
                </p>
              </div>
            )}
        </DashboardChartCard>

        <DashboardChartCard
          title="Estado de formularios"
          href="/admin/recoleccion"
          loading={collectFormsClasifications.loading}
          empty={
            collectFormsClasifications.data
              ? collectFormsClasifications.data?.length < 1
              : false
          }
          error={collectFormsClasifications.error}
          skeletonRows={4}
        >
          <HorizontalBarChart
            items={collectFormsClasifications.data?.map(
              ({ _id, name, totalResponses, verifiedResponses }) => ({
                id: _id,
                label: name,
                value: verifiedResponses,
                max: totalResponses,
              })
            )}
            barHeight="lg"
          />
          {collectFormsClasifications.data &&
            collectFormsClasifications.data.length > 0 &&
            collectFormsClasifications.data.length < 3 && (
              <div className="flex flex-1 items-center justify-center py-4 text-center text-stone-500">
                <p className="px-2 text-xs sm:text-sm">
                  No hay formularios para el periodo seleccionado.
                </p>
              </div>
            )}
        </DashboardChartCard>

        <DashboardChartCard
          loading={userActionLogs.loading}
          empty={userActionLogs.data ? userActionLogs.data?.length < 1 : false}
          error={userActionLogs.error}
          title="Actividad y Usuarios"
          skeletonVariant="activity"
          skeletonRows={3}
        >
          {userActionLogs.data && userActionLogs.data.length ? (
            <div className="w-full flex-1">
              <UserActionLogsTable items={userActionLogs.data} />
            </div>
          ) : null}
        </DashboardChartCard>

        <div className="relative flex min-h-[250px] flex-col items-start gap-4 overflow-hidden rounded-3xl bg-[linear-gradient(98deg,_#0A245F_0%,_#153E9F_100%)] px-8 py-8 text-left text-white">
          <div className="absolute -right-14 -top-18 h-52 w-52 rounded-full border border-white/14" />
          <div className="absolute -bottom-20 -left-20 h-36 w-36 rounded-full border border-white/14" />

          <div className="inline-flex rounded-full bg-[#0C2B67] px-3 py-1 text-xs font-semibold leading-none text-white">
            Plan actual
          </div>

          <h4 className="mt-1 text-[18px] font-bold leading-none sm:text-[20px] md:text-[22px]">
            {companyPlanName}
          </h4>
          <p className="max-w-[760px] text-[14px] font-medium leading-snug text-white/95 sm:text-[15px] md:text-[16px]">
            {companyPlanDescription}
          </p>

          <span className="flex-1" />

          <Link
            href={"/perfil/planes"}
            className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/12 px-5 py-2.5 text-[18px] font-semibold leading-none text-white transition-colors hover:bg-white/18"
          >
            Ver planes disponibles
          </Link>
        </div>
      </div>
    </div>
  );
}
