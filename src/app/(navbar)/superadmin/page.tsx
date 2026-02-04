"use client";

import Button from "@/components/base/Button";
import Dropdown from "@/components/base/Dropdown";
import DashboardChartCard from "@/components/dashboard/DashboardChartCard";
import HorizontalBarChart from "@/components/dashboard/HorizontalBarChart";
import UserActionLogsTable from "@/components/dashboard/UserActionLogsTable";
import CustomSelect from "@/components/forms/CustomSelect";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCollectFormClasifications } from "@/hooks/useCollectFormClasifications";
import { useCompanyActionLogs } from "@/hooks/useCompanyActionLogs";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { useSessionStore } from "@/store/useSessionStore";
import { getMonthRange, MONTH_KEY, monthsOptions } from "@/types/months.types";
import { formatDateToString } from "@/utils/date.utils";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const currentMonth = useMemo(() => monthsOptions[new Date().getMonth()], []);

  const [month, setMonth] = useState<MONTH_KEY>(currentMonth.value);
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>(getMonthRange(month));
  const user = useSessionStore((store) => store.user);
  const { shouldFetch, isCompanyAdmin, isSuperAdmin } = usePermissionCheck();
  
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

  useEffect(() => {
    const range = getMonthRange(month);

    setDateRange(range);
  }, [month]);

  return (
    <div className="flex flex-col gap-4 p-8 h-full max-h-full">
      {/* Dashboard header */}
      <header className="flex flex-col gap-4 h-fit">
        {/* Welcome card */}
        <div className="rounded-lg bg-primary-50 py-3 px-5 text-left">
          <h6 className="font-medium">
            Hola,{" "}
            <span className="text-primary-500 font-bold">
              {user?.name} {user?.lastName}
            </span>
          </h6>
          <p className="text-sm text-stone-600">Bienvenido/a</p>
        </div>
        <div className="flex items-center justify-between pl-3">
          {/* Title info */}
          <div className="text-primary-900">
            <h4 className="text-2xl">Panel de inicio</h4>
            <div className="flex gap-1 items-center">
              <Icon icon={"tabler:calendar-week"} className="" />
              <p className="text-sm">
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
          <div className="flex-1 flex justify-end gap-3">
            {month != currentMonth.value && (
              <Button
                onClick={(_) => setMonth(currentMonth.value)}
                hierarchy="tertiary"
                className="underline font-normal!"
              >
                Este mes
              </Button>
            )}
            <CustomSelect
              className="w-full max-w-[200px] flex-none"
              value={month}
              onChange={(value) => setMonth(value)}
              options={monthsOptions}
            />

            <Button
              startContent={
                <Icon icon={"lets-icons:export"} className="text-xl" />
              }
            >
              Exportar
            </Button>
          </div>
        </div>
      </header>
      <div className="w-full flex-1 h-0 overflow-auto gap-x-5 gap-y-4 grid grid-cols-2 grid-rows-2">
        <DashboardChartCard
          title="Proceso de Campañas Activas"
          href="/admin/campanas"
          loading={campaigns.loading}
          empty={campaigns.data ? campaigns.data?.length < 1 : false}
          error={campaigns.error}
        >
          <HorizontalBarChart
            items={campaigns.data?.map(({ _id, name, audience }) => ({
              id: _id,
              label: name,
              value: (audience as any).delivered ?? 0,
              max: (audience as any).total ?? audience.count ?? 0,
            }))}
            barHeight="lg"
          />
          {campaigns.data &&
            campaigns.data.length > 0 &&
            campaigns.data.length < 3 && (
              <div className="flex-1 text-center text-stone-500 flex items-center justify-center">
                Añade o activa más campañas este mes para ver su proceso aquí.
              </div>
            )}
        </DashboardChartCard>
        <DashboardChartCard
          title="Estado de Aprobación de los Formularios"
          href="/admin/recoleccion"
          loading={collectFormsClasifications.loading}
          empty={
            collectFormsClasifications.data
              ? collectFormsClasifications.data?.length < 1
              : false
          }
          error={collectFormsClasifications.error}
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
              <div className="flex-1 text-center text-stone-500 flex items-center justify-center">
                Añade más formularios este mes para ver su estado de aprobación.
              </div>
            )}
        </DashboardChartCard>
        <DashboardChartCard
          loading={userActionLogs.loading}
          empty={userActionLogs.data ? userActionLogs.data?.length < 1 : false}
          error={userActionLogs.error}
          title="Actividad y Usuarios"
        >
          {userActionLogs.data && userActionLogs.data.length ? (
            <div className="w-full flex-1">
              <UserActionLogsTable items={userActionLogs.data} />
            </div>
          ) : null}
        </DashboardChartCard>
        <div className="bg-red-500 rounded-lg p-9 bg-[linear-gradient(278.61deg,_#301AAC_0%,_#030014_99.37%)] text-white relative flex flex-col items-start text-left gap-4 overflow-hidden">
          <div className="w-2/5 aspect-square absolute right-[-10%] top-[-30%] rounded-full border-primary-50/50 border border-dashed" />
          <div className="w-[50%] aspect-square absolute right-[-10%] bottom-[-40%] rounded-full border-primary-50/50 border border-dashed" />

          <h4 className="font-bold text-2xl">Plan PRO</h4>
          <p className="text-lg font-medium max-w-sm">
            Mejora tu plan o adquiere más beneficios
          </p>

          <span className="flex-1" />

          <Link
            href={"/perfil/planes"}
            className="flex items-center gap-2 font-medium px-3 py-2 rounded-lg bg-white text-primary-500 transition-colors hover:bg-primary-500 hover:text-white"
          >
            <Icon icon={"mdi:sparkles-outline"} className="text-xl" />
            Mejora tu Plan
          </Link>
        </div>
      </div>

      {/* <SimpleUploader /> */}
    </div>
  );
}
