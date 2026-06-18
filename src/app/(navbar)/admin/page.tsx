"use client";

import Button from "@/components/base/Button";
import DashboardChartCard from "@/components/dashboard/DashboardChartCard";
import HorizontalBarChart from "@/components/dashboard/HorizontalBarChart";
import UserActionLogsTable from "@/components/dashboard/UserActionLogsTable";
import CompanyCreditsCard from "@/components/dashboard/CompanyCreditsCard";
import { DashboardStatCardSkeleton } from "@/components/dashboard/DashboardSkeletons";
import DataOfficerCard from "@/components/administration/DataOfficerCard";
import CustomSelect from "@/components/forms/CustomSelect";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useCampaigns } from "@/hooks/useCampaigns";
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
import Link from "next/link";
import { useMemo, useState } from "react";

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
  const currentDate = useMemo(() => new Date(), []);
  const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);
  const currentMonth = useMemo(
    () => monthsOptions[currentDate.getMonth()],
    [currentDate]
  );

  const [year, setYear] = useState<string>(String(currentYear));
  const [month, setMonth] = useState<MONTH_KEY>(currentMonth.value);

  const yearOptions = useMemo<CustomSelectOption<string>[]>(() => {
    const options: CustomSelectOption<string>[] = [];
    for (let y = currentYear + 1; y >= currentYear - 5; y--) {
      options.push({ title: String(y), value: String(y) });
    }
    return options;
  }, [currentYear]);

  const yearNumber = useMemo(() => Number(year), [year]);
  const dateRange = useMemo(
    () =>
      getMonthRange(
        month,
        Number.isFinite(yearNumber) ? yearNumber : currentYear
      ),
    [month, yearNumber, currentYear]
  );

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
    startDate: dateRange.startDate.toISOString(),
    endDate: dateRange.endDate.toISOString(),
    enabled: shouldFetch("classification.view"),
  });

  const collectFormsTotals = useCollectFormClasifications({
    companyId: companyId,
    pageSize: 200,
    enabled: shouldFetch("classification.view"),
  });

  const campaigns = useCampaigns({
    companyId: companyId,
    pageSize: 5,
    active: true,
    startDate: dateRange.startDate.toISOString(),
    endDate: dateRange.endDate.toISOString(),
    enabled: shouldFetch("campaigns.view"),
  });

  const userActionLogs = useCompanyActionLogs({
    companyId: companyId,
    startDate: dateRange.startDate.toISOString(),
    endDate: dateRange.endDate.toISOString(),
    pageSize: 3,
    enabled: isCompanyAdmin || isSuperAdmin,
  });

  const companyCredits = useCompanyCredits({
    year: dateRange.startDate.getFullYear(),
    month: dateRange.startDate.getMonth() + 1,
  });

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

  const formsStatLoading =
    companyCollectFormsCount.loading || collectFormsClasifications.loading;
  const recordsStatLoading = collectFormsTotals.loading;

  return (
    <div className="flex h-full max-h-full flex-col gap-5 bg-[#F8FAFE] p-5 sm:p-6 md:p-7">
      <section className="rounded-2xl border border-[#E8EDF7] bg-white px-5 py-4 shadow-[0_2px_10px_rgba(15,35,70,0.03)] md:px-6 md:py-5">
        <header className="flex h-fit flex-col gap-4">
          <div className="text-left">
            <h6 className="text-sm font-medium leading-tight text-[#62779E]">
              Hola,{" "}
              <span className="font-semibold text-[#2B59C3]">
                {user?.name} {user?.lastName}
              </span>
            </h6>
            <p className="mt-0.5 text-xs text-[#778AAF]">Bienvenido/a de vuelta</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[#0A1633]">
              <h4 className="mb-1 text-[38px] font-bold leading-none">
                Panel de inicio
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-base text-[#60749C]">
                  {monthsOptions.find((option) => option.value === month)?.title}{" "}
                  {year}
                </p>
                <p className="text-base text-[#60749C]">
                  {formatDateToString({ date: dateRange.startDate })}
                  {" - "}
                  {formatDateToString({ date: dateRange.endDate })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:flex-1 sm:justify-end">
              {(month != currentMonth.value || year !== String(currentYear)) && (
                <Button
                  onClick={() => {
                    setMonth(currentMonth.value);
                    setYear(String(currentYear));
                  }}
                  hierarchy="tertiary"
                  className="px-1! text-sm font-normal! text-[#1B4FCB] underline"
                >
                  Este mes
                </Button>
              )}
              <CustomSelect
                className="w-full flex-none sm:w-[92px] [&>button]:h-[38px] [&>button]:rounded-xl! [&>button]:border-[#DDE6F4]! [&>button]:bg-white! [&>button]:px-3! [&>button]:text-[14px] [&>button]:font-medium [&>button]:text-[#0A1736]!"
                value={month}
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

      <div className="grid w-full grid-cols-1 gap-3.5 lg:grid-cols-3">
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

      <div>
        <DataOfficerCard compact />
      </div>

      <div className="grid min-h-[420px] w-full flex-1 auto-rows-[minmax(250px,auto)] grid-cols-1 gap-4 overflow-visible md:gap-5 xl:grid-cols-2">
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
