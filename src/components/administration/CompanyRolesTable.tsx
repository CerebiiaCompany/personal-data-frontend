import { SessionUser } from "@/types/user.types";
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
        <table className="w-full table-fixed border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th
                scope="col"
                className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
              >
                Cargo
              </th>
              <th
                scope="col"
                className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
              >
                Descripción
              </th>
              <th
                scope="col"
                className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
              >
                Permisos
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
                  {item.position}
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                  {item.description}
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                  {JSON.stringify(item.permissions)}
                </td>

                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis rounded-r-xl">
                  <div className="flex items-center justify-center gap-1.5 h-full">
                    <Link
                      href={`/admin/administracion/roles/${item._id}`}
                      className="h-full rounded-lg hover:bg-primary-900/10 transition-colors p-1.5 aspect-square"
                    >
                      <Icon
                        icon="material-symbols:edit-outline"
                        className="text-2xl"
                      />
                    </Link>
                    <button
                      onClick={(_) => deleteRole(item._id)}
                      className="h-full rounded-lg hover:bg-red-400/10 transition-colors p-1.5 aspect-square"
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

export default CompanyRolesTable;
