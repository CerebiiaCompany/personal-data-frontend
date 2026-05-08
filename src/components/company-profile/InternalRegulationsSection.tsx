"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

import CustomToggle from "@/components/forms/CustomToggle";
import CustomInput from "@/components/forms/CustomInput";
import CustomTextarea from "@/components/forms/CustomTextarea";
import ProfileSectionCard from "./ProfileSectionCard";
import { updateCompanyInternalRegulations } from "@/lib/company.api";
import { CompanyProfile } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";

const schema = z.object({
  has_internal_policies: z.boolean().optional(),
  documents_description: z.string().optional(),
  attachments: z.array(z.object({ value: z.string() })).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

const InternalRegulationsSection = ({ companyId, profile }: Props) => {
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
      has_internal_policies: false,
      documents_description: "",
      attachments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "attachments",
  });

  useEffect(() => {
    if (!profile?.internalRegulations) return;
    const ir = profile.internalRegulations;
    reset({
      has_internal_policies: ir.has_internal_policies ?? false,
      documents_description: ir.documents_description ?? "",
      attachments: (ir.attachments ?? []).map((v) => ({ value: v })),
    });
  }, [profile, reset]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await updateCompanyInternalRegulations(companyId, {
      has_internal_policies: values.has_internal_policies,
      documents_description: values.documents_description,
      attachments: values.attachments?.map((a) => a.value).filter(Boolean),
    });
    setLoading(false);

    if (res.error) return toast.error(parseApiError(res.error));
    toast.success("Reglamento interno actualizado");
  }

  return (
    <ProfileSectionCard
      icon="tabler:file-certificate"
      title="Reglamento interno"
      description="Políticas internas y documentos relacionados con la protección de datos personales."
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
    >
      <Controller
        name="has_internal_policies"
        control={control}
        render={({ field }) => (
          <CustomToggle
            label="¿Tiene políticas internas de protección de datos?"
            checked={field.value ?? false}
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        )}
      />

      <CustomTextarea
        label="Descripción de los documentos"
        placeholder="Describa las políticas y documentos internos existentes..."
        rows={3}
        {...register("documents_description")}
        error={errors.documents_description}
      />

      <div className="flex flex-col gap-2">
        <p className="font-medium pl-2 text-stone-500 text-sm">
          Archivos adjuntos (URLs de S3)
        </p>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <CustomInput
              placeholder="https://s3.amazonaws.com/bucket/documento.pdf"
              {...register(`attachments.${index}.value`)}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors shrink-0"
            >
              <Icon icon="tabler:trash" className="text-lg" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ value: "" })}
          className="flex items-center gap-1.5 text-sm text-[#3357A5] hover:underline w-fit"
        >
          <Icon icon="tabler:plus" className="text-base" />
          Agregar documento
        </button>
      </div>
    </ProfileSectionCard>
  );
};

export default InternalRegulationsSection;
