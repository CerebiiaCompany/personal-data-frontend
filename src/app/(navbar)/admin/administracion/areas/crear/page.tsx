"use client";

import CreateCompanyAreaForm from "@/components/administration/CreateCompanyAreaForm";
import CreateCompanyUserForm from "@/components/administration/CreateCompanyUserForm";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdministrationCreateAreaPage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();

  return (
    <div className="w-full p-3 sm:p-4 md:p-5 rounded-md border border-disabled flex flex-col gap-6 sm:gap-8 md:gap-10 items-center">
      <header className="w-full flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-between sm:items-center">
        <div className="flex gap-2 justify-center sm:justify-start">
          <Link
            href={"/admin/administracion/areas"}
            className="flex items-center gap-2 text-primary-900 font-medium text-xs sm:text-sm"
          >
            <div className="w-fit bg-primary-900 rounded-md text-white p-1">
              <Icon icon={"tabler:chevron-left"} className="text-xl sm:text-2xl" />
            </div>
            Volver
          </Link>
        </div>
        <h4 className="font-semibold text-lg sm:text-xl text-primary-900 w-full text-center">
          Crear Nueva Área
        </h4>
      </header>

      <CreateCompanyAreaForm />
    </div>
  );
}
