"use client";

import AdministrationFormPageLayout from "@/components/administration/AdministrationFormPageLayout";
import CreateCompanyUserForm from "@/components/administration/CreateCompanyUserForm";
import LoadingCover from "@/components/layout/LoadingCover";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { SessionUser } from "@/types/user.types";
import { useParams } from "next/navigation";

export default function AdministrationUpdateUserPage() {
  const companyId = useActiveCompanyId();
  const userId = useParams().userId?.toString();

  const { data, loading, error } = useCompanyUsers<SessionUser>({
    companyId: companyId,
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
          name: data.name,
          lastName: data.lastName,
          username: data.username,
          role: data.role,
          companyUserData: {
            position: data.companyUserData?.position ?? "",
            phone: data.companyUserData?.phone ?? "",
            personalEmail: data.companyUserData?.personalEmail ?? "",
            companyAreaId: data.companyUserData?.companyArea?._id,
            companyRoleId: data.companyUserData?.companyRole?._id,
            note: data.companyUserData?.note,
            docNumber: data.companyUserData?.docNumber ?? 0,
            docType: data.companyUserData?.docType ?? "CC",
          },
        }}
        userId={userId}
      />
    </AdministrationFormPageLayout>
  );
}
