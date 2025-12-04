"use client";

import CompanyAreasTable from "@/components/administration/CompanyAreasTable";
import Button from "@/components/base/Button";
import Pagination from "@/components/base/Pagination";
import { useCompanyAreas } from "@/hooks/useCompanyAreas";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import { useState } from "react";

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
    // Scroll to top of table
    const tableContainer = document.getElementById("areas-table-container");
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
        <h4 className="font-semibold text-lg sm:text-xl text-primary-900 text-center sm:text-left">Áreas</h4>
        <div className="flex gap-2 justify-center sm:justify-end">
          <Button
            href="/admin/administracion/areas/crear"
            className="w-full sm:w-auto text-sm sm:text-base"
            endContent={<Icon icon={"bi:building-add"} className="text-lg sm:text-xl" />}
          >
            Crear Área
          </Button>
          {/* <Button>
            <Icon icon={"mdi:filter-outline"} className="text-2xl" />
          </Button> */}
        </div>
      </header>

      <div id="areas-table-container" className="flex-1 flex flex-col min-h-0">
        <CompanyAreasTable
          items={data}
          loading={loading}
          error={error}
          refresh={refresh}
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
