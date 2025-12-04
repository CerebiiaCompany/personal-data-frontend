"use client";

import AdministrationPageSelector from "@/components/administration/AdministrationPageSelector";
import CompanyAreasTable from "@/components/administration/CompanyAreasTable";
import CompanyUsersTable from "@/components/administration/CompanyUsersTable";
import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import { useCompanyAreas } from "@/hooks/useCompanyAreas";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";

export default function AdministrationAreasPage() {
  const user = useSessionStore((store) => store.user);
  const { data, loading, error, refresh } = useCompanyAreas({
    companyId: user?.companyUserData?.companyId,
  });

  return (
    <div className="w-full p-3 sm:p-4 md:p-5 rounded-md border border-disabled">
      <header className="w-full flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-between sm:items-center">
        <h4 className="font-semibold text-lg sm:text-xl text-primary-900 text-center sm:text-left">Áreas</h4>
        <div className="flex gap-2 justify-center sm:justify-end">
          <Button
            href="/admin/administracion/areas/crear"
            className="w-full sm:w-auto text-sm sm:text-base"
            endContent={<Icon icon={"bi:building-add"} className="text-lg sm:text-xl" />}
          >
            Crear Área
          </Button>
          {/* <Button>
            <Icon icon={"mdi:filter-outline"} className="text-2xl" />
          </Button> */}
        </div>
      </header>

      <CompanyAreasTable
        items={data}
        loading={loading}
        error={error}
        refresh={refresh}
      />
    </div>
  );
}
