"use client";

import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import FormResponsesTable from "@/components/clasification/FormResponsesTable";
import { useCollectFormResponses } from "@/hooks/useCollectFormResponses";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function FormClassificationPage() {
  const user = useSessionStore((store) => store.user);
  const formId = useParams().formId?.toString();
  const { debouncedValue, search, setSearch } = useDebouncedSearch();
  const { data, loading, error, refresh } = useCollectFormResponses({
    companyId: user?.companyUserData?.companyId,
    id: formId,
    search: debouncedValue,
  });

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        dynamicEndpoint={data?.name || "..."}
        search={search}
        onSearchChange={setSearch}
      />

      {/* Content */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 flex flex-col gap-4 sm:gap-5 md:gap-6 flex-1 min-h-0">
        <header className="w-full flex gap-3 sm:gap-4 items-center flex-shrink-0">
          <Button href="/admin/clasificacion" hierarchy="tertiary" isIconOnly className="flex-shrink-0">
            <Icon icon={"tabler:arrow-narrow-left"} className="text-xl sm:text-2xl" />
          </Button>
          <h4 className="font-semibold text-base sm:text-lg md:text-xl text-primary-900 leading-tight">
            Reporte total de usuarios de{" "}
            <Link
              className="underline break-words"
              href={`/admin/recoleccion/${data?._id}`}
            >
              {data?.name || "..."}
            </Link>
          </h4>
        </header>

        {/* Forms Table */}
        <FormResponsesTable
          refresh={refresh}
          items={data ? data.responses : null}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
