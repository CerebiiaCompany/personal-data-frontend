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
    <div className="w-full flex-1 relative min-h-0 flex flex-col">
      {loading && <LoadingCover />}

      {!loading ? (
        items?.length ? (
          <div className="w-full overflow-x-auto overflow-y-auto flex-1 min-h-0">
            <table className="w-full min-w-[800px] table-auto border-separate border-spacing-y-2">
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    CC
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[100px]"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[100px]"
                  >
                    Apellido
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Edad
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Sexo
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[150px]"
                  >
                    Correo
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[120px]"
                  >
                    Teléfono
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[120px]"
                  >
                    Registrado por
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[140px]"
                  >
                    Fecha y hora
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Usó OTP
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="align-middle text-center">
                    <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm rounded-l-xl whitespace-nowrap">
                      {parseDocTypeToString(item.user.docType)}{" "}
                      {item.user.docNumber}
                    </td>
                    <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm max-w-[120px] truncate">
                      {item.user.name}
                    </td>
                    <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm max-w-[120px] truncate">
                      {item.user.lastName}
                    </td>
                    <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                      {item.user.age && item.user.age >= 18 ? (
                        item.user.age
                      ) : (
                        <span className="text-stone-400" title="Información protegida para menores de edad">
                          —
                        </span>
                      )}
                    </td>
                    <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                      {parseUserGenderToString(item.user.gender)}
                    </td>
                    <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm max-w-[180px] truncate">
                      {item.user.email}
                    </td>
                    <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                      {item.user.phone}
                    </td>
                    <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm max-w-[130px] truncate">
                      {item.createdBy?.name || item.createdBy?.lastName
                        ? `${item.createdBy?.name || ""}${
                            item.createdBy?.lastName ? ` ${item.createdBy.lastName}` : ""
                          }`
                        : item.createdBy?.username || item.createdBy?.email || "—"}
                    </td>
                    <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "—"}
                    </td>
                    <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                      {item.verifiedWithOTP ? (
                        <span className="text-green-600 font-semibold">Sí</span>
                      ) : (
                        <span className="text-stone-600">No</span>
                      )}
                    </td>
                    <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm">
                      <div className="w-full flex justify-center">
                        <span
                          className={clsx([
                            "inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full",
                            item.dataProcessing ? "bg-green-400" : "bg-red-400",
                          ])}
                          title={item.dataProcessing ? "Verificado" : "No verificado"}
                        />
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm rounded-r-xl whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 h-full">
                        <button
                          onClick={() => deleteResponse(item._id)}
                          className="h-full rounded-lg hover:bg-red-400/10 transition-colors p-1 sm:p-1.5 aspect-square"
                          aria-label="Eliminar"
                        >
                          <Icon
                            icon="bx:trash"
                            className="text-lg sm:text-xl text-red-400"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <p className="text-center text-stone-500 text-sm sm:text-base">Este formulario aún no tiene registros</p>
          </div>
        )
      ) : null}

      {error && (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <p className="text-center text-red-500 text-sm sm:text-base">Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default FormResponsesTable;
