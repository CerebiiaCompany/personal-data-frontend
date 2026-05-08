"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import CustomToggle from "@/components/forms/CustomToggle";
import CustomTextarea from "@/components/forms/CustomTextarea";
import ProfileSectionCard from "./ProfileSectionCard";
import { updateCompanyInternationalTransfers } from "@/lib/company.api";
import { CompanyProfile } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";

const schema = z.object({
  servers_outside_country: z.boolean().optional(),
  third_party_transfers: z.boolean().optional(),
  transfer_details: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

const InternationalTransfersSection = ({ companyId, profile }: Props) => {
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
      servers_outside_country: false,
      third_party_transfers: false,
      transfer_details: "",
    },
  });

  useEffect(() => {
    if (!profile?.internationalTransfers) return;
    const it = profile.internationalTransfers;
    reset({
      servers_outside_country: it.servers_outside_country ?? false,
      third_party_transfers: it.third_party_transfers ?? false,
      transfer_details: it.transfer_details ?? "",
    });
  }, [profile, reset]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await updateCompanyInternationalTransfers(companyId, values);
    setLoading(false);

    if (res.error) return toast.error(parseApiError(res.error));
    toast.success("Transferencias internacionales actualizadas");
  }

  return (
    <ProfileSectionCard
      icon="tabler:world"
      title="Transferencias internacionales"
      description="Indica si la empresa almacena datos en servidores fuera del país o los transfiere a terceros."
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
          <Controller
            name="servers_outside_country"
            control={control}
            render={({ field }) => (
              <CustomToggle
                label="Servidores fuera del país"
                checked={field.value ?? false}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
          <Controller
            name="third_party_transfers"
            control={control}
            render={({ field }) => (
              <CustomToggle
                label="Transferencias a terceros"
                checked={field.value ?? false}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
        </div>
        <CustomTextarea
          label="Detalles de las transferencias"
          placeholder="Describa a qué países, con qué finalidad y bajo qué garantías se realizan las transferencias..."
          rows={3}
          {...register("transfer_details")}
          error={errors.transfer_details}
        />
      </div>
    </ProfileSectionCard>
  );
};

export default InternationalTransfersSection;
