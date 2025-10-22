"use client";

import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import CollectFormsList from "@/components/collectForms/CollectFormsList";
import { useCollectForms } from "@/hooks/useCollectForms";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useSessionStore } from "@/store/useSessionStore";
import { useEffect, useState } from "react";

export default function CollectPage() {
  const user = useSessionStore((store) => store.user);
  const { debouncedValue, setSearch, search } = useDebouncedSearch();
  const {
    data: collectForms,
    loading,
    error,
    refresh,
  } = useCollectForms({
    companyId: user?.companyUserData?.companyId,
    search: debouncedValue,
  });

  useEffect(() => {
    console.log("Search query: ", search);
  }, [search]);

  return (
    <div className="flex flex-col h-full">
      <SectionHeader search={search} onSearchChange={setSearch} />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 flex-1">
        <header className="w-full flex flex-col gap-2 items-start">
          <div className="w-full justify-between flex items-center">
            <Button hierarchy="secondary" href="/admin/plantillas">
              Plantillas Legales
            </Button>
            <Button href="/admin/recoleccion/crear-formulario">
              Crear formulario
            </Button>
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
