import { SessionUser } from "@/types/user.types";
import React, { useState } from "react";
import LoadingCover from "../layout/LoadingCover";
import { Icon } from "@iconify/react/dist/iconify.js";
import { CompanyArea } from "@/types/companyArea.types";
import { getCountryData } from "@/utils/country.utils";
import CompanyAreaUsersModal from "./CompanyAreaUsersModal";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { showDialog } from "@/utils/dialogs.utils";
import Button from "../base/Button";
import Link from "next/link";
import { deleteCompanyArea } from "@/lib/companyArea.api";
import { useSessionStore } from "@/store/useSessionStore";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";

interface Props {
  items: CompanyArea[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const CompanyAreasTable = ({ items, loading, error, refresh }: Props) => {
  const user = useSessionStore((store) => store.user);
  const [selectedArea, setSelectedArea] = useState<{
    id?: string;
    name?: string;
  }>({});

  function showAreaUsers(area: typeof selectedArea) {
    setSelectedArea(area);
    showDialog(HTML_IDS_DATA.companyAreaUsersModal);
  }

  async function deleteArea(id: string) {
    const companyId = user?.companyUserData?.companyId;
    if (!companyId) return;
    const res = await deleteCompanyArea(companyId, id);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("Área eliminada");
    refresh();
  }

  return (
    <div className="w-full overflow-x-auto flex-1 relative min-h-20">
      <CompanyAreaUsersModal
        companyAreaName={selectedArea.name}
        companyAreaId={selectedArea.id}
      />
      {loading && <LoadingCover />}

      {items && (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] table-auto border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[120px]"
                >
                  Nombre
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[100px]"
                >
                  País
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[100px]"
                >
                  Departamento
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[100px]"
                >
                  Ciudad
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[150px]"
                >
                  Dirección
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[120px]"
                >
                  Cantidad de Usuarios
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[100px]"
                >
                  Ver Usuarios
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[100px]"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="align-middle text-center">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm rounded-l-xl whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm truncate max-w-[120px]">
                    {getCountryData(item.country).name}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm truncate max-w-[120px]">
                    {item.state}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm truncate max-w-[120px]">
                    {item.city}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm truncate max-w-[180px]">
                    {item.address}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                    {item.usersCount}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-full">
                      <Button
                        hierarchy="tertiary"
                        disabled={item.usersCount < 1}
                        onClick={() =>
                          showAreaUsers({ id: item._id, name: item.name })
                        }
                        className="h-full rounded-lg hover:bg-primary-900/10 transition-colors p-1 sm:p-1.5! aspect-square"
                      >
                        <Icon icon="tabler:eye" className="text-lg sm:text-xl" />
                      </Button>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm rounded-r-xl whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-full">
                      <Link
                        href={`/admin/administracion/areas/${item._id}`}
                        className="h-full rounded-lg hover:bg-primary-900/10 transition-colors p-1 sm:p-1.5 aspect-square"
                      >
                        <Icon
                          icon="material-symbols:edit-outline"
                          className="text-lg sm:text-xl"
                        />
                      </Link>
                      <button
                        className="h-full rounded-lg hover:bg-red-400/10 transition-colors p-1 sm:p-1.5 aspect-square"
                        onClick={(_) => deleteArea(item._id)}
                        aria-label="Eliminar área"
                      >
                        <Icon icon="bx:trash" className="text-lg sm:text-xl text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <p className="text-center text-red-500 text-sm sm:text-base">Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default CompanyAreasTable;
