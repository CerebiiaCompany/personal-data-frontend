"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

import CustomInput from "@/components/forms/CustomInput";
import Button from "@/components/base/Button";
import ProfileSectionCard from "./ProfileSectionCard";
import { updateCompanyIdentification } from "@/lib/company.api";
import { CompanyProfile } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";

const schema = z.object({
  company_name: z.string().optional(),
  nit: z.string().optional(),
  main_address: z.string().optional(),
  city: z.string().optional(),
  department: z.string().optional(),
  phone_numbers: z.array(z.object({ value: z.string() })).optional(),
  website: z.string().optional(),
  institutional_email: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

const IdentificationSection = ({ companyId, profile }: Props) => {
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone_numbers: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "phone_numbers",
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      company_name: profile.name ?? "",
      nit: profile.nit ?? "",
      main_address: profile.mainAddress ?? "",
      city: profile.city ?? "",
      department: profile.department ?? "",
      phone_numbers: (profile.phoneNumbers ?? []).map((v) => ({ value: v })),
      website: profile.website ?? "",
      institutional_email: profile.email ?? "",
    });
  }, [profile, reset]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await updateCompanyIdentification(companyId, {
      company_name: values.company_name,
      nit: values.nit,
      main_address: values.main_address,
      city: values.city,
      department: values.department,
      phone_numbers: values.phone_numbers?.map((p) => p.value).filter(Boolean),
      website: values.website,
      institutional_email: values.institutional_email,
    });
    setLoading(false);

    if (res.error) return toast.error(parseApiError(res.error));
    toast.success("Identificación actualizada");
  }

  return (
    <ProfileSectionCard
      icon="tabler:building-skyscraper"
      title="Identificación de la empresa"
      description="Nombre, NIT, dirección, ciudad, departamento, teléfonos, sitio web y correo institucional."
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CustomInput
          label="Nombre de la empresa"
          placeholder="Ej. Frontera Celular S.A.S"
          {...register("company_name")}
          error={errors.company_name}
        />
        <CustomInput
          label="NIT"
          placeholder="Ej. 820507899-5"
          {...register("nit")}
          error={errors.nit}
        />
        <CustomInput
          label="Dirección principal"
          placeholder="Ej. Cra 7 #12-34"
          {...register("main_address")}
          error={errors.main_address}
        />
        <CustomInput
          label="Ciudad"
          placeholder="Ej. Bogotá"
          {...register("city")}
          error={errors.city}
        />
        <CustomInput
          label="Departamento"
          placeholder="Ej. Cundinamarca"
          {...register("department")}
          error={errors.department}
        />
        <CustomInput
          label="Correo institucional"
          placeholder="Ej. contacto@empresa.com"
          {...register("institutional_email")}
          error={errors.institutional_email}
        />
        <CustomInput
          label="Sitio web"
          placeholder="Ej. https://empresa.com"
          {...register("website")}
          error={errors.website}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-medium pl-2 text-stone-500 text-sm">
          Teléfonos adicionales
        </p>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <CustomInput
              placeholder="Ej. 3001234567"
              {...register(`phone_numbers.${index}.value`)}
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
          Agregar teléfono
        </button>
      </div>
    </ProfileSectionCard>
  );
};

export default IdentificationSection;
