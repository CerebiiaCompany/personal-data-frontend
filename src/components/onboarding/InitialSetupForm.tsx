"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import Button from "@/components/base/Button";
import { completeInitialSetup, InitialSetupCompany } from "@/lib/initialSetup.api";
import { COMPANY_COUNTRY_CODE_OPTIONS } from "@/types/company.types";
import {
  formatRutDisplay,
  isValidRut,
  normalizeRut,
  RUT_INVALID_MESSAGE,
} from "@/utils/rutValidator";
import { parseApiError } from "@/utils/parseApiError";
import { useJurisdictionGeographicDivisions } from "@/hooks/useJurisdictionGeographicDivisions";

// OBS-03b (ONB-01): mismo idioma superRefine + isValidRut/RUT_INVALID_MESSAGE
// que createCompanyValidationSchema, IdentificationSection.tsx y
// LegalRepresentativeSection.tsx — hereda la validación estricta de módulo 11
// para ambos campos RUT (empresa y representante legal) cuando el país es CL.
function buildInitialSetupSchema(isChile: boolean) {
  return z
    .object({
      name: z.string().min(1, "El nombre de la empresa es requerido"),
      nit: z.string().min(1, "Requerido"),
      email: z.string().min(1, "Requerido").email("Correo inválido"),
      managerName: z.string().min(1, "El nombre del representante legal es requerido"),
      managerDocNumber: z.string().min(1, "Requerido"),
      countryCode: z.string().min(1, "Requerido"),
      // Item CHK-137/CHK-129: campos 7-10 de ONB-01 — opcionales a nivel de
      // schema porque solo son obligatorios cuando countryCode==='CL'
      // (enforced abajo en superRefine, igual que nit/managerDocNumber).
      regionName: z.string().optional(),
      provinceName: z.string().optional(),
      communeName: z.string().optional(),
      address: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!isChile) return;
      if (!isValidRut(data.nit)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["nit"], message: RUT_INVALID_MESSAGE });
      }
      if (!isValidRut(data.managerDocNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["managerDocNumber"],
          message: RUT_INVALID_MESSAGE,
        });
      }
      if (!data.regionName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["regionName"], message: "Requerido" });
      }
      if (!data.provinceName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["provinceName"], message: "Requerido" });
      }
      if (!data.communeName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["communeName"], message: "Requerido" });
      }
      if (!data.address) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["address"], message: "Requerido" });
      }
    });
}

type FormValues = z.infer<ReturnType<typeof buildInitialSetupSchema>>;

interface Props {
  companyId: string;
  initialCompany: InitialSetupCompany;
  onCompleted: () => void;
}

export default function InitialSetupForm({ companyId, initialCompany, onCompleted }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [countryCode, setCountryCode] = React.useState(initialCompany.countryCode || "CO");
  const isChile = countryCode === "CL";

  const schema = React.useMemo(() => buildInitialSetupSchema(isChile), [isChile]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: initialCompany.name ?? "",
      nit: initialCompany.nit ?? "",
      email: initialCompany.email ?? "",
      managerName: initialCompany.manager?.name ?? "",
      managerDocNumber: initialCompany.manager?.docNumber ?? "",
      countryCode: initialCompany.countryCode ?? "CO",
      regionName: initialCompany.regionName ?? "",
      provinceName: initialCompany.provinceName ?? "",
      communeName: initialCompany.communeName ?? "",
      address: initialCompany.address ?? "",
    },
  });

  const nitValue = watch("nit") ?? "";
  const managerDocValue = watch("managerDocNumber") ?? "";

  // Item CHK-137/CHK-129: mismo patrón Región→Provincia→Comuna que
  // CreateCompanyAreaForm.tsx:254-297, sobre jurisdiction_geographic_divisions.
  const { regionOptions, getProvinciaOptions, getComunaOptions } =
    useJurisdictionGeographicDivisions("CL");
  const selectedRegionName = watch("regionName") ?? "";
  const selectedProvinceName = watch("provinceName") ?? "";
  const provinciaOptions = React.useMemo(
    () => getProvinciaOptions(selectedRegionName),
    [getProvinciaOptions, selectedRegionName]
  );
  const comunaOptions = React.useMemo(
    () => getComunaOptions(selectedRegionName, selectedProvinceName),
    [getComunaOptions, selectedRegionName, selectedProvinceName]
  );

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await completeInitialSetup(companyId, {
      name: values.name,
      nit: isChile ? normalizeRut(values.nit) : values.nit,
      email: values.email,
      countryCode: values.countryCode,
      managerName: values.managerName,
      managerDocNumber: isChile ? normalizeRut(values.managerDocNumber) : values.managerDocNumber,
      regionName: values.regionName || undefined,
      provinceName: values.provinceName || undefined,
      communeName: values.communeName || undefined,
      address: values.address || undefined,
    });
    setLoading(false);

    if (res.error) return toast.error(parseApiError(res.error));
    toast.success("Configuración inicial completada");
    onCompleted();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#0F172A]/60 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-2xl rounded-2xl border border-[#E8EDF7] bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start gap-3">
          <Icon icon="tabler:building-skyscraper" className="mt-0.5 text-2xl text-[#1A2B5B]" />
          <div>
            <h2 className="text-lg font-bold text-[#1A2B5B]">Configuración inicial requerida</h2>
            <p className="mt-1 text-sm text-stone-500">
              Antes de continuar, confirma los datos de tu empresa. Esta información es
              indispensable para generar tu Política de Privacidad.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CustomInput
            label="Nombre de la empresa"
            placeholder="Ej. Frontera Celular S.A.S"
            {...register("name")}
            error={errors.name}
          />
          <div className="flex flex-col gap-1">
            <CustomSelect
              label="País de operación"
              options={COMPANY_COUNTRY_CODE_OPTIONS}
              value={watch("countryCode")}
              onChange={(value) => {
                setValue("countryCode", value, { shouldValidate: true, shouldDirty: true });
                setCountryCode(value);
              }}
            />
            {errors.countryCode && (
              <span className="text-sm font-semibold text-red-400">
                {errors.countryCode.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <CustomInput
              label={isChile ? "RUT de la empresa" : "NIT de la empresa"}
              placeholder={isChile ? "Ej. 76.123.456-7" : "Ej. 820507899-5"}
              value={nitValue}
              onChange={(e) => {
                const val = isChile ? formatRutDisplay(e.target.value) : e.target.value;
                setValue("nit", val, { shouldValidate: true, shouldDirty: true });
              }}
              error={errors.nit}
            />
          </div>
          <CustomInput
            label="Correo de contacto público"
            type="email"
            placeholder="Ej. contacto@empresa.com"
            {...register("email")}
            error={errors.email}
          />
          <CustomInput
            label="Nombre del representante legal"
            placeholder="Ej. María Pérez"
            {...register("managerName")}
            error={errors.managerName}
          />
          <div className="flex flex-col gap-1">
            <CustomInput
              label={isChile ? "RUT del representante legal" : "Documento del representante legal"}
              placeholder={isChile ? "Ej. 12.345.678-K" : "Ej. 1020304050"}
              value={managerDocValue}
              onChange={(e) => {
                const val = isChile ? formatRutDisplay(e.target.value) : e.target.value;
                setValue("managerDocNumber", val, { shouldValidate: true, shouldDirty: true });
              }}
              error={errors.managerDocNumber}
            />
          </div>
          {isChile ? (
            <>
              <div className="flex flex-col gap-1">
                <CustomSelect
                  label="Región"
                  options={regionOptions}
                  value={watch("regionName")}
                  unselectedText="Seleccionar Región"
                  onChange={(val) => {
                    setValue("regionName", val, { shouldValidate: true, shouldDirty: true });
                    setValue("provinceName", "", { shouldValidate: true });
                    setValue("communeName", "", { shouldValidate: true });
                  }}
                />
                {errors.regionName && (
                  <span className="text-sm font-semibold text-red-400">
                    {errors.regionName.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <CustomSelect
                  label="Provincia"
                  options={provinciaOptions}
                  value={watch("provinceName")}
                  unselectedText={
                    selectedRegionName ? "Seleccionar Provincia" : "Selecciona una Región primero"
                  }
                  disabled={!selectedRegionName}
                  onChange={(val) => {
                    setValue("provinceName", val, { shouldValidate: true, shouldDirty: true });
                    setValue("communeName", "", { shouldValidate: true });
                  }}
                />
                {errors.provinceName && (
                  <span className="text-sm font-semibold text-red-400">
                    {errors.provinceName.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <CustomSelect
                  label="Comuna"
                  options={comunaOptions}
                  value={watch("communeName")}
                  unselectedText={
                    selectedRegionName ? "Seleccionar Comuna" : "Selecciona una Región primero"
                  }
                  disabled={!selectedRegionName || comunaOptions.length === 0}
                  onChange={(val) =>
                    setValue("communeName", val, { shouldValidate: true, shouldDirty: true })
                  }
                />
                {errors.communeName && (
                  <span className="text-sm font-semibold text-red-400">
                    {errors.communeName.message}
                  </span>
                )}
              </div>
              <CustomInput
                label="Dirección"
                placeholder="Ej. Av. Providencia 1234, oficina 501"
                {...register("address")}
                error={errors.address}
              />
            </>
          ) : (
            <>
              <CustomInput
                label="Región (opcional)"
                placeholder="No aplica"
                {...register("regionName")}
              />
              <CustomInput
                label="Provincia (opcional)"
                placeholder="No aplica"
                {...register("provinceName")}
              />
              <CustomInput
                label="Comuna (opcional)"
                placeholder="No aplica"
                {...register("communeName")}
              />
              <CustomInput
                label="Dirección (opcional)"
                placeholder="No aplica"
                {...register("address")}
                error={errors.address}
              />
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            loading={loading}
            className="rounded-xl! border-[#1A2B5B]! bg-[#1A2B5B]! px-6! py-2.5! text-[13px]! font-semibold! text-white!"
          >
            Guardar y continuar
          </Button>
        </div>
      </form>
    </div>
  );
}
