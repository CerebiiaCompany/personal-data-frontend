"use client";

import Image from "next/image";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { usePublicCollectForm } from "@/hooks/usePublicCollectForm";
import LoadingCover from "@/components/layout/LoadingCover";
import PublicConsentCampaignForm from "@/components/customers/PublicConsentCampaignForm";
import { Icon } from "@iconify/react/dist/iconify.js";
import LogoCerebiia from "@public/logo.svg";

function ConsentFormContent() {
  const { formId } = useParams<{ formId: string }>();
  const searchParams = useSearchParams();
  const cct = searchParams.get("cct");

  const { data, loading, error } = usePublicCollectForm({ id: formId });

  if (!cct) {
    return (
      <div className="flex flex-col items-center gap-5 max-w-md w-full text-center py-10 px-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <Icon icon="tabler:link-off" className="text-3xl text-red-600" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#0B1737]">Enlace inválido</h2>
          <p className="text-[#64748B] text-sm leading-relaxed">
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
      <div className="flex flex-col items-center gap-5 max-w-md w-full text-center py-10 px-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <Icon icon="tabler:alert-circle" className="text-3xl text-red-600" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#0B1737]">
            Error al cargar el formulario
          </h2>
          <p className="text-[#64748B] text-sm leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return <PublicConsentCampaignForm data={data} cct={cct} />;
}

export default function FormularioConsentPage() {
  return (
    <div className="flex-1 flex flex-col gap-8">
      <header className="w-full h-16 bg-primary-50 rounded-b-xl shadow-md border border-stone-100 flex items-center justify-between p-3">
        <Image
          src={LogoCerebiia}
          width={200}
          alt="Logo de Plataforma de Datos de Cerebiia"
          priority
          className="h-full w-auto"
        />
      </header>

      <div className="flex justify-center pb-10 px-4">
        <Suspense
          fallback={
            <div className="relative min-h-[200px] w-full max-w-2xl">
              <LoadingCover />
            </div>
          }
        >
          <ConsentFormContent />
        </Suspense>
      </div>
    </div>
  );
}
