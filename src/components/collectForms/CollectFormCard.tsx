import { CollectForm } from "@/types/collectForm.types";
import { formatDateToString } from "@/utils/date.utils";
import React, { useMemo, useCallback } from "react";
import Button from "../base/Button";
import { copyToClipboard } from "@/utils/clipboard.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import CheckPermission from "../checkers/CheckPermission";

interface Props {
  data: CollectForm;
  deleteHandler: (id: string) => void;
}

const CollectFormCard = ({ data, deleteHandler }: Props) => {
  const formUrl = useMemo(
    () => `${window.location.origin}/formularios/${data._id}`,
    [data._id]
  );

  const channelsText = useMemo(
    () =>
      Object.keys(data.marketingChannels)
        .filter(
          (key) =>
            data.marketingChannels[
              key as keyof typeof data.marketingChannels
            ]
        )
        .join(", "),
    [data.marketingChannels]
  );

  const formattedDate = useMemo(
    () =>
      formatDateToString({
        date: data.createdAt,
        format: "DD/MM/YYYY",
      }),
    [data.createdAt]
  );

  const handleCopyLink = useCallback(() => {
    copyToClipboard(formUrl, "Enlace copiado");
  }, [formUrl]);

  const handleDelete = useCallback(() => {
    deleteHandler(data._id);
  }, [data._id, deleteHandler]);

  return (
    <div className="bg-primary-700 overflow-hidden rounded-lg relative after:absolute after:top-2 after:rounded-lg after:left-0 after:w-full after:h-full after:bg-white border border-disabled aspect-[4.5/5] sm:aspect-[4.5/5] after:z-0 shadow-[5px_5px_12px] shadow-primary-shadows">
      <div className="relative z-1 w-full h-full flex flex-col items-start p-4 sm:p-5 gap-3 sm:gap-4">
        <header className="w-full flex flex-col gap-1.5">
          <h4 className="text-lg sm:text-xl md:text-2xl leading-tight text-center text-primary-700 font-semibold">
            {data.name}
          </h4>
          <span className="inline-block w-full h-[1.5px] bg-disabled" />
        </header>

        {/* Form data */}
        <div className="flex flex-col items-start text-left gap-2 sm:gap-3 flex-1 justify-end">
          <div className="text-primary-700">
            <h6 className="text-left font-bold leading-tight text-xs sm:text-sm">
              Ruta de envío:
            </h6>
            <p className="text-left leading-tight text-xs sm:text-sm">{channelsText}</p>
          </div>
          <div className="text-primary-700">
            <h6 className="text-left font-bold leading-tight text-xs sm:text-sm">
              Fecha de creación:
            </h6>
            <p className="text-left leading-tight text-xs sm:text-sm">{formattedDate}</p>
          </div>
          <div className="text-primary-700">
            <h6 className="text-left font-bold leading-tight text-xs sm:text-sm">Origen:</h6>
            <p className="text-left leading-tight text-xs sm:text-sm">
              {data.isImported ? "Importado" : "Creado en la plataforma"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end w-full gap-1.5 sm:gap-2">
          <Button
            href={`/admin/clasificacion/${data._id}`}
            className="flex-1 w-full text-xs sm:text-sm!"
          >
            Ver reporte
          </Button>

          <Button hierarchy="secondary" onClick={handleCopyLink} className="p-2 sm:p-3">
            <Icon icon={"tabler:link"} className="text-lg sm:text-xl" />
          </Button>

          <CheckPermission group="collect" permission="edit">
            <Button hierarchy="secondary" href={`/admin/recoleccion/${data._id}`} className="p-2 sm:p-3">
              <Icon icon={"material-symbols:edit-outline"} className="text-lg sm:text-xl" />
            </Button>
          </CheckPermission>

          <CheckPermission group="collect" permission="delete">
            <Button
              className="bg-red-400/20 border-red-400 p-2 sm:p-3"
              onClick={handleDelete}
            >
              <Icon icon={"bx:trash"} className="text-lg sm:text-xl text-red-400" />
            </Button>
          </CheckPermission>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CollectFormCard);
