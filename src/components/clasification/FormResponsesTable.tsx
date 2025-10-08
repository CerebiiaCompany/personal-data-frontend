import {
  CollectFormResponse,
  parseUserGenderToString,
} from "@/types/collectFormResponse.types";
import React from "react";
import LoadingCover from "../layout/LoadingCover";
import { Icon } from "@iconify/react/dist/iconify.js";
import { deleteCollectFormResponse } from "@/lib/collectFormResponse.api";
import { useSessionStore } from "@/store/useSessionStore";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";
import { parseDocTypeToString } from "@/types/user.types";
import clsx from "clsx";

interface Props {
  items: CollectFormResponse[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const FormResponsesTable = ({ items, loading, error, refresh }: Props) => {
  const user = useSessionStore((store) => store.user);
  const formId = useParams().formId!.toString();

  async function deleteResponse(id: string) {
    const companyId = user?.companyUserData?.companyId;

    if (!companyId) return;

    const res = await deleteCollectFormResponse(companyId, formId, id);
    console.log(res);
    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("Respuesta eliminada");
    refresh();
  }

  return (
    <div className="w-full overflow-x-auto flex-1 relative">
      {loading && <LoadingCover />}

      {!loading ? (
        items?.length ? (
          <table className="w-full table-auto border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                >
                  CC
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                >
                  Nombre
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                >
                  Apellido
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                >
                  Edad
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                >
                  Sexo
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                >
                  Correo
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                >
                  Teléfono
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="align-middle text-center">
                  <td className="py-3 text-ellipsis px-4 bg-primary-50 font-medium rounded-l-xl">
                    {parseDocTypeToString(item.user.docType)}{" "}
                    {item.user.docNumber}
                  </td>
                  <td className="py-3 text-ellipsis px-4 bg-primary-50 font-medium">
                    {item.user.name}
                  </td>
                  <td className="py-3 text-ellipsis px-4 bg-primary-50 font-medium">
                    {item.user.lastName}
                  </td>
                  <td className="py-3 text-ellipsis px-4 bg-primary-50 font-medium">
                    {item.user.age}
                  </td>
                  <td className="py-3 text-ellipsis px-4 bg-primary-50 font-medium">
                    {parseUserGenderToString(item.user.gender)}
                  </td>
                  <td className="py-3 text-ellipsis px-4 bg-primary-50 font-medium">
                    {item.user.email}
                  </td>
                  <td className="py-3 text-ellipsis px-4 bg-primary-50 font-medium">
                    {item.user.phone}
                  </td>
                  <td className="py-3 text-ellipsis px-4 bg-primary-50 font-medium">
                    <div className="w-full flex justify-center">
                      <span
                        className={clsx([
                          "inline-block w-4 h-4 rounded-full",
                          item.dataProcessing ? "bg-green-400" : "bg-red-400",
                        ])}
                      />
                    </div>
                  </td>
                  <td className="py-3 text-ellipsis px-4 bg-primary-50 font-medium rounded-r-xl">
                    <div className="flex items-center justify-center gap-1.5 h-full">
                      <button
                        onClick={() => deleteResponse(item._id)}
                        className="h-full rounded-lg hover:bg-red-400/10 transition-colors p-1.5 aspect-square"
                      >
                        <Icon
                          icon="bx:trash"
                          className="text-2xl text-red-400"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center">Este formulario aún no tiene registros</p>
        )
      ) : null}

      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default FormResponsesTable;
