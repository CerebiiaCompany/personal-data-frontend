"use client";

import Image from "next/image";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { usePublicCollectForm } from "@/hooks/usePublicCollectForm";
import LoadingCover from "@/components/layout/LoadingCover";
import ClientOnly from "@/components/layout/ClientOnly";
import PublicConsentCampaignForm from "@/components/customers/PublicConsentCampaignForm";
import { Icon } from "@iconify/react/dist/iconify.js";
import LogoCerebiia from "@public/logo.svg";

function ConsentFormContent() {
  const { formId } = useParams<{ formId: string }>();
  const searchParams = useSearchParams();
  const cct = searchParams.get("cct");
  const qct = searchParams.get("qct");

  const { data, loading, error } = usePublicCollectForm({ id: formId });

  if (!cct) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-5 px-4 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <Icon icon="tabler:link-off" className="text-3xl text-red-600" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#0B1737]">Enlace inválido</h2>
          <p className="text-sm leading-relaxed text-[#64748B]">
            Este enlace no contiene el token de autenticación necesario. Por
            favor, usa el enlace original que recibiste por SMS o correo
            electrónico.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative min-h-[200px] w-full max-w-2xl">
        <LoadingCover />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-5 px-4 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <Icon icon="tabler:alert-circle" className="text-3xl text-red-600" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#0B1737]">
            Error al cargar el formulario
          </h2>
          <p className="text-sm leading-relaxed text-[#64748B]">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return <PublicConsentCampaignForm data={data} cct={cct} qct={qct} />;
}

export default function FormularioConsentPage() {
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

      <div className="flex justify-center px-4 pb-10">
        <ClientOnly
          fallback={
            <div className="relative min-h-[200px] w-full max-w-2xl">
              <LoadingCover />
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="relative min-h-[200px] w-full max-w-2xl">
                <LoadingCover />
              </div>
            }
          >
            <ConsentFormContent />
          </Suspense>
        </ClientOnly>
      </div>
    </div>
  );
}
