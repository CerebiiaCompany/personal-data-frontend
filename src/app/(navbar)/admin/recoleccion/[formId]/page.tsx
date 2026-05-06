"use client";

import CreateCollectFormForm from "@/components/collectForms/CreateCollectFormForm";
import LoadingCover from "@/components/layout/LoadingCover";
import { useCollectForms } from "@/hooks/useCollectForms";
import { useSessionStore } from "@/store/useSessionStore";
import { CollectForm } from "@/types/collectForm.types";
import { useParams } from "next/navigation";

export default function EditCollectPage() {
  const user = useSessionStore((store) => store.user);
  const param = useParams();

  const collectForm = useCollectForms<CollectForm>({
    companyId: user?.companyUserData?.companyId,
    id: param.formId!.toString(),
  });

  return (
    <div className="min-h-full bg-[#F9FBFF]">
      {collectForm.loading && (
        <div className="relative min-h-[240px] w-full">
          <LoadingCover />
        </div>
      )}
      {collectForm.error && (
        <div className="px-6 py-10 text-center text-red-600 text-sm font-medium">
          {collectForm.error}
        </div>
      )}
      {collectForm.data && (
        <CreateCollectFormForm initialValues={collectForm.data} />
      )}
    </div>
  );
}
