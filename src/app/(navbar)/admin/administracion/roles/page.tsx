"use client";

import CompanyRolesCardsView from "@/components/administration/CompanyRolesCardsView";
import { useCompanyRoles } from "@/hooks/useCompanyRoles";
import { useSessionStore } from "@/store/useSessionStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdministrationRolesPage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "COMPANY_ADMIN" && user.role !== "SUPERADMIN") {
      router.push("/sin-acceso");
    }
  }, [user, router]);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  const { data, meta, loading, error, refresh } = useCompanyRoles({
    companyId: user?.companyUserData?.companyId,
    page,
    pageSize,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const el = document.getElementById("roles-cards-container");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-[#F8FAFC]">
      <CompanyRolesCardsView
        items={data}
        loading={loading}
        error={error}
        refresh={refresh}
        meta={meta}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
