"use client";

import PublicCollectForm from "@/components/customers/PublicCollectForm";
import LoadingCover from "@/components/layout/LoadingCover";
import { useCollectFormResponses } from "@/hooks/useCollectFormResponses";
import { useCollectForms } from "@/hooks/useCollectForms";
import { useSessionStore } from "@/store/useSessionStore";
import { CollectForm } from "@/types/collectForm.types";
import { CollectFormResponse } from "@/types/collectFormResponse.types";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function FormClassificationUpdateResponse() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();
  const formId = useParams().formId?.toString();
  const responseId = useParams().responseId?.toString();

  const collectFormResponse = useCollectForms<CollectForm>({
    companyId: user?.companyUserData?.companyId,
    id: formId,
  });
  const { data, loading, error } = useCollectFormResponses<CollectFormResponse>(
    {
      companyId: user?.companyUserData?.companyId,
      id: formId,
      responseId: responseId,
    }
  );

  console.log(data);

  return (
    <div className="w-full p-4 rounded-md border border-disabled flex flex-col gap-10 items-center relative">
      <header className="w-full flex gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Link
            href={`/admin/clasificacion/${formId}`}
            className="flex items-center gap-2 text-primary-900 font-medium text-sm"
          >
            <div className="w-fit bg-primary-900 rounded-md text-white p-1">
              <Icon icon={"tabler:chevron-left"} className="text-2xl" />
            </div>
            Volver
          </Link>
        </div>
        <h4 className="font-semibold text-xl text-primary-900 w-full text-center">
          Actualizar Respuesta
        </h4>
      </header>

      {loading && (
        <div className="min-h-20 relative w-full">
          <LoadingCover />
        </div>
      )}
      {error && <p>{error}</p>}
      {collectFormResponse.data && data ? (
        <PublicCollectForm
          data={collectFormResponse.data}
          initialValues={data}
        />
      ) : null}
    </div>
  );
}
