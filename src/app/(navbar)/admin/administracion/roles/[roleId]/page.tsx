"use client";

import AdministrationFormPageLayout from "@/components/administration/AdministrationFormPageLayout";
import CreateCompanyRoleForm from "@/components/administration/CreateCompanyRoleForm";
import LoadingCover from "@/components/layout/LoadingCover";
import { useCompanyRoles } from "@/hooks/useCompanyRoles";
import { useSessionStore } from "@/store/useSessionStore";
import { CompanyRole } from "@/types/companyRole.types";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdministrationUpdateRolePage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();
  const roleId = useParams().roleId?.toString();

  useEffect(() => {
    if (user && user.role !== "COMPANY_ADMIN" && user.role !== "SUPERADMIN") {
      router.push("/sin-acceso");
    }
  }, [user, router]);

  const { data, loading, error } = useCompanyRoles<CompanyRole>({
    companyId: user?.companyUserData?.companyId,
    id: roleId,
  });

  if (loading) {
    return (
      <AdministrationFormPageLayout
        title="Actualizar rol"
        description="Carga de permisos y datos del rol."
        backHref="/admin/administracion/roles"
        breadcrumbCurrent="Editar rol"
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
        title="Actualizar rol"
        description="No se pudo cargar el rol."
        backHref="/admin/administracion/roles"
        breadcrumbCurrent="Editar rol"
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
      title="Actualizar rol"
      description={`Editando el rol «${data.position}».`}
      backHref="/admin/administracion/roles"
      breadcrumbCurrent="Editar rol"
    >
      <CreateCompanyRoleForm initialValues={data} />
    </AdministrationFormPageLayout>
  );
}
