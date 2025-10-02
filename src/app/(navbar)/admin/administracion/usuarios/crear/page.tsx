"use client";

import AdministrationPageSelector from "@/components/administration/AdministrationPageSelector";
import CompanyUsersTable from "@/components/administration/CompanyUsersTable";
import CreateCompanyUserForm from "@/components/administration/CreateCompanyUserForm";
import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdministrationCreateUserPage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();

  return (
    <div className="w-full p-4 rounded-md border border-disabled flex flex-col gap-10 items-center">
      <header className="w-full flex gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Link
            href={"/admin/administracion/usuarios"}
            className="flex items-center gap-2 text-primary-900 font-medium text-sm"
          >
            <div className="w-fit bg-primary-900 rounded-md text-white p-1">
              <Icon icon={"tabler:chevron-left"} className="text-2xl" />
            </div>
            Volver
          </Link>
        </div>
        <h4 className="font-semibold text-xl text-primary-900 w-full text-center">
          Crear Nuevo Usuario
        </h4>
      </header>

      <CreateCompanyUserForm />
    </div>
  );
}
