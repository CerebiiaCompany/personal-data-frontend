"use client";

import Button from "@/components/base/Button";
import Dropdown from "@/components/base/Dropdown";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { useState } from "react";

export default function Home() {
  const [month, setMonth] = useState<string>("agosto");
  const { user } = useSessionStore();

  const chartCardBaseClassName = clsx("shadow-md bg-white rounded-md border border-disabled p-3");

  return (
    <div className="flex flex-col gap-4 p-8 h-full">
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
        <div className={chartCardBaseClassName}></div>
        <div className={chartCardBaseClassName}></div>
        <div className={chartCardBaseClassName}></div>
        <div className={chartCardBaseClassName}></div>
      </div>
    </div>
  );
}
