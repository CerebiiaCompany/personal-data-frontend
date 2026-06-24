"use client";

import EditCollectFormResponseForm from "@/components/clasification/EditCollectFormResponseForm";
import LoadingCover from "@/components/layout/LoadingCover";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useCollectFormResponses } from "@/hooks/useCollectFormResponses";
import { useCollectForms } from "@/hooks/useCollectForms";
import { CollectForm } from "@/types/collectForm.types";
import { CollectFormResponse } from "@/types/collectFormResponse.types";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function FormClassificationUpdateResponse() {
  const companyId = useActiveCompanyId();
  const router = useRouter();
  const formId = useParams().formId?.toString();
  const responseId = useParams().responseId?.toString();

  const collectForm = useCollectForms<CollectForm>({
    companyId: companyId,
    id: formId,
  });
  const { data, loading, error, refresh } = useCollectFormResponses<CollectFormResponse>(
    {
      companyId: companyId,
      id: formId,
      responseId: responseId,
    }
  );

  return (
    <div className="flex flex-col bg-[#F8FAFC] min-h-full">
      <div className="px-5 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[720px]">
          <section className="rounded-2xl border border-[#E8EDF7] bg-white px-5 py-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:px-6">
            <header className="flex flex-col gap-4 border-b border-[#EEF2F8] pb-5 mb-5">
              <nav className="flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
                <Link href="/admin" className="hover:underline">
                  Inicio
                </Link>
                <Icon icon="tabler:chevron-right" className="shrink-0 text-base" />
                <Link href="/admin/clasificacion" className="hover:underline">
                  Clasificación
                </Link>
                <Icon icon="tabler:chevron-right" className="shrink-0 text-base" />
                <Link href={`/admin/clasificacion/${formId}`} className="hover:underline">
                  {collectForm.data?.name || "Formulario"}
                </Link>
                <Icon icon="tabler:chevron-right" className="shrink-0 text-base" />
                <span className="font-semibold text-[#1A2B5B]">Editar registro</span>
              </nav>
              <h1 className="text-[24px] font-bold text-[#0B1737]">
                Editar información recolectada
              </h1>
            </header>

            {loading && (
              <div className="relative min-h-[200px]">
                <LoadingCover />
              </div>
            )}
            {error && (
              <p className="text-red-600 text-sm font-medium text-center py-6">{error}</p>
            )}
            {companyId && formId && data ? (
              <EditCollectFormResponseForm
                companyId={companyId}
                collectFormId={formId}
                response={data}
                variant="page"
                onUpdated={() => {
                  refresh();
                  router.push(`/admin/clasificacion/${formId}`);
                }}
                onCancel={() => router.push(`/admin/clasificacion/${formId}`)}
              />
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
