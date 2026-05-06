"use client";

import CompanyAreasTable from "@/components/administration/CompanyAreasTable";
import Button from "@/components/base/Button";
import Pagination from "@/components/base/Pagination";
import { useCompanyAreas } from "@/hooks/useCompanyAreas";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";

const topCardClass =
  "bg-white border border-[#E8EDF7] rounded-2xl shadow-[0_2px_12px_rgba(15,35,70,0.04)]";

const NAVY = "#1A2B5B";

export default function AdministrationAreasPage() {
  const user = useSessionStore((store) => store.user);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const { data, meta, loading, error, refresh } = useCompanyAreas({
    companyId: user?.companyUserData?.companyId,
    page,
    pageSize,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const tableContainer = document.getElementById("areas-table-container");
    if (tableContainer) {
      tableContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-[#F8FAFC]">
      <div className="w-full shrink-0 px-5 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <section className={clsx(topCardClass, "px-5 py-5 sm:px-6 sm:py-6")}>
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="min-w-0 flex-1 space-y-2">
              <nav className="flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
                <Link href="/admin" className="hover:underline">
                  Inicio
                </Link>
                <Icon
                  icon="tabler:chevron-right"
                  className="text-base shrink-0 text-[#94A3B8]"
                />
                <Link
                  href="/admin/administracion"
                  className="hover:underline"
                >
                  Administración
                </Link>
                <Icon
                  icon="tabler:chevron-right"
                  className="text-base shrink-0 text-[#94A3B8]"
                />
                <span className="font-semibold" style={{ color: NAVY }}>
                  Áreas
                </span>
              </nav>
              <h1
                className="text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]"
                style={{ color: NAVY }}
              >
                Áreas
              </h1>
              <p className="max-w-2xl text-[13px] leading-relaxed text-[#64748B] sm:text-sm">
                Organiza tu compañía por ubicaciones y asigna usuarios a cada
                área.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">
              <Button
                href="/admin/administracion/areas/crear"
                className="rounded-xl! border-[#1A2B5B]! bg-[#1A2B5B]! px-5! py-2.5! text-[13px]! font-semibold! text-white!"
                startContent={
                  <Icon icon="tabler:building-plus" className="text-lg" />
                }
              >
                Crear área
              </Button>
            </div>
          </header>
        </section>
      </div>

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
        <section
          id="areas-table-container"
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]"
        >
          <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-5">
            <CompanyAreasTable
              items={data}
              loading={loading}
              error={error}
              refresh={refresh}
            />
          </div>
          {meta ? (
            <div className="shrink-0 border-t border-[#EEF2F8] px-4 py-3 sm:px-5">
              <Pagination
                meta={meta}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
