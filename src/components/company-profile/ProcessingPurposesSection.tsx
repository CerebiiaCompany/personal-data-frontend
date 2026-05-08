"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

import CustomInput from "@/components/forms/CustomInput";
import CustomTextarea from "@/components/forms/CustomTextarea";
import ProfileSectionCard from "./ProfileSectionCard";
import { updateCompanyProcessingPurposes } from "@/lib/company.api";
import { CompanyProfile } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";

const schema = z.object({
  processing_purposes: z.array(
    z.object({
      data_type: z.string().optional(),
      purpose: z.string().optional(),
    })
  ),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

const ProcessingPurposesSection = ({ companyId, profile }: Props) => {
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { processing_purposes: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "processing_purposes",
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      processing_purposes: profile.processingPurposes ?? [],
    });
  }, [profile, reset]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await updateCompanyProcessingPurposes(companyId, {
      processing_purposes: values.processing_purposes,
    });
    setLoading(false);

    if (res.error) return toast.error(parseApiError(res.error));
    toast.success("Finalidades de tratamiento actualizadas");
  }

  return (
    <ProfileSectionCard
      icon="tabler:list-check"
      title="Finalidades del tratamiento"
      description="Propósitos por los cuales la empresa recolecta y trata cada tipo de dato personal."
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
    >
      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl border border-[#EAF0FA] p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1A2B5B]">
                Finalidad {index + 1}
              </p>
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              >
                <Icon icon="tabler:trash" className="text-base" />
              </button>
            </div>
            <CustomInput
              label="Tipo de dato"
              placeholder="Ej. Datos de contacto, datos de identificación..."
              {...register(`processing_purposes.${index}.data_type`)}
            />
            <CustomTextarea
              label="Finalidad / propósito"
              placeholder="Ej. Envío de comunicaciones comerciales, gestión de nómina..."
              rows={2}
              {...register(`processing_purposes.${index}.purpose`)}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => append({ data_type: "", purpose: "" })}
          className="flex items-center gap-1.5 text-sm text-[#3357A5] hover:underline w-fit"
        >
          <Icon icon="tabler:plus" className="text-base" />
          Agregar finalidad
        </button>
      </div>
    </ProfileSectionCard>
  );
};

export default ProcessingPurposesSection;
