"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import CustomTextarea from "@/components/forms/CustomTextarea";
import ProfileSectionCard from "./ProfileSectionCard";
import { updateCompanyEconomicActivity } from "@/lib/company.api";
import { CompanyProfile } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";

const schema = z.object({
  activity_description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

const EconomicActivitySection = ({ companyId, profile }: Props) => {
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!profile) return;
    reset({
      activity_description: profile.economicActivityDescription ?? "",
    });
  }, [profile, reset]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await updateCompanyEconomicActivity(companyId, values);
    setLoading(false);

    if (res.error) return toast.error(parseApiError(res.error));
    toast.success("Actividad económica actualizada");
  }

  return (
    <ProfileSectionCard
      icon="tabler:briefcase"
      title="Actividad económica"
      description="Descripción de la actividad económica principal de la empresa."
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
    >
      <CustomTextarea
        label="Descripción de la actividad económica"
        placeholder="Ej. Empresa dedicada a la comercialización de dispositivos móviles y accesorios..."
        rows={4}
        {...register("activity_description")}
        error={errors.activity_description}
      />
    </ProfileSectionCard>
  );
};

export default EconomicActivitySection;
