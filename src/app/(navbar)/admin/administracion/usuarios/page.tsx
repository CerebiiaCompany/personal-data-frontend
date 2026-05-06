"use client";

import CompanyUsersTable from "@/components/administration/CompanyUsersTable";
import Button from "@/components/base/Button";
import Pagination from "@/components/base/Pagination";
import SectionSearchBar from "@/components/base/SectionSearchBar";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import clsx from "clsx";
import { useState, useEffect } from "react";

const topCardClass =
  "bg-white border border-[#E8EDF7] rounded-2xl shadow-[0_2px_12px_rgba(15,35,70,0.04)]";

const NAVY = "#1A2B5B";

export default function AdministrationUsersPage() {
  const user = useSessionStore((store) => store.user);
  const { debouncedValue, search, setSearch } = useDebouncedSearch();
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const { data, meta, loading, error, refresh } = useCompanyUsers({
    companyId: user?.companyUserData?.companyId,
    search: debouncedValue,
    page,
    pageSize,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedValue]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const tableContainer = document.getElementById("users-table-container");
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
          <div className="flex flex-col gap-6">
            <SectionSearchBar
              variant="pill"
              search={search}
              onSearchChange={setSearch}
              placeholder="Buscar por nombre, correo o cargo..."
            />

            <header className="flex flex-col gap-4 border-t border-[#EEF2F8] pt-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
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
                    Usuarios
                  </span>
                </nav>
                <h1
                  className="text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]"
                  style={{ color: NAVY }}
                >
                  Usuarios
                </h1>
                <p className="max-w-2xl text-[13px] leading-relaxed text-[#64748B] sm:text-sm">
                  Consulta y administra los usuarios de tu compañía, sus áreas y
                  permisos asignados.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">
                <Button
                  href="/admin/administracion/usuarios/crear"
                  className="rounded-xl! border-[#1A2B5B]! bg-[#1A2B5B]! px-5! py-2.5! text-[13px]! font-semibold! text-white!"
                  startContent={
                    <Icon icon="tabler:user-plus" className="text-lg" />
                  }
                >
                  Crear usuario
                </Button>
              </div>
            </header>
          </div>
        </section>
      </div>

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
        <section
          id="users-table-container"
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]"
        >
          <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-5">
            <CompanyUsersTable
              refresh={refresh}
              items={data}
              loading={loading}
              error={error}
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
