import Button from "@/components/base/Button";
import { FORMS_MOCK_DATA } from "@/mock/formMock";
import { formatDateToString } from "@/utils/date.utils";
import { Icon } from "@iconify/react";

export default function Home() {
  return (
    <div className="flex flex-col">
      <header className="w-full flex flex-col gap-2">
        <nav className="w-full flex gap-2 justify-center px-3 py-6 items-stretch">
          <label className="flex max-w-4xl items-center rounded-lg gap-2 text-stone-600 border border-disabled flex-1 relative px-3 h-fit">
            <Icon icon={"tabler:search"} />
            <input type="text" placeholder="Buscar" className="w-full py-1.5" />
          </label>

          <div>
            <button className="relative h-full rounded-lg hover:bg-stone-200 transition-colors aspect-square grid place-content-center">
              <Icon
                icon={"tabler:bell"}
                className="text-2xl text-primary-900"
              />
              <span className="absolute inline-block top-1 right-1 bg-primary-500 rounded-full w-4 h-4"></span>
            </button>
          </div>
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
        <div className="w-fill grid grid-cols-[repeat(auto-fit,_minmax(150px,_320px))] gap-8 justify-between">
          {FORMS_MOCK_DATA.map((data) => (
            <div
              key={data.id}
              className="bg-primary-700 overflow-hidden rounded-lg relative after:absolute after:top-2 after:rounded-lg after:left-0 after:w-full after:h-full after:bg-white border border-disabled aspect-[4.5/5] after:z-0 shadow-[5px_5px_12px] shadow-primary-shadows"
            >
              <div className="relative z-1 w-full h-full flex flex-col items-start p-5 gap-4">
                <header className="w-full flex flex-col gap-1.5">
                  <h4 className="text-2xl leading-tight text-center text-primary-700 font-semibold">
                    {data.title}
                  </h4>
                  <span className="inline-block w-full h-[1.5px] bg-disabled" />
                </header>

                {/* Form data */}
                <div className="flex flex-col items-start text-left gap-3 flex-1 justify-end">
                  <div className="text-primary-700">
                    <h6 className="text-left font-bold leading-tight">
                      Ruta de envío:
                    </h6>
                    <p className="text-left leading-tight">
                      {data.marketingChannels.join(", ")}
                    </p>
                  </div>
                  <div className="text-primary-700">
                    <h6 className="text-left font-bold leading-tight">
                      Fecha de creación:
                    </h6>
                    <p className="text-left leading-tight">
                      {formatDateToString({
                        date: data.createdAt,
                        format: "DD/MM/YYYY",
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center w-full gap-2">
                  <Button className="flex-1">Ver detalle</Button>
                  <Button hierarchy="secondary" className="flex-1">
                    Copiar link
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
