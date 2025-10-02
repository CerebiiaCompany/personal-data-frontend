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
    <div className="w-full p-4 rounded-md border border-disabled">
      <header className="w-full flex gap-2 justify-between items-center">
        <h4 className="font-semibold text-xl text-primary-900">Áreas</h4>
        <div className="flex gap-2">
          <Button
            href="/admin/administracion/areas/crear"
            endContent={<Icon icon={"bi:building-add"} className="text-xl" />}
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
