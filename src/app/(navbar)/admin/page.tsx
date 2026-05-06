"use client";

import Button from "@/components/base/Button";
import DashboardChartCard from "@/components/dashboard/DashboardChartCard";
import HorizontalBarChart from "@/components/dashboard/HorizontalBarChart";
import UserActionLogsTable from "@/components/dashboard/UserActionLogsTable";
import CompanyCreditsCard from "@/components/dashboard/CompanyCreditsCard";
import CustomSelect from "@/components/forms/CustomSelect";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCollectFormClasifications } from "@/hooks/useCollectFormClasifications";
import { useCompanyActionLogs } from "@/hooks/useCompanyActionLogs";
import { useCompanyCredits } from "@/hooks/useCompanyCredits";
import {
  useAcceptedPoliciesByMonth,
  useCompanyCollectFormsCount,
} from "@/hooks/useCollectFormMetrics";
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

export default function Home() {
const currentDate = useMemo(() => new Date(), []);
const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);
const currentMonth = useMemo(() => monthsOptions[currentDate.getMonth()], [currentDate]);

const [year, setYear] = useState<string>(String(currentYear));
const [month, setMonth] = useState<MONTH_KEY>(currentMonth.value);

const yearOptions = useMemo<CustomSelectOption<string>[]>(() => {
  const options: CustomSelectOption<string>[] = [];
  // (año actual + 1) ... (año actual - 5)
  for (let y = currentYear + 1; y >= currentYear - 5; y--) {
    options.push({ title: String(y), value: String(y) });
  }
  return options;
}, [currentYear]);

const yearNumber = useMemo(() => Number(year), [year]);
const dateRange = useMemo(
  () => getMonthRange(month, Number.isFinite(yearNumber) ? yearNumber : currentYear),
  [month, yearNumber, currentYear]
);
        const user = useSessionStore((store) => store.user);
        const companyPlanName = (user?.company?.plan?.name || "Plan actual").toLocaleUpperCase("es-CO");
        const companyPlanDescription =
          "Mejora tu plan o adquiere más beneficios para desbloquear todas las funciones.";
        const { shouldFetch, isCompanyAdmin, isSuperAdmin } = usePermissionCheck();
        
        // Solo cargar datos si tiene permisos
        const collectFormsClasifications = useCollectFormClasifications({
        companyId: user?.companyUserData?.companyId,
        pageSize: 6,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        enabled: shouldFetch('classification.view'),
        });
        const campaigns = useCampaigns({
        companyId: user?.companyUserData?.companyId,
        pageSize: 5,
        active: true,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        enabled: shouldFetch('campaigns.view'),
        });

        // ⭐ IMPORTANTE: Solo cargar actionLogs si es COMPANY_ADMIN o SUPERADMIN
        const userActionLogs = useCompanyActionLogs({
        companyId: user?.companyUserData?.companyId,
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
        const acceptedPoliciesByMonth = useAcceptedPoliciesByMonth({
          year: dateRange.startDate.getFullYear(),
          month: dateRange.startDate.getMonth() + 1,
          enabled: shouldFetch("collect.view"),
        });

        const activeFormsCount = useMemo(
          () => companyCollectFormsCount.data?.totalForms ?? 0,
          [companyCollectFormsCount.data]
        );
        const totalRecords = useMemo(
          () =>
            collectFormsClasifications.data?.reduce(
              (acc, item) => acc + (item.totalResponses ?? 0),
              0
            ) ?? 0,
          [collectFormsClasifications.data]
        );
        const pendingApprovalsCount = useMemo(
          () =>
            collectFormsClasifications.data?.reduce(
              (acc, item) => acc + Math.max(item.totalResponses - item.verifiedResponses, 0),
              0
            ) ?? 0,
          [collectFormsClasifications.data]
        );

        return (
        <div className="flex flex-col gap-5 p-5 sm:p-6 md:p-7 h-full max-h-full bg-[#F8FAFE]">
            <section className="bg-white border border-[#E8EDF7] rounded-2xl px-5 md:px-6 py-4 md:py-5 shadow-[0_2px_10px_rgba(15,35,70,0.03)]">
                <header className="flex flex-col gap-4 h-fit">
                    <div className="text-left">
                        <h6 className="font-medium text-sm leading-tight text-[#62779E]">
                            Hola,{" "}
                            <span className="text-[#2B59C3] font-semibold">
                                {user?.name} {user?.lastName}
                            </span>
                        </h6>
                        <p className="text-xs text-[#778AAF] mt-0.5">Bienvenido/a de vuelta</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="text-[#0A1633]">
                            <h4 className="text-[38px] font-bold leading-none mb-1">Panel de inicio</h4>
                            <div className="flex gap-1.5 items-center flex-wrap">
                                <p className="text-base text-[#60749C]">
                                    {monthsOptions.find((option) => option.value === month)?.title} {year}
                                </p>
                                <p className="text-base text-[#60749C]">
                                    {formatDateToString({
                                    date: dateRange.startDate,
                                    })}
                                    {" - "}
                                    {formatDateToString({
                                    date: dateRange.endDate,
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:flex-1 sm:justify-end">
                            {(month != currentMonth.value || year !== String(currentYear)) && (
                            <Button onClick={(_)=> {
                              setMonth(currentMonth.value);
                              setYear(String(currentYear));
                            }}
                                hierarchy="tertiary"
                                className="underline font-normal! text-sm text-[#1B4FCB] px-1!"
                                >
                                Este mes
                            </Button>
                            )}
                            <CustomSelect className="w-full sm:w-[92px] flex-none [&>button]:h-[38px] [&>button]:rounded-xl! [&>button]:border-[#DDE6F4]! [&>button]:bg-white! [&>button]:text-[#0A1736]! [&>button]:font-medium [&>button]:text-[14px] [&>button]:px-3!"
                                value={month} onChange={(value)=> setMonth(value)}
                                options={monthsOptions}
                                />
                            <CustomSelect className="w-full sm:w-[76px] flex-none [&>button]:h-[38px] [&>button]:rounded-xl! [&>button]:border-[#DDE6F4]! [&>button]:bg-white! [&>button]:text-[#0A1736]! [&>button]:font-medium [&>button]:text-[14px] [&>button]:px-3!"
                                value={year} onChange={(value)=> setYear(value)}
                                options={yearOptions}
                                />

                                <Button startContent={ <Icon icon={"lets-icons:export"} className="text-lg sm:text-xl" />
                                }
                                className="h-[38px] text-[14px] font-semibold bg-[#0D2B74]! border-[#0D2B74]! px-4! rounded-xl! shadow-[0_4px_10px_rgba(13,43,116,0.18)]"
                                >
                                Exportar
                                </Button>
                        </div>
                    </div>
                </header>
            </section>

            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                <div className="lg:col-span-1 min-h-[128px]">
                    <CompanyCreditsCard data={companyCredits.data} loading={companyCredits.loading}
                        error={companyCredits.error} />
                </div>

                <div className="min-h-[128px] rounded-2xl border border-[#E5EBF7] bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(15,35,70,0.04)] flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-[#2A4F96]">
                        <span className="w-7 h-7 rounded-full bg-[#F3F6FF] border border-[#E6ECFB] grid place-content-center">
                            <Icon icon="tabler:file-check" className="text-[15px] text-[#5B76B3]" />
                        </span>
                        <p className="text-[14px] font-medium text-[#2C416F]">Formularios activos</p>
                    </div>
                    <div>
                        <p className="text-[40px] leading-none font-bold text-[#08152F]">
                            {formatCompactNumber(activeFormsCount)}
                        </p>
                        <p className="text-sm mt-2 text-[#6C7FA6]">
                            {formatCompactNumber(pendingApprovalsCount)} pendientes de aprobación
                        </p>
                    </div>
                </div>

                <div className="min-h-[128px] rounded-2xl border border-[#E5EBF7] bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(15,35,70,0.04)] flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-[#2A4F96]">
                        <span className="w-7 h-7 rounded-full bg-[#F3F6FF] border border-[#E6ECFB] grid place-content-center">
                            <Icon icon="tabler:users-group" className="text-[15px] text-[#5B76B3]" />
                        </span>
                        <p className="text-[14px] font-medium text-[#2C416F]">Registros totales</p>
                    </div>
                    <div>
                        <p className="text-[40px] leading-none font-bold text-[#08152F]">
                            {formatCompactNumber(totalRecords)}
                        </p>
                        <p className="text-sm mt-2 text-[#6C7FA6]">
                            {acceptedPoliciesByMonth.data?.period ?? "Periodo seleccionado"}
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="w-full flex-1 min-h-[420px] overflow-visible gap-4 md:gap-5 grid grid-cols-1 xl:grid-cols-2 auto-rows-[minmax(250px,auto)]">
                <DashboardChartCard title="Campañas activas" href="/admin/campanas"
                    loading={campaigns.loading} empty={campaigns.data ? campaigns.data?.length < 1 : false}
                    error={campaigns.error}>
                    <HorizontalBarChart items={campaigns.data?.map(({ _id, name, audience })=> ({
                        id: _id,
                        label: name,
                        value: (audience as any).delivered ?? 0,
                        max: (audience as any).total ?? audience.count ?? 0,
                        }))}
                        barHeight="lg"
                        />
                        {campaigns.data &&
                        campaigns.data.length > 0 &&
                        campaigns.data.length < 3 && ( <div
                            className="flex-1 text-center text-stone-500 flex items-center justify-center py-4">
                            <p className="text-xs sm:text-sm px-2">
                                No hay campañas activas en el periodo seleccionado.
                            </p>
            </div>
            )}
            </DashboardChartCard>
            <DashboardChartCard title="Estado de formularios" href="/admin/recoleccion"
                loading={collectFormsClasifications.loading} empty={ collectFormsClasifications.data ?
                collectFormsClasifications.data?.length < 1 : false } error={collectFormsClasifications.error}>
                <HorizontalBarChart items={collectFormsClasifications.data?.map( ({ _id, name, totalResponses,
                    verifiedResponses })=> ({
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
                    collectFormsClasifications.data.length < 3 && ( <div
                        className="flex-1 text-center text-stone-500 flex items-center justify-center py-4">
                        <p className="text-xs sm:text-sm px-2">
                            No hay formularios para el periodo seleccionado.
                        </p>
        </div>
        )}
        </DashboardChartCard>
        <DashboardChartCard loading={userActionLogs.loading} empty={userActionLogs.data ? userActionLogs.data?.length <
            1 : false} error={userActionLogs.error} title="Actividad y Usuarios">
            {userActionLogs.data && userActionLogs.data.length ? (
            <div className="w-full flex-1">
                <UserActionLogsTable items={userActionLogs.data} />
            </div>
            ) : null}
        </DashboardChartCard>
        <div
            className="rounded-3xl px-8 py-8 bg-[linear-gradient(98deg,_#0A245F_0%,_#153E9F_100%)] text-white relative flex flex-col items-start text-left gap-4 overflow-hidden min-h-[250px]">
            <div className="absolute -right-14 -top-18 w-52 h-52 rounded-full border border-white/14" />
            <div className="absolute -left-20 -bottom-20 w-36 h-36 rounded-full border border-white/14" />

            <div className="inline-flex px-3 py-1 rounded-full bg-[#0C2B67] text-white text-xs font-semibold leading-none">
                Plan actual
            </div>

            <h4 className="font-bold text-[18px] sm:text-[20px] md:text-[22px] leading-none mt-1">{companyPlanName}</h4>
            <p className="text-[14px] sm:text-[15px] md:text-[16px] font-medium max-w-[760px] leading-snug text-white/95">
                {companyPlanDescription}
            </p>

            <span className="flex-1" />

            <Link href={"/perfil/planes"}
                className="flex items-center gap-2 font-semibold px-5 py-2.5 rounded-2xl bg-white/12 border border-white/20 text-white hover:bg-white/18 transition-colors text-[18px] leading-none">
            Ver planes disponibles
            </Link>
        </div>
        </div>

        {/*
        <SimpleUploader /> */}
        </div>
        );
        }
