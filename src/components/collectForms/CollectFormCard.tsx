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

  const responseCount = data.totalResponses ?? 0;

  const statusLabel = "Activo";
  const statusClassName = "bg-[#E8F8EC] text-[#21A45D]";

  return (
    <div className="bg-white overflow-hidden rounded-[20px] border border-[#E3EAF7] shadow-[0_4px_14px_rgba(13,42,96,0.05)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(13,42,96,0.12)] hover:border-[#D4DEEE]">
      <div className="w-full h-full flex flex-col items-start py-4 gap-3">
        <header className="w-full flex items-start justify-between gap-3 min-h-[80px]">
          <h4 className="text-[14px] leading-[1.25] text-[#051634] font-bold uppercase line-clamp-3 break-words max-w-[82%] pl-5">
            {data.name}
          </h4>
          <span
            className={`inline-flex px-3 py-1 rounded-full text-[10px] font-semibold leading-none mr-5 ${statusClassName}`}
          >
            {statusLabel}
          </span>
        </header>

        <div className="flex flex-col items-start text-left gap-1.5 w-full text-[#2F4675] px-5">
          <div className="flex items-center gap-2 text-[13px]">
            <Icon icon="tabler:calendar-event" className="text-[15px] text-[#6F7FA4]" />
            <p>Creado el {formattedDate}</p>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <Icon icon="tabler:file-description" className="text-[15px] text-[#6F7FA4]" />
            <p className="break-words">
              {data.isImported ? "Importado" : "Creado en la plataforma"}
            </p>
          </div>
          <div className="hidden">{channelsText}</div>
        </div>

        <span className="inline-block w-full h-[1px] bg-[#E7ECF6]" />

        <div className="w-full px-5 py-3 bg-[#F0F5FF] border-y border-[#DDE6F6]">
          <p className="text-[12px] leading-none text-[#60759E]">
            <span className="text-[16px] font-bold text-[#091A3D] mr-1.5">
              {responseCount}
            </span>
            respuestas registradas
          </p>
        </div>

        <div className="flex items-center justify-start w-full gap-2 flex-shrink-0 px-5">
          <Button
            href={`/admin/clasificacion/${data._id}`}
            className="w-fit text-[12px]! px-4! py-2! bg-[#0D2B74]! border-[#0D2B74]! rounded-xl! font-semibold!"
            startContent={<Icon icon={"tabler:eye"} className="text-[15px]" />}
          >
            Ver reporte
          </Button>

          <Button
            hierarchy="secondary"
            onClick={handleCopyLink}
            className="p-2 flex-shrink-0 border-[#DEE7F3]! text-[#60729A]! rounded-xl! bg-white!"
          >
            <Icon icon={"tabler:link"} className="text-[15px]" />
          </Button>

          <CheckPermission group="collect" permission="edit">
            <Button
              hierarchy="secondary"
              href={`/admin/recoleccion/${data._id}`}
              className="p-2 flex-shrink-0 border-[#DEE7F3]! text-[#60729A]! rounded-xl! bg-white!"
            >
              <Icon icon={"material-symbols:edit-outline"} className="text-[15px]" />
            </Button>
          </CheckPermission>

          <CheckPermission group="collect" permission="delete">
            <Button
              hierarchy="secondary"
              className="p-2 flex-shrink-0 border-[#FFC9D3]! text-[#F05F74]! rounded-xl! bg-white!"
              onClick={handleDelete}
            >
              <Icon icon={"bx:trash"} className="text-[15px]" />
            </Button>
          </CheckPermission>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CollectFormCard);
