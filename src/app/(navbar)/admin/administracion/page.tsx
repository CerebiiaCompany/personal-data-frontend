"use client";

import AdministrationPageSelector from "@/components/administration/AdministrationPageSelector";
import CompanyUsersTable from "@/components/administration/CompanyUsersTable";
import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useOwnCompany } from "@/hooks/useOwnCompany";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";

export default function AdministrationPage() {
  const user = useSessionStore((store) => store.user);
  const { data, loading, error } = useOwnCompany();

  return (
    <div className="w-full p-4 rounded-md border border-disabled">
      <header className="w-full flex gap-2 justify-between items-center">
        <h4 className="font-semibold text-xl text-primary-900">{data?.name}</h4>
        <div className="flex gap-2">
          <Button
            href="/administracion/editar"
            endContent={
              <Icon
                icon={"material-symbols:edit-outline"}
                className="text-xl"
              />
            }
          >
            Editar datos
          </Button>
        </div>
      </header>
    </div>
  );
}
