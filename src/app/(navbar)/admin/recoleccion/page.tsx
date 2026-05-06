"use client";

import Button from "@/components/base/Button";
import SectionSearchBar from "@/components/base/SectionSearchBar";
import CollectFormsList from "@/components/collectForms/CollectFormsList";
import CheckPermission from "@/components/checkers/CheckPermission";
import { useCollectForms } from "@/hooks/useCollectForms";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useMemo, useState } from "react";

type CollectFilter = "ALL" | "TEMPLATE" | "CUSTOM";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function CollectPage() {
  const user = useSessionStore((store) => store.user);
  const { shouldFetch } = usePermissionCheck();
  const { debouncedValue, setSearch, search } = useDebouncedSearch();
  const [activeFilter, setActiveFilter] = useState<CollectFilter>("ALL");
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
    <div className="flex flex-col h-full bg-[#F9FBFF]">
      <div className="px-5 md:px-6 pt-4 collect-enter">
        <section className="bg-white border border-[#E8EDF7] rounded-2xl px-5 md:px-6 py-4 md:py-5 shadow-[0_2px_10px_rgba(15,35,70,0.03)]">
          <SectionSearchBar search={search} onSearchChange={setSearch} />

          <header className="w-full flex flex-col gap-3 mt-4">
            <div className="flex items-center gap-2 text-[#7384A6] text-sm">
              <Link href="/admin" className="hover:underline">
                Inicio
              </Link>
              <Icon icon="tabler:chevron-right" className="text-base" />
              <span className="text-[#1D2E56] font-semibold">Recolección</span>
            </div>

            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-[24px] sm:text-[26px] leading-none font-bold text-[#0B1737]">
                  Recolección de datos
                </h1>
                <p className="text-[#6F7F9F] text-[13px] mt-1.5">
                  Gestiona tus formularios de consentimiento y políticas de
                  tratamiento de datos.
                </p>
              </div>

              <CheckPermission group="collect" permission="create">
                <Button
                  href="/admin/recoleccion/crear-formulario"
                  className="w-full sm:w-auto text-[13px] bg-[#0D2B74]! border-[#0D2B74]! px-5! py-2.5! rounded-xl!"
                  startContent={<Icon icon="tabler:plus" className="text-base" />}
                >
                  Crear formulario
                </Button>
              </CheckPermission>
            </div>
          </header>
        </section>
      </div>

      <div className="px-5 md:px-6 py-4 md:py-5 flex flex-col gap-4 flex-1 collect-enter-delayed">
        
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className={`px-4 py-2 rounded-2xl text-[13px] font-semibold border transition-colors ${
                activeFilter === "ALL"
                  ? "bg-[#133C95] text-white border-[#133C95]"
                  : "bg-white text-[#5C6D91] border-[#E3E9F5] hover:bg-[#F4F7FE]"
              }`}
              onClick={() => setActiveFilter("ALL")}
            >
              Todos
            </button>

            <button
              className={`px-4 py-2 rounded-2xl text-[13px] font-semibold border transition-colors ${
                activeFilter === "TEMPLATE"
                  ? "bg-[#133C95] text-white border-[#133C95]"
                  : "bg-white text-[#5C6D91] border-[#E3E9F5] hover:bg-[#F4F7FE]"
              }`}
              onClick={() => setActiveFilter("TEMPLATE")}
            >
              Plantillas legales
            </button>

            <button
              className={`px-4 py-2 rounded-2xl text-[13px] font-semibold border transition-colors ${
                activeFilter === "CUSTOM"
                  ? "bg-[#133C95] text-white border-[#133C95]"
                  : "bg-white text-[#5C6D91] border-[#E3E9F5] hover:bg-[#F4F7FE]"
              }`}
              onClick={() => setActiveFilter("CUSTOM")}
            >
              Personalizados
            </button>
          </div>

        <CollectFormsList
          refresh={refresh}
          items={filteredForms}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
