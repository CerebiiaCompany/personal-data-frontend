import { CollectForm } from "@/types/collectForm.types";
import { formatDateToString } from "@/utils/date.utils";
import React, { useMemo, useCallback } from "react";
import { copyToClipboard } from "@/utils/clipboard.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "@/components/base/Button";
import { Company } from "@/types/company.types";

interface Props {
  data: Company;
  deleteHandler: (id: string) => void;
}

const CompanyCard = ({ data, deleteHandler }: Props) => {
  const formattedDate = useMemo(
    () =>
      formatDateToString({
        date: data.createdAt,
        format: "DD/MM/YYYY",
      }),
    [data.createdAt]
  );

  return (
    <div className="bg-primary-700 overflow-hidden rounded-lg relative after:absolute after:top-2 after:rounded-lg after:left-0 after:w-full after:h-full after:bg-white border border-disabled aspect-square after:z-0 shadow-[5px_5px_12px] shadow-primary-shadows">
      <div className="relative z-1 w-full h-full flex flex-col items-start p-5 gap-4">
        <header className="w-full flex flex-col gap-1.5">
          <h4 className="text-2xl leading-tight text-center text-primary-700 font-semibold">
            {data.name}
          </h4>
          <span className="inline-block w-full h-[1.5px] bg-disabled" />
        </header>

        {/* Form data */}
        <div className="flex flex-col items-start text-left gap-3 flex-1 justify-end w-full">
          <p className="w-full text-ellipsis">
            Creada:{" "}
            <b>
              {formatDateToString({
                date: data.createdAt,
                format: "DD/MM/YYYY",
              })}
            </b>
          </p>
          <p className="w-full text-ellipsis">
            NIT: <b>{data.nit}</b>
          </p>

          <p className="w-full text-ellipsis">
            Correo: <b>{data.email}</b>
          </p>
          <p className="w-full text-ellipsis">
            Teléfono: <b>{data.phone}</b>
          </p>
          <p className="w-full text-ellipsis">
            Plan Actual: <b>{data.plan?.name}</b>
          </p>
        </div>

        {/* Actions */}
        {/* <div className="flex items-center justify-end w-full gap-2">
          <Button
            href={`/admin/clasificacion/${data._id}`}
            className="flex-1 w-full text-sm!"
          >
            Cambiar plan
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default React.memo(CompanyCard);
