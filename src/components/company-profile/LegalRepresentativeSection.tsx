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
import { getAdminDocTypeOptionsByCountry } from "@/types/user.types";
import { parseApiError } from "@/utils/parseApiError";
import {
  formatRutDisplay,
  isValidRut,
  normalizeRut,
  RUT_INVALID_MESSAGE,
} from "@/utils/rutValidator";

function buildLegalRepSchema(isChile: boolean) {
  return z
    .object({
      full_name: z.string().optional(),
      position: z.string().optional(),
      document_number: z.string().optional(),
      contact_email: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (isChile && data.document_number && data.document_number.trim().length > 0) {
        if (!isValidRut(data.document_number)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["document_number"],
            message: RUT_INVALID_MESSAGE,
          });
        }
      }
    });
}

type FormValues = z.infer<ReturnType<typeof buildLegalRepSchema>>;

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

const LegalRepresentativeSection = ({ companyId, profile }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const isChile = profile?.countryCode === "CL";
  const docTypeLabel =
    getAdminDocTypeOptionsByCountry(profile?.countryCode).defaultValue;

  const schema = React.useMemo(() => buildLegalRepSchema(isChile), [isChile]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const docNumberValue = watch("document_number") ?? "";

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
    const finalDocNumber =
      isChile && values.document_number
        ? normalizeRut(values.document_number)
        : values.document_number;
    const res = await updateCompanyLegalRepresentative(companyId, {
      ...values,
      document_number: finalDocNumber,
    });
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
        <div className="flex flex-col gap-1">
          <CustomInput
            label={`Número de documento (${docTypeLabel})`}
            placeholder={
              docTypeLabel === "RUT" ? "Ej. 12.345.678-5" : "Ej. 12345678"
            }
            value={docNumberValue}
            onChange={(e) => {
              const val = isChile ? formatRutDisplay(e.target.value) : e.target.value;
              setValue("document_number", val, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            error={errors.document_number}
          />
          {isChile && !errors.document_number && (
            <p className="text-xs text-stone-400 pl-2">
              Formato chileno: números + guion + dígito verificador. Ej. 12.345.678-5
            </p>
          )}
        </div>
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
