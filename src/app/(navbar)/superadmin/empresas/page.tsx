"use client";

import Button from "@/components/base/Button";
import Pagination from "@/components/base/Pagination";
import SectionHeader from "@/components/base/SectionHeader";
import CompaniesList from "@/components/superadmin/companies/CompaniesList";
import { useCompanies } from "@/hooks/superadmin/useCompanies";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";

const PAGE_SIZE = 12;

export default function CompaniesPage() {
  const user = useSessionStore((store) => store.user);
  const { debouncedValue, setSearch, search } = useDebouncedSearch();
  const [page, setPage] = useState(1);

  // Al cambiar la búsqueda, volvemos a la primera página para no quedar en
  // una página inexistente del nuevo conjunto de resultados.
  useEffect(() => {
    setPage(1);
  }, [debouncedValue]);

  const {
    data: companies,
    loading,
    error,
    meta,
    refresh,
  } = useCompanies({
    companyId: user?.companyUserData?.companyId,
    search: debouncedValue,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalCount = meta?.totalCount;

  return (
    <div className="flex flex-col h-full">
      <SectionHeader search={search} onSearchChange={setSearch} />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 flex-1">
        <header className="flex w-full flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-primary-900">
              <Icon icon="tabler:building" className="text-primary-500" />
              Empresas
            </h1>
            <p className="text-sm text-slate-500">
              {typeof totalCount === "number"
                ? `${totalCount} ${
                    totalCount === 1
                      ? "empresa registrada"
                      : "empresas registradas"
                  }`
                : "Gestiona las empresas de la plataforma"}
            </p>
          </div>
          <Button
            href="/superadmin/empresas/crear"
            startContent={<Icon icon="tabler:plus" className="text-lg" />}
          >
            Crear empresa
          </Button>
        </header>

        {/* Forms grid */}
        <CompaniesList
          refresh={refresh}
          items={companies}
          loading={loading}
          error={error}
        />

        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </div>
  );
}
