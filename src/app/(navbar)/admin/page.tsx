"use client";

import Button from "@/components/base/Button";
import Dropdown from "@/components/base/Dropdown";
import DashboardChartCard from "@/components/dashboard/DashboardChartCard";
import HorizontalBarChart from "@/components/dashboard/HorizontalBarChart";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCollectFormClasifications } from "@/hooks/useCollectFormClasifications";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [month, setMonth] = useState<string>("agosto");
  const user = useSessionStore((store) => store.user);
  const collectFormsClasifications = useCollectFormClasifications({
    companyId: user?.companyUserData?.companyId,
    pageSize: 6,
  });
  const campaigns = useCampaigns({
    companyId: user?.companyUserData?.companyId,
    pageSize: 5,
    active: true,
  });

  return (
    <div className="flex flex-col gap-4 p-8 h-fit">
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
              <p className="text-sm">1 agosto de 2025 - 31 de agosto de 2025</p>
            </div>
          </div>

          {/* Tools */}
          <div className="flex-1 flex justify-end gap-3">
            <Dropdown
              value={month}
              onChange={(value) => setMonth(value)}
              options={[
                {
                  value: "agosto",
                  label: "Agosto",
                },
                {
                  value: "diciembre",
                  label: "Diciembre",
                },
              ]}
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
      <div className="w-full flex-1 gap-x-5 gap-y-4 grid grid-cols-2 grid-rows-2">
        <DashboardChartCard
          title="Proceso de Campañas Activas"
          href="/admin/campanas"
          loading={campaigns.loading}
          empty={!Boolean(campaigns.data && campaigns.data?.length)}
          error={campaigns.error}
        >
          <HorizontalBarChart
            items={campaigns.data?.map(
              ({ _id, name, audience: { count, deliveredCount } }) => ({
                id: _id,
                label: name,
                value: deliveredCount,
                max: count,
              })
            )}
            barHeight="lg"
          />
          {campaigns.data && campaigns.data.length < 3 && (
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
            !Boolean(
              collectFormsClasifications.data &&
                collectFormsClasifications.data?.length
            )
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
            collectFormsClasifications.data.length < 3 && (
              <div className="flex-1 text-center text-stone-500 flex items-center justify-center">
                Añade más formularios este mes para ver su estado de aprobación.
              </div>
            )}
        </DashboardChartCard>
        <DashboardChartCard title="Actividad y Usuarios">
          <p>Usuarios</p>
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
