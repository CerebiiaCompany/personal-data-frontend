"use client";

import AdministrationFormPageLayout from "@/components/administration/AdministrationFormPageLayout";
import CreateCompanyAreaForm from "@/components/administration/CreateCompanyAreaForm";
import LoadingCover from "@/components/layout/LoadingCover";
import { useCompanyAreas } from "@/hooks/useCompanyAreas";
import { useSessionStore } from "@/store/useSessionStore";
import { CompanyArea } from "@/types/companyArea.types";
import { useParams } from "next/navigation";

export default function AdministrationUpdateAreaPage() {
  const user = useSessionStore((store) => store.user);
  const areaId = useParams().areaId?.toString();

  const { data, loading, error } = useCompanyAreas<CompanyArea>({
    companyId: user?.companyUserData?.companyId,
    id: areaId,
  });

  if (loading) {
    return (
      <AdministrationFormPageLayout
        title="Actualizar área"
        description="Carga de datos del área en curso."
        backHref="/admin/administracion/areas"
        breadcrumbCurrent="Editar área"
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
        title="Actualizar área"
        description="No se pudo cargar el área."
        backHref="/admin/administracion/areas"
        breadcrumbCurrent="Editar área"
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
      title="Actualizar área"
      description={`Editando «${data.name}».`}
      backHref="/admin/administracion/areas"
      breadcrumbCurrent="Editar área"
    >
      <CreateCompanyAreaForm initialValues={data} />
    </AdministrationFormPageLayout>
  );
}
