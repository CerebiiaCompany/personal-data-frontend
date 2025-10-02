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
        <table className="w-full table-fixed border-separate border-spacing-y-2">
          <thead>
            <tr>
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
                País
              </th>
              <th
                scope="col"
                className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
              >
                Departamento
              </th>
              <th
                scope="col"
                className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
              >
                Ciudad
              </th>
              <th
                scope="col"
                className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
              >
                Dirección
              </th>
              <th
                scope="col"
                className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
              >
                Cantidad de Usuarios
              </th>
              <th
                scope="col"
                className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
              >
                Ver Usuarios
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
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis rounded-l-xl">
                  {item.name}
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                  {getCountryData(item.country).name}
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                  {item.state}
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                  {item.city}
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                  {item.address}
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                  {item.usersCount}
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                  <div className="flex items-center justify-center gap-1.5 h-full">
                    <Button
                      hierarchy="tertiary"
                      disabled={item.usersCount < 1}
                      onClick={() =>
                        showAreaUsers({ id: item._id, name: item.name })
                      }
                      className="h-full rounded-lg hover:bg-primary-900/10 transition-colors p-1.5! aspect-square"
                    >
                      <Icon icon="tabler:eye" className="text-2xl" />
                    </Button>
                  </div>
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis rounded-r-xl">
                  <div className="flex items-center justify-center gap-1.5 h-full">
                    <Link
                      href={`/admin/administracion/areas/${item._id}`}
                      className="h-full rounded-lg hover:bg-primary-900/10 transition-colors p-1.5 aspect-square"
                    >
                      <Icon
                        icon="material-symbols:edit-outline"
                        className="text-2xl"
                      />
                    </Link>
                    <button
                      className="h-full rounded-lg hover:bg-red-400/10 transition-colors p-1.5 aspect-square"
                      onClick={(_) => deleteArea(item._id)}
                    >
                      <Icon icon="bx:trash" className="text-2xl text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default CompanyAreasTable;
