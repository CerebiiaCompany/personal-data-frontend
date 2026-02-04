"use client";

import AdministrationPageSelector from "@/components/administration/AdministrationPageSelector";
import CompanyUsersTable from "@/components/administration/CompanyUsersTable";
import CreateCompanyUserForm from "@/components/administration/CreateCompanyUserForm";
import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import LoadingCover from "@/components/layout/LoadingCover";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useSessionStore } from "@/store/useSessionStore";
import { SessionUser, UpdateUser } from "@/types/user.types";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdministrationUpdateUserPage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();
  const userId = useParams().userId?.toString();

  const { data, loading, error } = useCompanyUsers<SessionUser>({
    companyId: user?.companyUserData?.companyId,
    id: userId,
  });

  // ✅ Renderizar loading o error sin cambiar la estructura
  if (loading) {
    return (
      <div className="w-full p-4 rounded-md border border-disabled flex flex-col gap-10 items-center relative">
        <header className="w-full flex gap-2 justify-between items-center">
          <div className="flex gap-2">
            <Link
              href={"/admin/administracion/usuarios"}
              className="flex items-center gap-2 text-primary-900 font-medium text-sm"
            >
              <div className="w-fit bg-primary-900 rounded-md text-white p-1">
                <Icon icon={"tabler:chevron-left"} className="text-2xl" />
              </div>
              Volver
            </Link>
          </div>
          <h4 className="font-semibold text-xl text-primary-900 w-full text-center">
            Actualizar Usuario
          </h4>
        </header>
        <div className="min-h-20 relative w-full">
          <LoadingCover />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 rounded-md border border-disabled flex flex-col gap-10 items-center relative">
        <header className="w-full flex gap-2 justify-between items-center">
          <div className="flex gap-2">
            <Link
              href={"/admin/administracion/usuarios"}
              className="flex items-center gap-2 text-primary-900 font-medium text-sm"
            >
              <div className="w-fit bg-primary-900 rounded-md text-white p-1">
                <Icon icon={"tabler:chevron-left"} className="text-2xl" />
              </div>
              Volver
            </Link>
          </div>
          <h4 className="font-semibold text-xl text-primary-900 w-full text-center">
            Actualizar Usuario
          </h4>
        </header>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // ✅ Solo renderizar el formulario cuando tengamos data
  return (
    <div className="w-full p-4 rounded-md border border-disabled flex flex-col gap-10 items-center relative">
      <header className="w-full flex gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Link
            href={"/admin/administracion/usuarios"}
            className="flex items-center gap-2 text-primary-900 font-medium text-sm"
          >
            <div className="w-fit bg-primary-900 rounded-md text-white p-1">
              <Icon icon={"tabler:chevron-left"} className="text-2xl" />
            </div>
            Volver
          </Link>
        </div>
        <h4 className="font-semibold text-xl text-primary-900 w-full text-center">
          Actualizar Usuario
        </h4>
      </header>

      <CreateCompanyUserForm
        initialValues={{
          ...data,
          companyUserData: {
            ...data.companyUserData!,
            companyAreaId: data.companyUserData!.companyArea._id,
            companyRoleId: data.companyUserData!.companyRole?._id,
          },
        }}
        userId={userId}
      />
    </div>
  );
}
