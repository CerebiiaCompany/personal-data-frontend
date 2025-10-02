"use client";

import React, { useRef, useState } from "react";
import CustomInput from "../forms/CustomInput";
import Button from "../base/Button";
import { Icon } from "@iconify/react/dist/iconify.js";
import CustomCheckbox from "../forms/CustomCheckbox";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { hideDialog } from "@/utils/dialogs.utils";
import { CompanyAreaUser } from "@/types/companyArea.types";
import { useCompanyAreaUsers } from "@/hooks/useCompanyAreaUsers";
import { useSessionStore } from "@/store/useSessionStore";
import LoadingCover from "../layout/LoadingCover";

interface Props {
  companyAreaId?: string;
  companyAreaName?: string;
}

const CompanyAreaUsersModal = ({ companyAreaId, companyAreaName }: Props) => {
  const user = useSessionStore((store) => store.user);
  const { data, loading, error } = useCompanyAreaUsers({
    companyId: user?.companyUserData?.companyId,
    areaId: companyAreaId,
  });
  const id = HTML_IDS_DATA.companyAreaUsersModal;

  function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if ((e.target as HTMLElement).id === id) {
      hideDialog(id);
    }
  }

  return (
    /* Wrapper */
    <div
      onClick={handleClick}
      id={id}
      className="dialog-wrapper fixed hidden w-full top-0 left-0 h-full z-20 justify-center items-center bg-stone-900/50"
    >
      {/* Modal */}
      <div className="w-full animate-appear max-w-4xl rounded-xl overflow-hidden bg-white flex flex-col max-h-3/4 gap-4">
        <header className="border-b justify-between border-b-disabled flex items-center p-4">
          <span />
          <h3 className="font-bold text-xl">
            {companyAreaName ? `Usuarios de ${companyAreaName}` : "Usuarios"}
          </h3>

          <button
            onClick={() => hideDialog(id)}
            className="w-fit p-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <Icon icon={"tabler:x"} className="text-2xl" />
          </button>
        </header>
        <div className="flex-1 px-4 py-3 flex flex-col gap-4 h-full overflow-y-auto">
          {/* <header className="">
            <CustomInput placeholder="Buscar..." />
          </header> */}

          {/* Modal body */}
          <div className="flex-1 overflow-y-auto pr-1 w-full h-full relative min-h-20">
            {loading && <LoadingCover />}
            {data && !loading ? (
              data.length ? (
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
                        Documento
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item._id} className="align-middle text-center">
                        <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis rounded-l-xl">
                          {item.name} {item.lastName}
                        </td>
                        <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                          {item.companyUserData?.personalEmail}
                        </td>
                        <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                          {item.companyUserData?.phone}
                        </td>
                        <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis rounded-r-xl">
                          {item.companyUserData?.docType}{" "}
                          {item.companyUserData?.docNumber}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center">
                  Esta área de la empresa no tiene usuarios
                </p>
              )
            ) : null}
            {error && <p>Error: {error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAreaUsersModal;
