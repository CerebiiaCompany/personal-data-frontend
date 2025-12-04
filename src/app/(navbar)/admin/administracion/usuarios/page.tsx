"use client";

import CompanyUsersTable from "@/components/administration/CompanyUsersTable";
import Button from "@/components/base/Button";
import Pagination from "@/components/base/Pagination";
import SectionSearchBar from "@/components/base/SectionSearchBar";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";

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

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedValue]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top of table
    const tableContainer = document.getElementById("users-table-container");
    if (tableContainer) {
      tableContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  return (
    <div className="w-full p-3 sm:p-4 md:p-5 rounded-md border border-disabled flex flex-col">
      <header className="w-full flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-between sm:items-center mb-4 sm:mb-5">
        <h4 className="font-semibold text-lg sm:text-xl text-primary-900 text-center sm:text-left">Usuarios</h4>
        <div className="flex flex-col sm:flex-row gap-2 h-full w-full sm:flex-1 sm:justify-end sm:max-w-lg">
          <SectionSearchBar search={search} onSearchChange={setSearch} />
          <Button
            href="/admin/administracion/usuarios/crear"
            className="w-full sm:w-auto text-sm sm:text-base"
            endContent={
              <Icon icon={"heroicons-outline:user-add"} className="text-lg sm:text-xl" />
            }
          >
            Crear Usuario
          </Button>
          {/* <Button>
            <Icon icon={"mdi:filter-outline"} className="text-2xl" />
          </Button> */}
        </div>
      </header>

      <div id="users-table-container" className="flex-1 flex flex-col min-h-0">
        <CompanyUsersTable
          refresh={refresh}
          items={data}
          loading={loading}
          error={error}
        />

        {/* Pagination */}
        {meta && (
          <Pagination
            meta={meta}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
}
