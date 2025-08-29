import Button from "@/components/base/Button";
import { Icon } from "@iconify/react";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 p-8">
      {/* Welcome card */}
      <div className="rounded-lg bg-primary-50 py-3 px-5 text-left">
        <h6 className="font-semibold">Hola, Luis Sandoval</h6>
        <p className="text-sm">Bienvenido/a</p>
      </div>

      {/* Dashboard header */}
      <div className="flex items-center justify-between pl-3 gap-20">
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
          <label className="flex items-center rounded-lg gap-3 text-stone-600 border border-disabled flex-1 relative pl-3 py-3">
            <Icon icon={"tabler:search"} />
            <input
              type="text"
              placeholder="Buscar"
              className="w-full h-full absolute px-6"
            />
          </label>

          <Button
            hierarchy="secondary"
            startContent={
              <Icon icon={"tabler:chevron-down"} className="text-xl" />
            }
          >
            Agosto
          </Button>

          <Button
            startContent={
              <Icon icon={"lets-icons:export"} className="text-xl" />
            }
          >
            Exportar
          </Button>
        </div>
      </div>
    </div>
  );
}
