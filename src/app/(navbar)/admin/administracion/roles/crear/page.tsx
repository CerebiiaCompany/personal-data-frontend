"use client";

import CreateCompanyAreaForm from "@/components/administration/CreateCompanyAreaForm";
import CreateCompanyRoleForm from "@/components/administration/CreateCompanyRoleForm";
import CreateCompanyUserForm from "@/components/administration/CreateCompanyUserForm";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdministrationCreateRolePage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();

  // Solo COMPANY_ADMIN y SUPERADMIN pueden crear roles
  useEffect(() => {
    if (user && user.role !== "COMPANY_ADMIN" && user.role !== "SUPERADMIN") {
      router.push("/sin-acceso");
    }
  }, [user, router]);

  return (
    <div className="w-full p-3 sm:p-4 md:p-5 rounded-md border border-disabled flex flex-col gap-6 sm:gap-8 md:gap-10 items-center">
      <header className="w-full flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-between sm:items-center">
        <div className="flex gap-2 justify-center sm:justify-start">
          <Link
            href={"/admin/administracion/roles"}
            className="flex items-center gap-2 text-primary-900 font-medium text-xs sm:text-sm"
          >
            <div className="w-fit bg-primary-900 rounded-md text-white p-1">
              <Icon icon={"tabler:chevron-left"} className="text-xl sm:text-2xl" />
            </div>
            Volver
          </Link>
        </div>
        <h4 className="font-semibold text-lg sm:text-xl text-primary-900 w-full text-center">
          Crear Nuevo Rol
        </h4>
      </header>

      <CreateCompanyRoleForm />
    </div>
  );
}
