"use client";

import CompanyUsersTable from "@/components/administration/CompanyUsersTable";
import Button from "@/components/base/Button";
import SectionSearchBar from "@/components/base/SectionSearchBar";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";

export default function AdministrationUsersPage() {
  const user = useSessionStore((store) => store.user);
  const { debouncedValue, search, setSearch } = useDebouncedSearch();
  const { data, loading, error, refresh } = useCompanyUsers({
    companyId: user?.companyUserData?.companyId,
    search: debouncedValue,
  });

  return (
    <div className="w-full p-3 sm:p-4 md:p-5 rounded-md border border-disabled">
      <header className="w-full flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-between sm:items-center">
        <h4 className="font-semibold text-lg sm:text-xl text-primary-900 text-center sm:text-left">Usuarios</h4>
        <div className="flex flex-col sm:flex-row gap-2 h-full w-full sm:flex-1 sm:justify-end sm:max-w-lg">
          <SectionSearchBar search={search} onSearchChange={setSearch} />
          <Button
            href="/admin/administracion/usuarios/crear"
            className="w-full sm:w-auto text-sm sm:text-base"
            endContent={
              <Icon icon={"heroicons-outline:user-add"} className="text-lg sm:text-xl" />
            }
          >
            Crear Usuario
          </Button>
          {/* <Button>
            <Icon icon={"mdi:filter-outline"} className="text-2xl" />
          </Button> */}
        </div>
      </header>

      <CompanyUsersTable
        refresh={refresh}
        items={data}
        loading={loading}
        error={error}
      />
    </div>
  );
}
