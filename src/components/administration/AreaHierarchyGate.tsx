"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useOwnCompanyStore } from "@/store/useOwnCompanyStore";
import LoadingCover from "@/components/layout/LoadingCover";

interface Props {
  children: React.ReactNode;
}

// Item OBS-176 (requerimiento AREA-01): el switch "Mi empresa usa áreas o
// equipos funcionales" (Company.usesAreaHierarchy, HierarchySettingsSection.tsx)
// debe ser la ÚNICA fuente de verdad para el acceso a Áreas — antes solo
// ocultaba el campo Área en CreateCompanyUserForm.tsx, pero /admin/administracion/
// areas, /areas/crear y /areas/[areaId] seguían accesibles sin importar el
// switch (por el menú, por Accesos Rápidos, o navegando la URL directo).
// Este gate se monta en las 3 páginas de Áreas y es el punto único de
// aplicación real — ocultar los botones/tabs de entrada (AdministrationPageSelector.tsx,
// administracion/page.tsx) es solo UX, esto es lo que efectivamente bloquea.
export default function AreaHierarchyGate({ children }: Props) {
  const company = useOwnCompanyStore((store) => store.company);

  // Item OBS-176: mientras useOwnCompanyStore.company todavía no cargó
  // (AuthHydrator.tsx está en curso — puede pasar en cualquier carga fría,
  // ej. F5 directo en esta página) NO se debe mostrar el bloqueo: eso
  // denegaría el acceso a un usuario legítimo con el switch encendido solo
  // porque el fetch aún no terminó. Se distingue "todavía no sabemos"
  // (company === undefined → loader) de "ya sabemos que está apagado"
  // (company cargado y usesAreaHierarchy !== true → bloqueo real).
  if (company === undefined) {
    return (
      <div className="relative flex min-h-[240px] w-full flex-1 items-center justify-center">
        <LoadingCover />
      </div>
    );
  }

  if (company.usesAreaHierarchy === true) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 bg-[#F8FAFC] px-5 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <Icon icon="tabler:building-community" className="text-3xl" />
      </span>
      <div className="flex max-w-md flex-col gap-1.5">
        <h1 className="text-lg font-bold text-[#1A2B5B]">
          Tu empresa no usa áreas o equipos funcionales
        </h1>
        <p className="text-sm text-[#64748B]">
          Esta sección está desactivada porque el switch &quot;Mi empresa usa
          áreas o equipos funcionales&quot; está apagado. Actívalo en el perfil
          de empresa para gestionar áreas.
        </p>
      </div>
      <Link
        href="/admin/administracion/perfil-empresa#jerarquias-organizacionales"
        className="inline-flex items-center gap-2 rounded-xl border border-[#1A2B5B] bg-[#1A2B5B] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#13224a]"
      >
        <Icon icon="tabler:settings" className="text-base" />
        Ir a configuración de empresa
      </Link>
    </div>
  );
}
