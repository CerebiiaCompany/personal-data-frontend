import React from "react";
import { Icon } from "@iconify/react";
import Button from "./Button";
import clsx from "clsx";

interface PaginationMeta {
  totalCount?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

interface Props {
  meta: PaginationMeta | null | undefined;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

const Pagination = ({
  meta,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: Props) => {
  if (!meta || !meta.totalPages || meta.totalPages <= 1) {
    return null;
  }

  const currentPage = meta.page || 1;
  const totalPages = meta.totalPages || 1;
  const totalCount = meta.totalCount || 0;
  const pageSize = meta.pageSize || 10;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-3 sm:py-4 px-2 sm:px-4 border-t border-disabled">
      {/* Info text */}
      <div className="text-xs sm:text-sm text-stone-600 order-2 sm:order-1">
        Mostrando {startItem} - {endItem} de {totalCount} resultados
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 order-1 sm:order-2">
        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label className="text-xs sm:text-sm text-stone-600 whitespace-nowrap">
              Por página:
            </label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 sm:px-3 py-1 sm:py-1.5 border border-disabled rounded-lg text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Previous button */}
          <Button
            hierarchy="tertiary"
            isIconOnly
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 sm:p-2"
            aria-label="Página anterior"
          >
            <Icon icon="tabler:chevron-left" className="text-base sm:text-lg" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-xs sm:text-sm text-stone-400"
                  >
                    ...
                  </span>
                );
              }

              const pageNumber = page as number;
              const isActive = pageNumber === currentPage;

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={clsx([
                    "min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors",
                    {
                      "bg-primary-900 text-white": isActive,
                      "bg-white text-primary-900 border border-disabled hover:bg-primary-50":
                        !isActive,
                    },
                  ])}
                  aria-label={`Ir a la página ${pageNumber}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <Button
            hierarchy="tertiary"
            isIconOnly
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 sm:p-2"
            aria-label="Página siguiente"
          >
            <Icon icon="tabler:chevron-right" className="text-base sm:text-lg" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;

