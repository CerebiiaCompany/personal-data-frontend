"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import CustomInput from "@/components/forms/CustomInput";
import ProfileSectionCard from "./ProfileSectionCard";
import { updateCompanyLegalRepresentative } from "@/lib/company.api";
import { CompanyProfile } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";

const schema = z.object({
  full_name: z.string().optional(),
  position: z.string().optional(),
  document_number: z.string().optional(),
  contact_email: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

const LegalRepresentativeSection = ({ companyId, profile }: Props) => {
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!profile?.manager) return;
    reset({
      full_name: profile.manager.name ?? "",
      position: profile.manager.position ?? "",
      document_number: profile.manager.docNumber ?? "",
      contact_email: profile.manager.contactEmail ?? "",
    });
  }, [profile, reset]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await updateCompanyLegalRepresentative(companyId, values);
    setLoading(false);

    if (res.error) return toast.error(parseApiError(res.error));
    toast.success("Representante legal actualizado");
  }

  return (
    <ProfileSectionCard
      icon="tabler:user-check"
      title="Representante legal"
      description="Datos del representante legal o persona autorizada para la toma de decisiones."
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CustomInput
          label="Nombre completo"
          placeholder="Ej. Juan Pérez"
          {...register("full_name")}
          error={errors.full_name}
        />
        <CustomInput
          label="Cargo"
          placeholder="Ej. Gerente General"
          {...register("position")}
          error={errors.position}
        />
        <CustomInput
          label="Número de documento"
          placeholder="Ej. 12345678"
          {...register("document_number")}
          error={errors.document_number}
        />
        <CustomInput
          label="Correo de contacto"
          placeholder="Ej. representante@empresa.com"
          {...register("contact_email")}
          error={errors.contact_email}
        />
      </div>
    </ProfileSectionCard>
  );
};

export default LegalRepresentativeSection;
