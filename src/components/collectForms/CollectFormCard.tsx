import { CollectForm } from "@/types/collectForm.types";
import { formatDateToString } from "@/utils/date.utils";
import React from "react";
import Button from "../base/Button";
import { copyToClipboard } from "@/utils/clipboard.utils";
import { Icon } from "@iconify/react/dist/iconify.js";

interface Props {
  data: CollectForm;
  deleteHandler: (id: string) => void;
}

const CollectFormCard = ({ data, deleteHandler }: Props) => {
  let formUrl = `${window.location.origin}/formularios/${data._id}`;

  return (
    <div className="bg-primary-700 overflow-hidden rounded-lg relative after:absolute after:top-2 after:rounded-lg after:left-0 after:w-full after:h-full after:bg-white border border-disabled aspect-[4.5/5] after:z-0 shadow-[5px_5px_12px] shadow-primary-shadows">
      <div className="relative z-1 w-full h-full flex flex-col items-start p-5 gap-4">
        <header className="w-full flex flex-col gap-1.5">
          <h4 className="text-2xl leading-tight text-center text-primary-700 font-semibold">
            {data.name}
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
              {Object.keys(data.marketingChannels)
                .filter(
                  (key) =>
                    data.marketingChannels[
                      key as keyof typeof data.marketingChannels
                    ]
                )
                .join(", ")}
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
          <div className="text-primary-700">
            <h6 className="text-left font-bold leading-tight">Origen:</h6>
            <p className="text-left leading-tight">
              {data.isImported ? "Importado" : "Creado en la plataforma"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end w-full gap-2">
          <Button
            href={`/admin/clasificacion/${data._id}`}
            className="flex-1 w-full text-sm!"
          >
            Ver reporte
          </Button>

          <Button
            hierarchy="secondary"
            onClick={() => copyToClipboard(formUrl, "Enlace copiado")}
          >
            <Icon icon={"tabler:link"} className="text-xl" />
          </Button>
          <Button hierarchy="secondary" href={`/admin/recoleccion/${data._id}`}>
            <Icon icon={"material-symbols:edit-outline"} className="text-xl" />
          </Button>
          <Button
            className="bg-red-400/20 border-red-400"
            onClick={(_) => deleteHandler(data._id)}
          >
            <Icon icon={"bx:trash"} className="text-xl text-red-400" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CollectFormCard;
