"use client";

import AdministrationFormPageLayout from "@/components/administration/AdministrationFormPageLayout";
import CreateCompanyUserForm from "@/components/administration/CreateCompanyUserForm";
import LoadingCover from "@/components/layout/LoadingCover";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useSessionStore } from "@/store/useSessionStore";
import { SessionUser } from "@/types/user.types";
import { useParams } from "next/navigation";

export default function AdministrationUpdateUserPage() {
  const user = useSessionStore((store) => store.user);
  const userId = useParams().userId?.toString();

  const { data, loading, error } = useCompanyUsers<SessionUser>({
    companyId: user?.companyUserData?.companyId,
    id: userId,
  });

  if (loading) {
    return (
      <AdministrationFormPageLayout
        title="Actualizar usuario"
        description="Modifica los datos del colaborador y su acceso cuando sea necesario."
        backHref="/admin/administracion/usuarios"
        breadcrumbCurrent="Editar usuario"
      >
        <div className="relative min-h-[240px] overflow-hidden rounded-2xl border border-[#E8EDF7] bg-white p-8 shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
          <LoadingCover />
        </div>
      </AdministrationFormPageLayout>
    );
  }

  if (error) {
    return (
      <AdministrationFormPageLayout
        title="Actualizar usuario"
        description="No se pudo cargar la información del usuario."
        backHref="/admin/administracion/usuarios"
        breadcrumbCurrent="Editar usuario"
      >
        <div className="rounded-2xl border border-red-100 bg-red-50/80 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      </AdministrationFormPageLayout>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <AdministrationFormPageLayout
      title="Actualizar usuario"
      description={`Editando a ${data.name} ${data.lastName}.`}
      backHref="/admin/administracion/usuarios"
      breadcrumbCurrent="Editar usuario"
    >
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
    </AdministrationFormPageLayout>
  );
}
