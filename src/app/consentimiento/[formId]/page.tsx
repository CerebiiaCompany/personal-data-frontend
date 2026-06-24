"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { usePublicCollectForm } from "@/hooks/usePublicCollectForm";
import LoadingCover from "@/components/layout/LoadingCover";
import ClientOnly from "@/components/layout/ClientOnly";
import LogoCerebiia from "@public/logo.svg";
import PublicConsentForm from "@/components/customers/PublicConsentForm";

export default function ConsentAcceptancePage() {
  const { formId } = useParams();
  const { data, error, loading } = usePublicCollectForm({
    id: formId as string,
  });

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex h-16 w-full items-center justify-between rounded-b-xl border border-stone-100 bg-primary-50 p-3 shadow-md">
        <Image
          src={LogoCerebiia}
          width={200}
          alt="Logo de Plataforma de Datos de Cerebiia"
          priority
          className="h-full w-auto"
        />
      </header>
      <div className="flex justify-center pb-6">
        <ClientOnly
          fallback={
            <div className="relative min-h-[280px] w-full max-w-2xl">
              <LoadingCover />
            </div>
          }
        >
          {loading ? (
            <div className="relative min-h-[280px] w-full max-w-2xl">
              <LoadingCover />
            </div>
          ) : error ? (
            <div className="w-full max-w-2xl px-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="font-medium text-red-700">Error: {error}</p>
              </div>
            </div>
          ) : data ? (
            <PublicConsentForm data={data} />
          ) : null}
        </ClientOnly>
      </div>
    </div>
  );
}
