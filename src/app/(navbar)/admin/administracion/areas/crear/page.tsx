"use client";

import AdministrationFormPageLayout from "@/components/administration/AdministrationFormPageLayout";
import CreateCompanyAreaForm from "@/components/administration/CreateCompanyAreaForm";

export default function AdministrationCreateAreaPage() {
  return (
    <AdministrationFormPageLayout
      title="Crear nueva área"
      description="Registra la ubicación y, si aplica, asocia usuarios y etiquetas al crear el área."
      backHref="/admin/administracion/areas"
      breadcrumbCurrent="Crear área"
    >
      <CreateCompanyAreaForm />
    </AdministrationFormPageLayout>
  );
}
