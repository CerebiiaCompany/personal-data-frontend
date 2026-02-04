"use client";

import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import CollectFormsList from "@/components/collectForms/CollectFormsList";
import CheckPermission from "@/components/checkers/CheckPermission";
import { useCollectForms } from "@/hooks/useCollectForms";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { useSessionStore } from "@/store/useSessionStore";
import { useEffect, useState } from "react";

export default function CollectPage() {
  const user = useSessionStore((store) => store.user);
  const { shouldFetch } = usePermissionCheck();
  const { debouncedValue, setSearch, search } = useDebouncedSearch();
  const {
    data: collectForms,
    loading,
    error,
    refresh,
  } = useCollectForms({
    companyId: user?.companyUserData?.companyId,
    search: debouncedValue,
    enabled: shouldFetch('collect.view'),
  });

  useEffect(() => {
    console.log("Search query: ", search);
  }, [search]);

  return (
    <div className="flex flex-col h-full">
      <SectionHeader search={search} onSearchChange={setSearch} />

      {/* Content */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 flex flex-col gap-4 sm:gap-5 md:gap-6 flex-1">
        <header className="w-full flex flex-col gap-3 sm:gap-4 items-start">
          <div className="w-full justify-between flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <CheckPermission group="templates" permission="view">
              <Button hierarchy="secondary" href="/admin/plantillas" className="w-full sm:w-auto text-sm sm:text-base">
                Plantillas Legales
              </Button>
            </CheckPermission>
            <CheckPermission group="collect" permission="create">
              <Button href="/admin/recoleccion/crear-formulario" className="w-full sm:w-auto text-sm sm:text-base">
                Crear formulario
              </Button>
            </CheckPermission>
          </div>
        </header>

        {/* Forms grid */}
        <CollectFormsList
          refresh={refresh}
          items={collectForms}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
