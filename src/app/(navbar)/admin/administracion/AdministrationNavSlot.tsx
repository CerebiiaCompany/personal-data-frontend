"use client";

import AdministrationPageSelector from "@/components/administration/AdministrationPageSelector";
import { usePathname } from "next/navigation";

/** Pestañas Usuarios / Áreas / Roles: no en la portada de Administración (ya hay accesos rápidos). */
export default function AdministrationNavSlot() {
  const pathname = usePathname();
  if (pathname === "/admin/administracion") return null;

  return (
    <div className="w-full shrink-0 px-5 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <AdministrationPageSelector />
    </div>
  );
}
