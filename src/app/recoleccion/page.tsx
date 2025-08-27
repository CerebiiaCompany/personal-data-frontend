import Button from "@/components/base/Button";
import { Icon } from "@iconify/react";

export default function Home() {
  return (
    <div className="flex flex-col">
      <header className="w-full flex flex-col gap-2">
        <nav className="w-full flex gap-2 justify-center items-center px-3 py-6">
          <label className="flex max-w-4xl items-center rounded-lg gap-3 text-stone-600 border border-disabled flex-1 relative pl-3 py-3 h-full">
            <Icon icon={"tabler:search"} />
            <input
              type="text"
              placeholder="Buscar"
              className="w-full h-full absolute px-6"
            />
          </label>

          <button className="relative p-2 rounded-lg hover:bg-stone-200 transition-colors h-full aspect-square grid place-content-center">
            <Icon icon={"tabler:bell"} className="text-2xl text-primary-900" />
            <span className="absolute inline-block top-1 right-1 bg-primary-500 rounded-full w-4 h-4"></span>
          </button>
        </nav>

        <nav className="w-full flex flex-col items-start gap-1">
          <h4 className="font-normal text-xl text-primary-900 px-5">
            Recolección
          </h4>
          <span className="inline-block w-full h-1.5 bg-primary-50" />
        </nav>
      </header>

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6">
        <header className="w-full flex flex-col gap-2 items-start">
          <h4 className="font-medium pl-2">Formularios</h4>
          <div className="w-full justify-between flex items-center">
            <Button>Plantillas Ley 1581</Button>
            <Button>Crear formulario</Button>
          </div>
        </header>

        {/* Forms grid */}
        <div className="w-fill grid grid-cols-[repeat(auto-fit,_minmax(200px,_280px))]">
          <div className="bg-primary-900 overflow-hidden rounded-lg relative after:absolute after:top-2 after:rounded-lg after:left-0 after:w-full after:h-full after:bg-white border border-disabled aspect-[4.5/5]">
            <header className="flex flex-col items-center">
              <h4>Formulario #1</h4>
            </header>
          </div>
        </div>
      </div>
    </div>
  );
}
