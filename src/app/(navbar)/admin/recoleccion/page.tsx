"use client";

import Button from "@/components/base/Button";
import SectionSearchBar from "@/components/base/SectionSearchBar";
import DataOfficerCard from "@/components/administration/DataOfficerCard";
import CollectFormsList from "@/components/collectForms/CollectFormsList";
import CollectFormsFilters, {
  CollectFilter,
} from "@/components/collectForms/CollectFormsFilters";
import CheckPermission from "@/components/checkers/CheckPermission";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useCollectForms } from "@/hooks/useCollectForms";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useMemo, useState } from "react";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function CollectPage() {
  const companyId = useActiveCompanyId();
  const { shouldFetch } = usePermissionCheck();
  const { debouncedValue, setSearch, search } = useDebouncedSearch();
  const [activeFilter, setActiveFilter] = useState<CollectFilter>("ALL");
  const {
    data: collectForms,
    loading,
    error,
    refresh,
  } = useCollectForms({
    companyId,
    search: debouncedValue,
    enabled: shouldFetch("collect.view"),
  });

  const filteredForms = useMemo(() => {
    if (!collectForms) return null;
    let items = collectForms;

    if (activeFilter === "TEMPLATE") {
      items = items.filter((item) => item.isImported);
    } else if (activeFilter === "CUSTOM") {
      items = items.filter((item) => !item.isImported);
    }

    const normalizedQuery = normalizeText(search);
    if (!normalizedQuery) return items;

    return items.filter((item) =>
      normalizeText(item.name || "").includes(normalizedQuery)
    );
  }, [collectForms, activeFilter, search]);

  return (
    <div className="flex h-full flex-col bg-[#F8FAFC]">
      <div className="px-5 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <section className="rounded-2xl border border-[#E8EDF7] bg-white px-5 py-4 shadow-[0_2px_10px_rgba(15,35,70,0.03)] md:px-6 md:py-5">
          <SectionSearchBar search={search} onSearchChange={setSearch} />

          <header className="mt-4 flex w-full flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-[#7384A6]">
              <Link href="/admin" className="hover:underline">
                Inicio
              </Link>
              <Icon icon="tabler:chevron-right" className="text-base" />
              <span className="font-semibold text-[#1D2E56]">Recolección</span>
            </div>

            <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-[24px] font-bold leading-none text-[#0B1737] sm:text-[26px]">
                  Recolección de datos
                </h1>
                <p className="mt-1.5 text-[13px] text-[#6F7F9F]">
                  Gestiona tus formularios de consentimiento y políticas de
                  tratamiento de datos.
                </p>
              </div>

              <CheckPermission group="collect" permission="create">
                <Button
                  href="/admin/recoleccion/crear-formulario"
                  className="w-full rounded-xl! border-[#0D2B74]! bg-[#0D2B74]! px-5! py-2.5! text-[13px] sm:w-auto"
                  startContent={<Icon icon="tabler:plus" className="text-base" />}
                >
                  Crear formulario
                </Button>
              </CheckPermission>
            </div>
          </header>
        </section>
      </div>

      <div className="px-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <DataOfficerCard compact hideWhenAssigned={false} />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="overflow-hidden rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
          <CollectFormsFilters
            activeFilter={activeFilter}
            onChange={setActiveFilter}
            resultCount={filteredForms?.length ?? 0}
            totalCount={collectForms?.length ?? 0}
            loading={loading && !collectForms}
          />
          <CollectFormsList
            refresh={refresh}
            items={filteredForms}
            loading={loading}
            error={error}
            embedded
          />
        </div>
      </div>
    </div>
  );
}
