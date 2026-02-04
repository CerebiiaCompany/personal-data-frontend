"use client";

import AdministrationPageSelector from "@/components/administration/AdministrationPageSelector";
import CompanyUsersTable from "@/components/administration/CompanyUsersTable";
import CreateCompanyAreaForm from "@/components/administration/CreateCompanyAreaForm";
import CreateCompanyRoleForm from "@/components/administration/CreateCompanyRoleForm";
import CreateCompanyUserForm from "@/components/administration/CreateCompanyUserForm";
import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import LoadingCover from "@/components/layout/LoadingCover";
import { useCompanyAreas } from "@/hooks/useCompanyAreas";
import { useCompanyRoles } from "@/hooks/useCompanyRoles";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useSessionStore } from "@/store/useSessionStore";
import { CompanyArea } from "@/types/companyArea.types";
import { CompanyRole } from "@/types/companyRole.types";
import { SessionUser, UpdateUser } from "@/types/user.types";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdministrationUpdateRolePage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();
  const roleId = useParams().roleId?.toString();

  // Solo COMPANY_ADMIN y SUPERADMIN pueden editar roles
  useEffect(() => {
    if (user && user.role !== "COMPANY_ADMIN" && user.role !== "SUPERADMIN") {
      router.push("/sin-acceso");
    }
  }, [user, router]);

  const { data, loading, error } = useCompanyRoles<CompanyRole>({
    companyId: user?.companyUserData?.companyId,
    id: roleId,
  });

  console.log(data);

  return (
    <div className="w-full p-4 rounded-md border border-disabled flex flex-col gap-10 items-center">
      <header className="w-full flex gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Link
            href={"/admin/administracion/roles"}
            className="flex items-center gap-2 text-primary-900 font-medium text-sm"
          >
            <div className="w-fit bg-primary-900 rounded-md text-white p-1">
              <Icon icon={"tabler:chevron-left"} className="text-2xl" />
            </div>
            Volver
          </Link>
        </div>
        <h4 className="font-semibold text-xl text-primary-900 w-full text-center">
          Actualizar Rol
        </h4>
      </header>

      {loading && (
        <div className="min-h-20 relative w-full">
          <LoadingCover />
        </div>
      )}
      {error && <p>{error}</p>}
      {data && <CreateCompanyRoleForm initialValues={data} />}
    </div>
  );
}
