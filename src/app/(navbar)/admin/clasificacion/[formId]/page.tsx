"use client";

import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import ClasificationTable from "@/components/clasification/ClasificationTable";
import FormResponsesTable from "@/components/clasification/FormResponsesTable";
import { useCollectFormClasifications } from "@/hooks/useCollectFormClasifications";
import { useCollectFormResponses } from "@/hooks/useCollectFormResponses";
import { FORMS_MOCK_DATA } from "@/mock/formMock";
import { useSessionStore } from "@/store/useSessionStore";
import { formatDateToString } from "@/utils/date.utils";
import { Icon } from "@iconify/react";
import { useParams, useRouter } from "next/navigation";

export default function FormClassificationPage() {
  const user = useSessionStore((store) => store.user);
  const formId = useParams().formId?.toString();
  const { data, loading, error, refresh } = useCollectFormResponses({
    companyId: user?.companyUserData?.companyId,
    id: formId,
  });
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      <SectionHeader dynamicEndpoint={data?.name || "..."} />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 flex-1">
        <header className="w-full flex gap-2 justify-between items-center">
          <Button href="/admin/clasificacion" hierarchy="tertiary" isIconOnly>
            <Icon icon={"tabler:arrow-narrow-left"} className="text-2xl" />
          </Button>
          <h4 className="font-semibold text-xl text-primary-900">
            Datos totales
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
