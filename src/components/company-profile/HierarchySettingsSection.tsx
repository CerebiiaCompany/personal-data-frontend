"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Icon } from "@iconify/react";
import CustomToggle from "@/components/forms/CustomToggle";
import ProfileSectionCard from "./ProfileSectionCard";
import { updateCompanySettings } from "@/lib/company.api";
import { useOwnCompanyStore } from "@/store/useOwnCompanyStore";
import { CompanyProfile } from "@/types/company.types";
import { parseApiError } from "@/utils/parseApiError";
import { useHashSectionFocus } from "@/hooks/useHashSectionFocus";

// Item OBS-176 (AREA-01): ancla para el link "Ir a configuración de empresa"
// de AreaHierarchyGate.tsx — mismo patrón que
// DATA_PROTECTION_OFFICER_SECTION_ID (DataProtectionOfficerSection.tsx).
export const HIERARCHY_SETTINGS_SECTION_ID = "jerarquias-organizacionales";

const schema = z.object({
  usesAreaHierarchy: z.boolean().optional(),
  usesSiteHierarchy: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

// Item CHK-055/056 (auditoría 2026-08-26/27): switches que activan/desactivan
// las jerarquías de Área y Sede para la empresa. Cuando están apagados (valor
// por defecto), CreateCompanyUserForm.tsx oculta los campos correspondientes.
const HierarchySettingsSection = ({ companyId, profile }: Props) => {
  useHashSectionFocus(HIERARCHY_SETTINGS_SECTION_ID);
  const [loading, setLoading] = React.useState(false);
  const setCompany = useOwnCompanyStore((store) => store.setCompany);
  const company = useOwnCompanyStore((store) => store.company);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { usesAreaHierarchy: false, usesSiteHierarchy: false },
  });
  const usesSiteHierarchy = watch("usesSiteHierarchy");

  useEffect(() => {
    if (!profile) return;
    reset({
      usesAreaHierarchy: profile.usesAreaHierarchy ?? false,
      usesSiteHierarchy: profile.usesSiteHierarchy ?? false,
    });
  }, [profile, reset]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await updateCompanySettings(companyId, {
      usesAreaHierarchy: values.usesAreaHierarchy,
      usesSiteHierarchy: values.usesSiteHierarchy,
    });
    setLoading(false);

    if (res.error) return toast.error(parseApiError(res.error));

    // Refleja el cambio de inmediato en useOwnCompanyStore, que es lo que
    // CreateCompanyUserForm.tsx lee para decidir si mostrar Área/Sede.
    if (company) {
      setCompany({
        ...company,
        usesAreaHierarchy: res.data?.usesAreaHierarchy,
        usesSiteHierarchy: res.data?.usesSiteHierarchy,
      });
    }

    // Item OBS-177 (31 ago 2026): sin este reset, isDirty quedaba en true
    // para siempre después de un guardado exitoso (RHF compara contra el
    // último valor pasado a reset()/defaultValues, no contra "lo guardado
    // recién"), así que la advertencia de "cambios sin guardar" de abajo
    // nunca se apagaría tras guardar.
    reset({
      usesAreaHierarchy: res.data?.usesAreaHierarchy ?? values.usesAreaHierarchy,
      usesSiteHierarchy: res.data?.usesSiteHierarchy ?? values.usesSiteHierarchy,
    });

    toast.success("Configuración de jerarquías actualizada");
  }

  return (
    <div id={HIERARCHY_SETTINGS_SECTION_ID} className="scroll-mt-6">
    <ProfileSectionCard
      icon="tabler:sitemap"
      title="Jerarquías organizacionales"
      description="Activa estas opciones solo si tu empresa realmente organiza a sus usuarios por áreas/equipos o por sedes/ubicaciones. Si están apagadas, esos campos no aparecerán al crear o editar usuarios."
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
    >
      <div className="flex flex-col gap-4">
        {/* Item OBS-177 (31 ago 2026): el cliente reportó que activar el
            switch sin guardar es confuso — el toggle se ve "encendido" pero
            nada cambió todavía en el servidor (por diseño: "Crear Área"
            sigue oculto hasta guardar, porque se controla por el valor
            guardado en useOwnCompanyStore, no por este form local). Esta
            advertencia hace explícito ese estado intermedio en vez de dejar
            que el usuario asuma que ya quedó activo. */}
        {isDirty && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <Icon
              icon="tabler:alert-triangle"
              className="mt-0.5 shrink-0 text-xl text-amber-600"
            />
            <p className="text-sm text-amber-900">
              Tienes cambios sin guardar. Hasta que hagas clic en{" "}
              <strong>&quot;Guardar cambios&quot;</strong>, la configuración
              seguirá como estaba antes (por ejemplo, &quot;Crear Área&quot;
              no aparecerá si el interruptor todavía no se ha guardado).
            </p>
          </div>
        )}
        <Controller
          name="usesAreaHierarchy"
          control={control}
          render={({ field }) => (
            <CustomToggle
              label="Mi empresa usa áreas o equipos funcionales"
              checked={field.value ?? false}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <Controller
          name="usesSiteHierarchy"
          control={control}
          render={({ field }) => (
            <CustomToggle
              label="Mi empresa opera en múltiples sedes o ubicaciones"
              checked={field.value ?? false}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        {/* Item CHK-056 (sprint de cierre 2026-08-28): el feature de Sedes
            (CompanySite/companySiteId) nunca se construyó — el switch solo
            reserva la preferencia. Ver TODO junto a usesSiteHierarchy en
            schema.prisma. CreateCompanyUserForm.tsx NO muestra un campo
            "Sede" aunque este switch esté activo, precisamente porque no
            existe el modelo. */}
        {usesSiteHierarchy && (
          <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <Icon
              icon="tabler:info-circle"
              className="mt-0.5 shrink-0 text-xl text-blue-600"
            />
            <p className="text-sm text-blue-900">
              La gestión de sedes está en desarrollo. Por ahora puede activar esta
              opción para reservar el permiso — los campos estarán disponibles
              próximamente.
            </p>
          </div>
        )}
      </div>
    </ProfileSectionCard>
    </div>
  );
};

export default HierarchySettingsSection;
