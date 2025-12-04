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
    <div className="w-full p-3 sm:p-4 md:p-5 rounded-md border border-disabled">
      <header className="w-full flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-between sm:items-center">
        <h4 className="font-semibold text-lg sm:text-xl text-primary-900 text-center sm:text-left break-words">{data?.name || "..."}</h4>
        <div className="flex gap-2 justify-center sm:justify-end">
          <Button
            href="/administracion/editar"
            className="w-full sm:w-auto text-sm sm:text-base"
            endContent={
              <Icon
                icon={"material-symbols:edit-outline"}
                className="text-lg sm:text-xl"
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
