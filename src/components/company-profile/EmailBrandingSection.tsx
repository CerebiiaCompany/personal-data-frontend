"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

import CustomInput from "@/components/forms/CustomInput";
import Button from "@/components/base/Button";
import ProfileSectionCard from "./ProfileSectionCard";
import EmailBrandingPreview from "./EmailBrandingPreview";
import { deleteCompanyEmailBrandingLogo, updateCompanyEmailBranding } from "@/lib/company.api";
import { uploadCompanyEmailBrandingLogo } from "@/lib/upload.api";
import { CompanyProfile } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const DEFAULT_COLOR = "#3B6FF5";
const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const MAX_LOGO_SIZE_MB = 2;

const DEFAULT_TITLE_COLOR = "#0F172A";

const schema = z.object({
  primary_color: z
    .string()
    .optional()
    .refine((v) => !v || HEX_COLOR_REGEX.test(v), {
      message: "Debe ser un color hexadecimal válido, ej. #3B6FF5",
    }),
  header_style: z.enum(["LIGHT", "SOLID"]),
  title_auto: z.boolean(),
  title_color: z
    .string()
    .optional()
    .refine((v) => !v || HEX_COLOR_REGEX.test(v), {
      message: "Debe ser un color hexadecimal válido, ej. #0F172A",
    }),
});

const HEADER_STYLE_OPTIONS: {
  value: "LIGHT" | "SOLID";
  title: string;
  description: string;
}[] = [
  {
    value: "LIGHT",
    title: "Moderno (claro)",
    description: "Fondo blanco con una franja de tu color. Se ve bien con cualquier color.",
  },
  {
    value: "SOLID",
    title: "Bloque de color",
    description: "Encabezado completo con tu color de marca.",
  },
];

type FormValues = z.infer<typeof schema>;

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

const EmailBrandingSection = ({ companyId, profile }: Props) => {
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoDeleting, setLogoDeleting] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null | undefined>(
    profile?.brandLogoUrl
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      primary_color: DEFAULT_COLOR,
      header_style: "LIGHT",
      title_auto: true,
      title_color: DEFAULT_TITLE_COLOR,
    },
  });

  const primaryColor = watch("primary_color") || DEFAULT_COLOR;
  const swatchColor =
    HEX_COLOR_REGEX.test(primaryColor) && primaryColor.length === 7
      ? primaryColor
      : DEFAULT_COLOR;
  const headerStyle = watch("header_style");
  const titleAuto = watch("title_auto");
  const titleColorValue = watch("title_color") || DEFAULT_TITLE_COLOR;
  const titleSwatch =
    HEX_COLOR_REGEX.test(titleColorValue) && titleColorValue.length === 7
      ? titleColorValue
      : DEFAULT_TITLE_COLOR;

  useEffect(() => {
    if (!profile) return;
    reset({
      primary_color: profile.brandPrimaryColor || DEFAULT_COLOR,
      header_style: profile.brandEmailHeaderStyle === "SOLID" ? "SOLID" : "LIGHT",
      title_auto: !profile.brandEmailTitleColor,
      title_color: profile.brandEmailTitleColor || DEFAULT_TITLE_COLOR,
    });
    setLogoUrl(profile.brandLogoUrl);
  }, [profile, reset]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await updateCompanyEmailBranding(companyId, {
      primary_color: values.primary_color || null,
      header_style: values.header_style,
      title_color: values.title_auto ? null : values.title_color || null,
    });
    setLoading(false);

    if (res.error) return toast.error(parseApiError(res.error));
    toast.success("Marca de correos actualizada");
  }

  async function handleLogoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      toast.error("Formato no permitido. Usa PNG, JPEG o SVG.");
      return;
    }
    if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
      toast.error(`El logo no debe superar ${MAX_LOGO_SIZE_MB}MB.`);
      return;
    }

    setLogoUploading(true);
    const res = await uploadCompanyEmailBrandingLogo(companyId, file);
    setLogoUploading(false);

    if (res.error) return toast.error(parseApiError(res.error));
    setLogoUrl(res.data?.brandLogoUrl ?? null);
    toast.success("Logo actualizado");
  }

  async function handleLogoDelete() {
    setLogoDeleting(true);
    const res = await deleteCompanyEmailBrandingLogo(companyId);
    setLogoDeleting(false);

    if (res.error) return toast.error(parseApiError(res.error));
    setLogoUrl(null);
    toast.success("Logo eliminado. Los correos se enviarán sin logo.");
  }

  return (
    <ProfileSectionCard
      icon="tabler:palette"
      title="Marca en correos electrónicos"
      description="Personaliza el color y el logo que verán tus usuarios en los correos de código de verificación, campañas de marketing y de consentimiento."
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
    >
      <div className="flex flex-col gap-2">
        <p className="font-medium pl-2 text-stone-500 text-sm">
          Logo de la empresa
        </p>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E8EDF7] bg-[#F8FAFC]">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Logo de la empresa"
                className="h-full w-full object-contain"
              />
            ) : (
              <Icon icon="tabler:photo" className="text-2xl text-[#94A3B8]" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                hierarchy="secondary"
                type="button"
                loading={logoUploading}
                disabled={logoDeleting}
                onClick={() => fileInputRef.current?.click()}
              >
                {logoUrl ? "Cambiar logo" : "Subir logo"}
              </Button>
              {logoUrl && (
                <Button
                  hierarchy="secondary"
                  type="button"
                  loading={logoDeleting}
                  disabled={logoUploading}
                  onClick={handleLogoDelete}
                >
                  Eliminar logo
                </Button>
              )}
            </div>
            <p className="text-xs text-[#64748B]">
              PNG, JPEG o SVG. Máximo {MAX_LOGO_SIZE_MB}MB.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="hidden"
            onChange={handleLogoSelected}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-medium pl-2 text-stone-500 text-sm">
          Color de marca
        </p>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={swatchColor}
            onChange={(e) =>
              setValue("primary_color", e.target.value, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[#E8EDF7] bg-transparent p-1"
          />
          <CustomInput
            placeholder="Ej. #3B6FF5"
            className="max-w-[200px]"
            {...register("primary_color")}
            error={errors.primary_color}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-medium pl-2 text-stone-500 text-sm">Estilo del encabezado</p>
        <div role="radiogroup" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {HEADER_STYLE_OPTIONS.map((opt) => {
            const selected = headerStyle === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() =>
                  setValue("header_style", opt.value, { shouldDirty: true, shouldValidate: true })
                }
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                  selected
                    ? "border-[#1A2B5B] bg-[#EEF2FF]"
                    : "border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]"
                }`}
              >
                <span
                  className="mt-0.5 flex h-9 w-12 shrink-0 flex-col overflow-hidden rounded-md border border-[#E2E8F0] bg-white"
                  aria-hidden
                >
                  {opt.value === "LIGHT" ? (
                    <>
                      <span className="h-1" style={{ backgroundColor: swatchColor }} />
                      <span className="mx-1.5 mt-1.5 h-1 w-6 rounded bg-[#0f172a]" />
                    </>
                  ) : (
                    <span className="h-5" style={{ backgroundColor: swatchColor }} />
                  )}
                </span>
                <span>
                  <span className="block text-[13px] font-semibold text-[#0B1737]">{opt.title}</span>
                  <span className="block text-xs text-[#64748B]">{opt.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-medium pl-2 text-stone-500 text-sm">Color del título (asunto)</p>
        <label className="flex cursor-pointer items-center gap-2 pl-2 text-sm text-[#334155]">
          <input
            type="checkbox"
            checked={titleAuto}
            onChange={(e) =>
              setValue("title_auto", e.target.checked, { shouldDirty: true, shouldValidate: true })
            }
            className="h-4 w-4 accent-[#1A2B5B]"
          />
          Automático (siempre legible según el estilo)
        </label>
        {!titleAuto && (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={titleSwatch}
              onChange={(e) =>
                setValue("title_color", e.target.value, { shouldValidate: true, shouldDirty: true })
              }
              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[#E8EDF7] bg-transparent p-1"
            />
            <CustomInput
              placeholder="Ej. #0F172A"
              className="max-w-[200px]"
              {...register("title_color")}
              error={errors.title_color}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-medium pl-2 text-stone-500 text-sm">Vista previa</p>
        <EmailBrandingPreview
          primaryColor={swatchColor}
          headerStyle={headerStyle}
          titleColor={titleAuto ? null : titleSwatch}
          logoUrl={logoUrl}
          companyName={profile?.name || "Tu empresa"}
        />
        <p className="pl-2 text-xs text-[#94A3B8]">
          Los cambios aplican a las campañas, solicitudes de consentimiento y a los correos que
          aún estén en cola.
        </p>
      </div>
    </ProfileSectionCard>
  );
};

export default EmailBrandingSection;
