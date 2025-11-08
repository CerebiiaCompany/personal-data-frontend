"use client";

import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import CompanyPaymentsTable from "@/components/profile/payments/CompanyPaymentsTable";
import { useAllPayments } from "@/hooks/superadmin/useAllPayments";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useSessionStore } from "@/store/useSessionStore";

export default function PaymentsPage() {
  const user = useSessionStore((store) => store.user);
  const { debouncedValue, setSearch, search } = useDebouncedSearch();
  const { data: payments, loading, error, refresh } = useAllPayments({});

  return (
    <div className="flex flex-col h-full">
      <SectionHeader search={search} onSearchChange={setSearch} />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 flex-1">
        <header className="w-full flex flex-col gap-2 items-start">
          <div className="w-full justify-between flex items-center">
            <Button href="/superadmin/pagos/crear">Crear pago</Button>
          </div>
        </header>

        <CompanyPaymentsTable
          loading={loading}
          error={error}
          items={payments}
          refresh={refresh}
        />
      </div>
    </div>
  );
}
