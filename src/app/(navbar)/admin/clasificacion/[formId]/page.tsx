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
      <div className="px-8 py-6 flex flex-col gap-6 flex-1">
        <header className="w-full flex gap-2 justify-between items-center">
          <Button href="/admin/clasificacion" hierarchy="tertiary" isIconOnly>
            <Icon icon={"tabler:arrow-narrow-left"} className="text-2xl" />
          </Button>
          <h4 className="font-semibold text-xl text-primary-900">
            Reporte total de usuarios de{" "}
            <Link
              className="underline"
              href={`/admin/recoleccion/${data?._id}`}
            >
              {data?.name}
            </Link>
          </h4>
          <span />
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
