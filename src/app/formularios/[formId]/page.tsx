"use client";

import Image from "next/image";
import CustomInput from "@/components/forms/CustomInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/base/Button";
import CustomCheckbox from "@/components/forms/CustomCheckbox";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSession, loginUser } from "@/lib/auth.api";
import { parseApiError } from "@/utils/parseApiError";
import { fetchPublicCollectForm } from "@/lib/collectForm.api";
import { usePublicCollectForm } from "@/hooks/usePublicCollectForm";
import LoadingCover from "@/components/layout/LoadingCover";
import DashboardContent from "@/components/layout/DashboardContent";
import LogoCerebiia from "@public/logo.svg";
import clsx from "clsx";
import RenderQuestion from "@/components/forms/RenderQuestion";
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
      <div className="flex justify-center">
        {error && <p>Error: {error}</p>}

        {data && <PublicCollectForm data={data} />}
      </div>
    </div>
  );
}
