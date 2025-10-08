"use client";

import Button from "@/components/base/Button";
import LoadingCover from "@/components/layout/LoadingCover";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { useOwnCompanyStore } from "@/store/useOwnCompanyStore";
import { useSessionStore } from "@/store/useSessionStore";
import { parseCompanyAreaCountryToString } from "@/types/companyArea.types";
import {
  parseDocTypeToString,
  parseUserRoleToString,
} from "@/types/user.types";
import { showDialog } from "@/utils/dialogs.utils";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function ProfilePage() {
  const user = useSessionStore((store) => store.user);
  const companyStore = useOwnCompanyStore();

  return (
    <div className="flex-1 flex h-full flex-col gap-3 max-h-full overflow-y-auto">
      <h6 className="font-bold text-xl text-primary-900 mb-2">Mi Perfil</h6>

      {user && (
        <>
          <article className="border border-disabled rounded-md p-3 flex items-center gap-4">
            <div className="p-3 rounded-full bg-gray-300">
              <Icon
                icon={"mynaui:user-solid"}
                className="text-4xl text-white"
              />
            </div>

            <div className="flex flex-col flex-1 items-start">
              <p className="text-lg text-primary-900 font-bold">
                {user.name} {user.lastName}
              </p>
              <p className="text-sm text-stone-400">
                {parseUserRoleToString(user.role)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                /* onClick={(_) => setEditMode(1)} */ //? implement if we don't run out of time
                href="/perfil/editar"
                hierarchy="secondary"
                startContent={
                  <Icon
                    icon={"material-symbols:edit-outline"}
                    className="text-xl"
                  />
                }
              >
                Editar
              </Button>
            </div>
          </article>
          <article className="border border-disabled rounded-md p-3 flex flex-col gap-6">
            <p className="text-lg text-primary-900 font-bold">
              Información Personal
            </p>

            <div className="flex flex-col items-start">
              <p className="text-xs text-stone-400">Cargo</p>
              <p className="font-semibold text-sm text-primary-900">
                {user.companyUserData?.position}
              </p>
            </div>
            {/* Row */}
            <div role="row" className="flex">
              <div className="flex flex-col items-start flex-1">
                <p className="text-xs text-stone-400">Nombres</p>
                <p className="font-semibold text-sm text-primary-900">
                  {user.name}
                </p>
              </div>
              <div className="flex flex-col items-start flex-1">
                <p className="text-xs text-stone-400">Apellidos</p>
                <p className="font-semibold text-sm text-primary-900">
                  {user.lastName}
                </p>
              </div>
            </div>
            {/* Row */}
            <div role="row" className="flex">
              <div className="flex flex-col items-start flex-1">
                <p className="text-xs text-stone-400">Correo Electrónico</p>
                <p className="font-semibold text-sm text-primary-900">
                  {user.companyUserData?.personalEmail}
                </p>
              </div>
              <div className="flex flex-col items-start flex-1">
                <p className="text-xs text-stone-400">Teléfono</p>
                <p className="font-semibold text-sm text-primary-900">
                  {user.companyUserData?.phone}
                </p>
              </div>
            </div>

            {user.companyUserData && (
              <>
                <div
                  role="separator"
                  className="w-full h-[1px] bg-disabled"
                ></div>
                {/* Row */}
                <div role="row" className="flex">
                  <div className="flex flex-col items-start flex-1">
                    <p className="text-xs text-stone-400">Tipo de Documento</p>
                    <p className="font-semibold text-sm text-primary-900">
                      {parseDocTypeToString(user.companyUserData.docType)}
                    </p>
                  </div>
                  <div className="flex flex-col items-start flex-1">
                    <p className="text-xs text-stone-400">
                      Número de Documento
                    </p>
                    <p className="font-semibold text-sm text-primary-900">
                      {user.companyUserData.docNumber}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* //? Moved to /perfil/cambiar-clave */}
            {/* 
            <Button
              hierarchy="secondary"
              onClick={(_) => showDialog(HTML_IDS_DATA.updatePasswordDialog)}
              className="w-fit"
            >
              Cambiar clave
            </Button> */}
          </article>
        </>
      )}
    </div>
  );
}
