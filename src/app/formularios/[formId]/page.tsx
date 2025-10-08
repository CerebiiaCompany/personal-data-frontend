"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { usePublicCollectForm } from "@/hooks/usePublicCollectForm";
import LoadingCover from "@/components/layout/LoadingCover";
import LogoCerebiia from "@public/logo.svg";
import PublicCollectForm from "@/components/customers/PublicCollectForm";

export default function CollectFormPage() {
  const { formId } = useParams();
  const { data, error, loading } = usePublicCollectForm({
    id: formId as string,
  });

  if (loading) return <LoadingCover wholePage={true} />;

  return (
    <div className="flex-1 flex flex-col gap-8">
      <header className="w-full h-16 bg-primary-50 rounded-b-xl shadow-md border border-stone-100 flex items-center justify-between p-3">
        <Image
          src={LogoCerebiia}
          width={200}
          alt="Logo de Plataforma de Datos de Cerebiia"
          priority
          className={"h-full w-auto"}
        />
      </header>
      <div className="flex justify-center pb-6">
        {error && <p>Error: {error}</p>}

        {data && <PublicCollectForm data={data} />}
      </div>
    </div>
  );
}
