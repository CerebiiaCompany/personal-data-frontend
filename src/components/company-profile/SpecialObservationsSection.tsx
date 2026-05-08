"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import CustomToggle from "@/components/forms/CustomToggle";
import CustomTextarea from "@/components/forms/CustomTextarea";
import ProfileSectionCard from "./ProfileSectionCard";
import { updateCompanySpecialObservations } from "@/lib/company.api";
import { CompanyProfile } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";

const schema = z.object({
  minor_data_processing: z.boolean().optional(),
  biometric_data_usage: z.boolean().optional(),
  video_surveillance: z.boolean().optional(),
  third_party_integrations: z.boolean().optional(),
  additional_observations: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const toggleFields: { name: keyof Omit<FormValues, "additional_observations">; label: string }[] = [
  { name: "minor_data_processing", label: "Tratamiento de datos de menores de edad" },
  { name: "biometric_data_usage", label: "Uso de datos biométricos" },
  { name: "video_surveillance", label: "Videovigilancia" },
  { name: "third_party_integrations", label: "Integraciones con plataformas de terceros" },
];

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

const SpecialObservationsSection = ({ companyId, profile }: Props) => {
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      minor_data_processing: false,
      biometric_data_usage: false,
      video_surveillance: false,
      third_party_integrations: false,
      additional_observations: "",
    },
  });

  useEffect(() => {
    if (!profile?.specialObservations) return;
    const so = profile.specialObservations;
    reset({
      minor_data_processing: so.minor_data_processing ?? false,
      biometric_data_usage: so.biometric_data_usage ?? false,
      video_surveillance: so.video_surveillance ?? false,
      third_party_integrations: so.third_party_integrations ?? false,
      additional_observations: so.additional_observations ?? "",
    });
  }, [profile, reset]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await updateCompanySpecialObservations(companyId, values);
    setLoading(false);

    if (res.error) return toast.error(parseApiError(res.error));
    toast.success("Observaciones especiales actualizadas");
  }

  return (
    <ProfileSectionCard
      icon="tabler:eye"
      title="Observaciones especiales"
      description="Situaciones particulares relacionadas con el tratamiento de datos que requieren atención especial."
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
    >
      <div className="flex flex-col gap-3">
        {toggleFields.map(({ name, label }) => (
          <Controller
            key={name}
            name={name}
            control={control}
            render={({ field }) => (
              <CustomToggle
                label={label}
                checked={field.value ?? false}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
        ))}
      </div>

      <CustomTextarea
        label="Observaciones adicionales"
        placeholder="Cualquier otra observación relevante sobre el tratamiento de datos..."
        rows={3}
        {...register("additional_observations")}
        error={errors.additional_observations}
      />
    </ProfileSectionCard>
  );
};

export default SpecialObservationsSection;
