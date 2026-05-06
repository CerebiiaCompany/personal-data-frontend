"use client";

import AdministrationFormPageLayout from "@/components/administration/AdministrationFormPageLayout";
import CreateCompanyRoleForm from "@/components/administration/CreateCompanyRoleForm";
import { useSessionStore } from "@/store/useSessionStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdministrationCreateRolePage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "COMPANY_ADMIN" && user.role !== "SUPERADMIN") {
      router.push("/sin-acceso");
    }
  }, [user, router]);

  return (
    <AdministrationFormPageLayout
      title="Crear nuevo rol"
      description="Define el cargo, la descripción y los permisos que tendrán los usuarios asignados a este rol."
      backHref="/admin/administracion/roles"
      breadcrumbCurrent="Crear rol"
    >
      <CreateCompanyRoleForm />
    </AdministrationFormPageLayout>
  );
}
