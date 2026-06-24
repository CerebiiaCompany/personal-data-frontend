"use client";

import CreateCollectFormForm from "@/components/collectForms/CreateCollectFormForm";
import ClientOnly from "@/components/layout/ClientOnly";
import LoadingCover from "@/components/layout/LoadingCover";

export default function CollectionCreateFormPage() {
  return (
    <div className="min-h-full bg-[#F9FBFF]">
      <ClientOnly
        fallback={
          <div className="relative min-h-[240px] w-full">
            <LoadingCover />
          </div>
        }
      >
        <CreateCollectFormForm />
      </ClientOnly>
    </div>
  );
}
