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
import { updateCompanyEmailBranding } from "@/lib/company.api";
import { uploadCompanyEmailBrandingLogo } from "@/lib/upload.api";
import { CompanyProfile } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const DEFAULT_COLOR = "#3B6FF5";
const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const MAX_LOGO_SIZE_MB = 2;

const schema = z.object({
  primary_color: z
    .string()
    .optional()
    .refine((v) => !v || HEX_COLOR_REGEX.test(v), {
      message: "Debe ser un color hexadecimal válido, ej. #3B6FF5",
    }),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

const EmailBrandingSection = ({ companyId, profile }: Props) => {
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
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
    defaultValues: { primary_color: DEFAULT_COLOR },
  });

  const primaryColor = watch("primary_color") || DEFAULT_COLOR;
  const swatchColor =
    HEX_COLOR_REGEX.test(primaryColor) && primaryColor.length === 7
      ? primaryColor
      : DEFAULT_COLOR;

  useEffect(() => {
    if (!profile) return;
    reset({ primary_color: profile.brandPrimaryColor || DEFAULT_COLOR });
    setLogoUrl(profile.brandLogoUrl);
  }, [profile, reset]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await updateCompanyEmailBranding(companyId, {
      primary_color: values.primary_color || null,
    });
    setLoading(false);

    if (res.error) return toast.error(parseApiError(res.error));
    toast.success("Color de marca actualizado");
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
            <Button
              hierarchy="secondary"
              type="button"
              loading={logoUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {logoUrl ? "Cambiar logo" : "Subir logo"}
            </Button>
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
    </ProfileSectionCard>
  );
};

export default EmailBrandingSection;
