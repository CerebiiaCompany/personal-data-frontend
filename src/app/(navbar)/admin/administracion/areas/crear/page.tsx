"use client";

import AdministrationFormPageLayout from "@/components/administration/AdministrationFormPageLayout";
import AreaHierarchyGate from "@/components/administration/AreaHierarchyGate";
import CreateCompanyAreaForm from "@/components/administration/CreateCompanyAreaForm";

export default function AdministrationCreateAreaPage() {
  return (
    <AreaHierarchyGate>
      <AdministrationFormPageLayout
        title="Crear nueva área"
        description="Registra la ubicación y, si aplica, asocia usuarios y etiquetas al crear el área."
        backHref="/admin/administracion/areas"
        breadcrumbCurrent="Crear área"
      >
        <CreateCompanyAreaForm />
      </AdministrationFormPageLayout>
    </AreaHierarchyGate>
  );
}
