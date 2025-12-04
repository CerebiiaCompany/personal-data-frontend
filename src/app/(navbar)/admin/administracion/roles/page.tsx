"use client";

import AdministrationPageSelector from "@/components/administration/AdministrationPageSelector";
import CompanyAreasTable from "@/components/administration/CompanyAreasTable";
import CompanyRolesTable from "@/components/administration/CompanyRolesTable";
import CompanyUsersTable from "@/components/administration/CompanyUsersTable";
import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import { useCompanyAreas } from "@/hooks/useCompanyAreas";
import { useCompanyRoles } from "@/hooks/useCompanyRoles";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";

export default function AdministrationRolesPage() {
  const user = useSessionStore((store) => store.user);
  const { data, loading, error, refresh } = useCompanyRoles({
    companyId: user?.companyUserData?.companyId,
  });

  return (
    <div className="w-full p-3 sm:p-4 md:p-5 rounded-md border border-disabled">
      <header className="w-full flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-between sm:items-center">
        <h4 className="font-semibold text-lg sm:text-xl text-primary-900 text-center sm:text-left">Roles</h4>
        <div className="flex gap-2 justify-center sm:justify-end">
          <Button
            href="/admin/administracion/roles/crear"
            className="w-full sm:w-auto text-sm sm:text-base"
            endContent={
              <Icon icon={"fluent:tag-add-16-regular"} className="text-lg sm:text-xl" />
            }
          >
            Crear Rol
          </Button>
        </div>
      </header>

      <CompanyRolesTable
        refresh={refresh}
        items={data}
        loading={loading}
        error={error}
      />
    </div>
  );
}
