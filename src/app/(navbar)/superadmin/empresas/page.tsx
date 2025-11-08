"use client";

import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import CollectFormsList from "@/components/collectForms/CollectFormsList";
import CompaniesList from "@/components/superadmin/companies/CompaniesList";
import { useCompanies } from "@/hooks/superadmin/useCompanies";
import { useCollectForms } from "@/hooks/useCollectForms";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useSessionStore } from "@/store/useSessionStore";
import { useEffect, useState } from "react";

export default function CompaniesPage() {
  const user = useSessionStore((store) => store.user);
  const { debouncedValue, setSearch, search } = useDebouncedSearch();
  const {
    data: companies,
    loading,
    error,
    refresh,
  } = useCompanies({
    companyId: user?.companyUserData?.companyId,
    search: debouncedValue,
  });

  console.log(companies);

  return (
    <div className="flex flex-col h-full">
      <SectionHeader search={search} onSearchChange={setSearch} />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 flex-1">
        <header className="w-full flex flex-col gap-2 items-start">
          <div className="w-full justify-between flex items-center">
            <Button href="/superadmin/empresas/crear">Crear empresa</Button>
          </div>
        </header>

        {/* Forms grid */}
        <CompaniesList
          refresh={refresh}
          items={companies}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
