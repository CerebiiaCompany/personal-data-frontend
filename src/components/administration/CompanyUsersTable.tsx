import { SessionUser } from "@/types/user.types";
import React from "react";
import LoadingCover from "../layout/LoadingCover";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { deleteCompanyUser } from "@/lib/user.api";
import { useSessionStore } from "@/store/useSessionStore";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";

interface Props {
  items: SessionUser[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const CompanyUsersTable = ({ items, loading, error, refresh }: Props) => {
  console.log(loading);
  const user = useSessionStore((store) => store.user);

  async function deleteUser(userId: string) {
    if (!user?.companyUserData?.companyId) return;

    const res = await deleteCompanyUser(
      user?.companyUserData?.companyId,
      userId
    );

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("Usuario eliminado");
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
                Nombre
              </th>
              <th
                scope="col"
                className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
              >
                Área
              </th>
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
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {[...items].map((item) => (
              <tr key={item._id} className="align-middle text-center">
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis rounded-l-xl">
                  {item.name} {item.lastName}
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                  {item.companyUserData?.companyArea
                    ? item.companyUserData?.companyArea.name
                    : "Ninguna"}
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                  {item.companyUserData?.companyRole
                    ? item.companyUserData?.companyRole.position
                    : "Ninguno"}
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                  {item.companyUserData?.personalEmail}
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                  {item.companyUserData?.phone}
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis rounded-r-xl">
                  <div className="flex items-center justify-center gap-1.5 h-full">
                    {item._id !== user?._id ? (
                      <>
                        <Link
                          href={`/admin/administracion/usuarios/${item._id}`}
                          className="h-full rounded-lg hover:bg-primary-900/10 transition-colors p-1.5 aspect-square"
                        >
                          <Icon
                            icon="material-symbols:edit-outline"
                            className="text-2xl"
                          />
                        </Link>
                        <button
                          onClick={() => deleteUser(item._id)}
                          className="h-full rounded-lg hover:bg-red-400/10 transition-colors p-1.5 aspect-square"
                        >
                          <Icon
                            icon="bx:trash"
                            className="text-2xl text-red-400"
                          />
                        </button>
                      </>
                    ) : (
                      <p>(Tú)</p>
                    )}
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

export default CompanyUsersTable;
