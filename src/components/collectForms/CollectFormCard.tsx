import { CollectForm } from "@/types/collectForm.types";
import { formatDateToString } from "@/utils/date.utils";
import React from "react";
import Button from "../base/Button";
import { copyToClipboard } from "@/utils/clipboard.utils";

interface Props {
  data: CollectForm;
}

const CollectFormCard = ({ data }: Props) => {
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
        </div>

        {/* Actions */}
        <div className="flex items-center w-full gap-2">
          <Button className="flex-1" href={`/admin/recoleccion/${data._id}`}>
            Ver detalle
          </Button>
          <Button
            hierarchy="secondary"
            className="flex-1"
            onClick={() => copyToClipboard(formUrl)}
          >
            Copiar link
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CollectFormCard;
