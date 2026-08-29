"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import ProfileSectionCard from "./ProfileSectionCard";
import { updateCompanyIdentification } from "@/lib/company.api";
import { CompanyProfile } from "@/types/company.types";
import { getJuridicaDocType } from "@/types/user.types";
import { parseApiError } from "@/utils/parseApiError";
import {
  formatRutDisplay,
  isValidRut,
  normalizeRut,
  RUT_INVALID_MESSAGE,
} from "@/utils/rutValidator";
import { useJurisdictionGeographicDivisions } from "@/hooks/useJurisdictionGeographicDivisions";

function buildIdentificationSchema(isChile: boolean) {
  return z
    .object({
      company_name: z.string().optional(),
      nit: z.string().optional(),
      main_address: z.string().optional(),
      city: z.string().optional(),
      department: z.string().optional(),
      province_name: z.string().optional(),
      phone_numbers: z.array(z.object({ value: z.string() })).optional(),
      website: z.string().optional(),
      public_contact_email: z.string().optional(),
      arco_portal_contact: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (isChile && data.nit && data.nit.trim().length > 0) {
        if (!isValidRut(data.nit)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["nit"],
            message: RUT_INVALID_MESSAGE,
          });
        }
      }
    });
}

type FormValues = z.infer<ReturnType<typeof buildIdentificationSchema>>;

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

function resolveProfileGeography(profile: CompanyProfile) {
  return {
    region: profile.regionName ?? profile.department ?? "",
    province: profile.provinceName ?? "",
    commune: profile.communeName ?? profile.city ?? "",
    address: profile.address ?? profile.mainAddress ?? "",
  };
}

const IdentificationSection = ({ companyId, profile }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const isChile = profile?.countryCode === "CL";
  const juridicaDocLabel = getJuridicaDocType(profile?.countryCode);

  const schema = React.useMemo(() => buildIdentificationSchema(isChile), [isChile]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { phone_numbers: [] },
  });

  const nitValue = watch("nit") ?? "";

  const { fields, append, remove } = useFieldArray({
    control,
    name: "phone_numbers",
  });

  const { regionOptions, getProvinciaOptions, getComunaOptions } =
    useJurisdictionGeographicDivisions(isChile ? "CL" : "CO");
  const selectedRegionName = watch("department") ?? "";
  const selectedProvinceName = watch("province_name") ?? "";
  const provinciaOptions = React.useMemo(
    () => getProvinciaOptions(selectedRegionName),
    [getProvinciaOptions, selectedRegionName]
  );
  const comunaOptions = React.useMemo(
    () => getComunaOptions(selectedRegionName, selectedProvinceName),
    [getComunaOptions, selectedRegionName, selectedProvinceName]
  );

  useEffect(() => {
    if (!profile) return;
    const geo = resolveProfileGeography(profile);
    reset({
      company_name: profile.name ?? "",
      nit: profile.nit ?? "",
      main_address: geo.address,
      city: geo.commune,
      department: geo.region,
      province_name: geo.province,
      phone_numbers: (profile.phoneNumbers ?? []).map((v) => ({ value: v })),
      website: profile.website ?? "",
      public_contact_email:
        profile.publicContactEmail ??
        (profile.regionName ? profile.email ?? "" : ""),
      arco_portal_contact: profile.arcoPortalContact ?? "",
    });
  }, [profile, reset]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const finalNit = isChile && values.nit ? normalizeRut(values.nit) : values.nit;
    const res = await updateCompanyIdentification(companyId, {
      company_name: values.company_name,
      nit: finalNit,
      main_address: values.main_address,
      city: values.city,
      department: values.department,
      province_name: isChile ? values.province_name : undefined,
      phone_numbers: values.phone_numbers?.map((p) => p.value).filter(Boolean),
      website: values.website,
      public_contact_email: values.public_contact_email,
      arco_portal_contact: values.arco_portal_contact,
    });
    setLoading(false);

    if (res.error) return toast.error(parseApiError(res.error));
    toast.success("Identificación actualizada");
  }

  return (
    <ProfileSectionCard
      icon="tabler:building-skyscraper"
      title="Identificación de la empresa"
      description={`Nombre, ${juridicaDocLabel}, dirección, teléfonos, sitio web y contacto ARCO.`}
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
        <div className="flex flex-col gap-1">
          <CustomInput
            label={juridicaDocLabel}
            placeholder={
              juridicaDocLabel === "RUT" ? "Ej. 76.123.456-7" : "Ej. 820507899-5"
            }
            value={nitValue}
            onChange={(e) => {
              const val = isChile ? formatRutDisplay(e.target.value) : e.target.value;
              setValue("nit", val, { shouldValidate: true, shouldDirty: true });
            }}
            error={errors.nit}
          />
          {isChile && !errors.nit && (
            <p className="text-xs text-stone-400 pl-2">
              Formato chileno: números + guion + dígito verificador. Ej. 76.543.210-3
            </p>
          )}
        </div>
        <CustomInput
          label="Dirección principal"
          placeholder="Ej. Cra 7 #12-34"
          {...register("main_address")}
          error={errors.main_address}
        />
        {isChile ? (
          <>
            <CustomSelect
              label="Región"
              options={regionOptions}
              value={watch("department")}
              unselectedText="Seleccionar Región"
              onChange={(val: string) => {
                setValue("department", val, { shouldValidate: true, shouldDirty: true });
                setValue("province_name", "", { shouldValidate: true });
                setValue("city", "", { shouldValidate: true });
              }}
              error={errors.department as FieldError}
            />
            <CustomSelect
              label="Provincia"
              options={provinciaOptions}
              value={watch("province_name")}
              unselectedText={
                selectedRegionName
                  ? "Seleccionar Provincia"
                  : "Selecciona una Región primero"
              }
              onChange={(val: string) => {
                setValue("province_name", val, { shouldValidate: true, shouldDirty: true });
                setValue("city", "", { shouldValidate: true });
              }}
              disabled={!selectedRegionName}
              error={errors.province_name as FieldError}
            />
            <CustomSelect
              label="Comuna"
              options={comunaOptions}
              value={watch("city")}
              unselectedText={
                !selectedRegionName
                  ? "Selecciona una Región primero"
                  : !selectedProvinceName
                    ? "Selecciona una Provincia primero"
                    : "Seleccionar Comuna"
              }
              onChange={(val: string) =>
                setValue("city", val, { shouldValidate: true, shouldDirty: true })
              }
              disabled={
                !selectedRegionName ||
                !selectedProvinceName ||
                comunaOptions.length === 0
              }
              error={errors.city as FieldError}
            />
          </>
        ) : (
          <>
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
          </>
        )}
        <div className="flex flex-col gap-1">
          <CustomInput
            label="Correo ARCO de contacto"
            placeholder="Ej. atencion@empresa.com"
            {...register("public_contact_email")}
            error={errors.public_contact_email}
          />
          <p className="text-xs text-stone-400 pl-2">
            Es el correo que se publica en la política de privacidad de tu empresa.
          </p>
        </div>
        <CustomInput
          label="URL Portal ARCO"
          placeholder="Ej. https://empresa.com/arco"
          {...register("arco_portal_contact")}
          error={errors.arco_portal_contact}
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
