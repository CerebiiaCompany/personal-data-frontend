"use client";

import Button from "@/components/base/Button";
import EditProfileDialog from "@/components/dialogs/EditProfileDialog";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { useSessionStore } from "@/store/useSessionStore";
import {
  parseDocTypeToString,
  parseUserRoleToString,
} from "@/types/user.types";
import { showDialog } from "@/utils/dialogs.utils";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function ProfilePage() {
  const user = useSessionStore((store) => store.user);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <h6 className="text-[18px] font-bold leading-tight tracking-tight text-[#1A2B5B] sm:text-[20px]">
        Mi Perfil
      </h6>
      <EditProfileDialog />

      {user && (
        <>
          <article className="flex items-center gap-3 rounded-2xl border border-[#E8EDF7] bg-white p-3.5">
            <div className="rounded-full bg-[#E8EEF9] p-2.5">
              <Icon
                icon={"mynaui:user-solid"}
                className="text-3xl text-[#8DA0C3]"
              />
            </div>

            <div className="flex flex-1 flex-col items-start">
              <p className="text-[16px] leading-tight font-bold text-[#0B1737] sm:text-[18px]">
                {user.name} {user.lastName}
              </p>
              <p className="mt-0.5 text-[13px] text-[#6F7F9F]">
                {parseUserRoleToString(user.role)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => showDialog(HTML_IDS_DATA.editProfileDialog)}
                hierarchy="secondary"
                className="rounded-xl! border-[#DDE6F4]! bg-white! px-4! py-2! text-[13px]! text-[#0B1737]! font-semibold!"
                startContent={
                  <Icon
                    icon={"material-symbols:edit-outline"}
                    className="text-lg"
                  />
                }
              >
                Editar perfil
              </Button>
            </div>
          </article>
          <article className="flex flex-col gap-4 rounded-2xl border border-[#E8EDF7] bg-white p-3.5 sm:p-4">
            <p className="text-[16px] leading-tight font-bold text-[#0B1737] sm:text-[18px]">
              Información Personal
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">Cargo</p>
                <p className="text-[15px] font-semibold text-[#0B1737]">{user.companyUserData?.position || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">Rol</p>
                <p className="text-[15px] font-semibold text-[#0B1737]">{parseUserRoleToString(user.role)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">Nombres</p>
                <p className="text-[15px] font-semibold text-[#0B1737]">{user.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">Apellidos</p>
                <p className="text-[15px] font-semibold text-[#0B1737]">{user.lastName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">Correo Electrónico</p>
                <p className="text-[15px] font-semibold text-[#0B1737] break-all">{user.companyUserData?.personalEmail || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">Teléfono</p>
                <p className="text-[15px] font-semibold text-[#0B1737]">{user.companyUserData?.phone || "—"}</p>
              </div>
            </div>

            {user.companyUserData && (
              <>
                <div
                  role="separator"
                  className="w-full h-[1px] bg-[#EEF2F8]"
                ></div>
                <div role="row" className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">
                      Tipo de Documento
                    </p>
                    <p className="text-[15px] font-semibold text-[#0B1737]">
                      {parseDocTypeToString(user.companyUserData.docType)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">
                      Número de Documento
                    </p>
                    <p className="text-[15px] font-semibold text-[#0B1737]">
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
