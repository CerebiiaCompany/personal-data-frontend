"use client";

import SectionHeader from "@/components/base/SectionHeader";
import CreateCollectFormForm from "@/components/collectForms/CreateCollectFormForm";
import LoadingCover from "@/components/layout/LoadingCover";
import { useCollectForms } from "@/hooks/useCollectForms";
import { useSessionStore } from "@/store/useSessionStore";
import { CollectForm } from "@/types/collectForm.types";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditCollectPage() {
  const user = useSessionStore((store) => store.user);

  const param = useParams();

  const collectForm = useCollectForms<CollectForm>({
    companyId: user?.companyUserData?.companyId,
    id: param.formId!.toString(),
  });

  console.table(collectForm);

  return (
    <div className="flex flex-col relative">
      <SectionHeader dynamicEndpoint="Detalles del formulario" />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 items-center">
        <h4 className="font-bold text-2xl text-primary-900">
          Actualizar formulario
        </h4>

        {collectForm.loading && (
          <div className="w-full h-20 relative">
            <LoadingCover />
          </div>
        )}
        {collectForm.error && <p>{collectForm.error}</p>}
        {collectForm.data && (
          <CreateCollectFormForm initialValues={collectForm.data} />
        )}
      </div>
    </div>
  );
}
