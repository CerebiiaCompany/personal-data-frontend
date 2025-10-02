"use client";

import AdministrationPageSelector from "@/components/administration/AdministrationPageSelector";
import CompanyUsersTable from "@/components/administration/CompanyUsersTable";
import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";

export default function AdministrationUsersPage() {
  const user = useSessionStore((store) => store.user);
  const { data, loading, error, refresh } = useCompanyUsers({
    companyId: user?.companyUserData?.companyId,
  });

  return (
    <div className="w-full p-4 rounded-md border border-disabled">
      <header className="w-full flex gap-2 justify-between items-center">
        <h4 className="font-semibold text-xl text-primary-900">Usuarios</h4>
        <div className="flex gap-2">
          <Button
            href="/admin/administracion/usuarios/crear"
            endContent={
              <Icon icon={"heroicons-outline:user-add"} className="text-xl" />
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
