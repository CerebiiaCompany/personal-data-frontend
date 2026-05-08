"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

import CustomCheckbox from "@/components/forms/CustomCheckbox";
import CustomInput from "@/components/forms/CustomInput";
import CustomTextarea from "@/components/forms/CustomTextarea";
import ProfileSectionCard from "./ProfileSectionCard";
import { updateCompanyPersonalDataCollected } from "@/lib/company.api";
import { CompanyProfile } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";

const schema = z.object({
  employees_data: z.boolean().optional(),
  suppliers_data: z.boolean().optional(),
  clients_data: z.boolean().optional(),
  web_users_data: z.boolean().optional(),
  commercial_prospects_data: z.boolean().optional(),
  financial_data: z.boolean().optional(),
  sensitive_data: z.array(z.object({ value: z.string() })).optional(),
  other_sensitive_data: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

const booleanFields = [
  { name: "employees_data" as const, label: "Datos de empleados" },
  { name: "suppliers_data" as const, label: "Datos de proveedores" },
  { name: "clients_data" as const, label: "Datos de clientes" },
  { name: "web_users_data" as const, label: "Usuarios web" },
  { name: "commercial_prospects_data" as const, label: "Prospectos comerciales" },
  { name: "financial_data" as const, label: "Datos financieros" },
];

const PersonalDataCollectedSection = ({ companyId, profile }: Props) => {
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      employees_data: false,
      suppliers_data: false,
      clients_data: false,
      web_users_data: false,
      commercial_prospects_data: false,
      financial_data: false,
      sensitive_data: [],
      other_sensitive_data: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sensitive_data",
  });

  useEffect(() => {
    if (!profile?.personalDataCollected) return;
    const pdc = profile.personalDataCollected;
    reset({
      employees_data: pdc.employees_data ?? false,
      suppliers_data: pdc.suppliers_data ?? false,
      clients_data: pdc.clients_data ?? false,
      web_users_data: pdc.web_users_data ?? false,
      commercial_prospects_data: pdc.commercial_prospects_data ?? false,
      financial_data: pdc.financial_data ?? false,
      sensitive_data: (pdc.sensitive_data ?? []).map((v) => ({ value: v })),
      other_sensitive_data: pdc.other_sensitive_data ?? "",
    });
  }, [profile, reset]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await updateCompanyPersonalDataCollected(companyId, {
      employees_data: values.employees_data,
      suppliers_data: values.suppliers_data,
      clients_data: values.clients_data,
      web_users_data: values.web_users_data,
      commercial_prospects_data: values.commercial_prospects_data,
      financial_data: values.financial_data,
      sensitive_data: values.sensitive_data?.map((s) => s.value).filter(Boolean),
      other_sensitive_data: values.other_sensitive_data,
    });
    setLoading(false);

    if (res.error) return toast.error(parseApiError(res.error));
    toast.success("Datos personales recolectados actualizados");
  }

  return (
    <ProfileSectionCard
      icon="tabler:database"
      title="Datos personales recolectados"
      description="Categorías de titulares y tipos de datos personales que la empresa recolecta y trata."
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
    >
      <div>
        <p className="font-medium pl-2 text-stone-500 text-sm mb-3">
          Categorías de titulares
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {booleanFields.map(({ name, label }) => (
            <Controller
              key={name}
              name={name}
              control={control}
              render={({ field }) => (
                <CustomCheckbox
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
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-medium pl-2 text-stone-500 text-sm">
          Datos sensibles tratados
        </p>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <CustomInput
              placeholder="Ej. Datos de salud, datos biométricos..."
              {...register(`sensitive_data.${index}.value`)}
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
          Agregar dato sensible
        </button>
      </div>

      <CustomTextarea
        label="Otros datos sensibles"
        placeholder="Describa otros datos sensibles que no estén listados arriba..."
        rows={3}
        {...register("other_sensitive_data")}
        error={errors.other_sensitive_data}
      />
    </ProfileSectionCard>
  );
};

export default PersonalDataCollectedSection;
