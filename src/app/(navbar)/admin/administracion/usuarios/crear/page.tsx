"use client";

import AdministrationFormPageLayout from "@/components/administration/AdministrationFormPageLayout";
import CreateCompanyUserForm from "@/components/administration/CreateCompanyUserForm";

export default function AdministrationCreateUserPage() {
  return (
    <AdministrationFormPageLayout
      title="Crear nuevo usuario"
      description="Completa los datos del colaborador, su área y el acceso a la plataforma."
      backHref="/admin/administracion/usuarios"
      breadcrumbCurrent="Crear usuario"
    >
      <CreateCompanyUserForm />
    </AdministrationFormPageLayout>
  );
}
