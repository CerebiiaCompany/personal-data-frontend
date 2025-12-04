"use client";

import CompanyRolesTable from "@/components/administration/CompanyRolesTable";
import Button from "@/components/base/Button";
import Pagination from "@/components/base/Pagination";
import { useCompanyRoles } from "@/hooks/useCompanyRoles";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import { useState } from "react";

export default function AdministrationRolesPage() {
  const user = useSessionStore((store) => store.user);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const { data, meta, loading, error, refresh } = useCompanyRoles({
    companyId: user?.companyUserData?.companyId,
    page,
    pageSize,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top of table
    const tableContainer = document.getElementById("roles-table-container");
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
        <h4 className="font-semibold text-lg sm:text-xl text-primary-900 text-center sm:text-left">Roles</h4>
        <div className="flex gap-2 justify-center sm:justify-end">
          <Button
            href="/admin/administracion/roles/crear"
            className="w-full sm:w-auto text-sm sm:text-base"
            endContent={
              <Icon icon={"fluent:tag-add-16-regular"} className="text-lg sm:text-xl" />
            }
          >
            Crear Rol
          </Button>
        </div>
      </header>

      <div id="roles-table-container" className="flex-1 flex flex-col min-h-0">
        <CompanyRolesTable
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
