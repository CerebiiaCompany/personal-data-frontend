"use client";

import Button from "@/components/base/Button";
import Dropdown from "@/components/base/Dropdown";
import DashboardChartCard from "@/components/dashboard/DashboardChartCard";
import HorizontalBarChart from "@/components/dashboard/HorizontalBarChart";
import UserActionLogsTable from "@/components/dashboard/UserActionLogsTable";
import CompanyCreditsCard from "@/components/dashboard/CompanyCreditsCard";
import CustomSelect from "@/components/forms/CustomSelect";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCollectFormClasifications } from "@/hooks/useCollectFormClasifications";
import { useCompanyActionLogs } from "@/hooks/useCompanyActionLogs";
import { useCompanyCredits } from "@/hooks/useCompanyCredits";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { useSessionStore } from "@/store/useSessionStore";
import { CustomSelectOption } from "@/types/forms.types";
import { getMonthRange, MONTH_KEY, monthsOptions } from "@/types/months.types";
import { formatDateToString } from "@/utils/date.utils";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useMemo, useState } from "react";

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

        return (
        <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 p-2 sm:p-4 md:p-6 lg:p-8 h-full max-h-full">
            {/* Dashboard header */}
            <header className="flex flex-col gap-2 sm:gap-3 md:gap-4 h-fit">
                {/* Welcome card */}
                <div className="rounded-lg bg-primary-50 py-2.5 px-3 sm:py-3 sm:px-4 md:px-5 text-left">
                    <h6 className="font-medium text-sm sm:text-base leading-tight">
                        Hola,{" "}
                        <span className="text-primary-500 font-bold">
                            {user?.name} {user?.lastName}
                        </span>
                    </h6>
                    <p className="text-xs sm:text-sm text-stone-600 mt-0.5">Bienvenido/a</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 sm:pl-3">
                    {/* Title info */}
                    <div className="text-primary-900">
                        <h4 className="text-lg sm:text-xl md:text-2xl font-semibold mb-1">Panel de inicio</h4>
                        <div className="flex gap-1.5 items-center flex-wrap">
                            <Icon icon={"tabler:calendar-week"} className="text-sm sm:text-base flex-shrink-0" />
                            <p className="text-xs sm:text-sm text-stone-600">
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

                    {/* Tools */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 md:gap-3 sm:flex-1 sm:justify-end">
                        {(month != currentMonth.value || year !== String(currentYear)) && (
                        <Button onClick={(_)=> {
                          setMonth(currentMonth.value);
                          setYear(String(currentYear));
                        }}
                            hierarchy="tertiary"
                            className="underline font-normal! text-sm"
                            >
                            Este mes
                        </Button>
                        )}
                        <CustomSelect className="w-full sm:w-auto sm:max-w-[180px] md:max-w-[200px] flex-none"
                            value={month} onChange={(value)=> setMonth(value)}
                            options={monthsOptions}
                            />
                        <CustomSelect className="w-full sm:w-auto sm:max-w-[140px] md:max-w-[160px] flex-none"
                            value={year} onChange={(value)=> setYear(value)}
                            options={yearOptions}
                            />

                            <Button startContent={ <Icon icon={"lets-icons:export"} className="text-lg sm:text-xl" />
                            }
                            className="text-sm sm:text-base"
                            >
                            Exportar
                            </Button>
                    </div>
                </div>
            </header>

            {/* Créditos del mes seleccionado */}
            <div className="w-full">
                <CompanyCreditsCard data={companyCredits.data} loading={companyCredits.loading}
                    error={companyCredits.error} />
            </div>

            <div
                className="w-full flex-1 h-0 overflow-auto gap-3 sm:gap-4 md:gap-x-5 grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2">
                <DashboardChartCard title="Proceso de Campañas Activas" href="/admin/campanas"
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
                                Añade o activa más campañas este mes para ver su proceso aquí.
                            </p>
            </div>
            )}
            </DashboardChartCard>
            <DashboardChartCard title="Estado de Aprobación de los Formularios" href="/admin/recoleccion"
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
                            Añade más formularios este mes para ver su estado de aprobación.
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
            className="bg-red-500 rounded-lg p-4 sm:p-6 md:p-9 bg-[linear-gradient(278.61deg,_#301AAC_0%,_#030014_99.37%)] text-white relative flex flex-col items-start text-left gap-3 sm:gap-4 overflow-hidden min-h-[280px] sm:min-h-[300px] md:min-h-0">
            <div
                className="w-2/5 aspect-square absolute right-[-10%] top-[-30%] rounded-full border-primary-50/50 border border-dashed" />
            <div
                className="w-[50%] aspect-square absolute right-[-10%] bottom-[-40%] rounded-full border-primary-50/50 border border-dashed" />

            <h4 className="font-bold text-lg sm:text-xl md:text-2xl">Plan PRO</h4>
            <p className="text-sm sm:text-base md:text-lg font-medium max-w-sm leading-snug">
                Mejora tu plan o adquiere más beneficios
            </p>

            <span className="flex-1" />

            <Link href={"/perfil/planes"}
                className="flex items-center gap-2 font-medium px-3 py-2 rounded-lg bg-white text-primary-500 transition-colors hover:bg-primary-500 hover:text-white text-sm sm:text-base">
            <Icon icon={"mdi:sparkles-outline"} className="text-lg sm:text-xl" />
            Mejora tu Plan
            </Link>
        </div>
        </div>

        {/*
        <SimpleUploader /> */}
        </div>
        );
        }
