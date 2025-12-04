import React from "react";
import LoadingCover from "../layout/LoadingCover";
import { Icon } from "@iconify/react/dist/iconify.js";
import { CompanyRole } from "@/types/companyRole.types";
import { useSessionStore } from "@/store/useSessionStore";
import { deleteCompanyRole } from "@/lib/companyRole.api";
import { parseApiError } from "@/utils/parseApiError";
import { toast } from "sonner";
import Link from "next/link";

interface Props {
  items: CompanyRole[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const CompanyRolesTable = ({ items, loading, error, refresh }: Props) => {
  const user = useSessionStore((store) => store.user);

  async function deleteRole(id: string) {
    const companyId = user?.companyUserData?.companyId;
    if (!companyId) return;
    const res = await deleteCompanyRole(companyId, id);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("Rol eliminada");
    refresh();
  }

  return (
    <div className="w-full overflow-x-auto flex-1 relative min-h-20">
      {loading && <LoadingCover />}

      {items && (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[600px] table-auto border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[120px]"
                >
                  Cargo
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[150px]"
                >
                  Descripción
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[200px]"
                >
                  Permisos
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
                    {item.position}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm truncate max-w-[180px]">
                    {item.description}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm truncate max-w-[220px]">
                    {JSON.stringify(item.permissions)}
                  </td>

                  <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm rounded-r-xl whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-full">
                      <Link
                        href={`/admin/administracion/roles/${item._id}`}
                        className="h-full rounded-lg hover:bg-primary-900/10 transition-colors p-1 sm:p-1.5 aspect-square"
                      >
                        <Icon
                          icon="material-symbols:edit-outline"
                          className="text-lg sm:text-xl"
                        />
                      </Link>
                      <button
                        onClick={(_) => deleteRole(item._id)}
                        className="h-full rounded-lg hover:bg-red-400/10 transition-colors p-1 sm:p-1.5 aspect-square"
                        aria-label="Eliminar rol"
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

export default CompanyRolesTable;
