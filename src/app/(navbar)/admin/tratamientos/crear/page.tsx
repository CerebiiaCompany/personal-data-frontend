"use client";

import TreatmentForm from "@/components/treatments/TreatmentForm";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { Treatment } from "@/types/treatment.types";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const NAVY = "#1A2B5B";

export default function CreateTreatmentPage() {
  const companyId = useActiveCompanyId();
  const router = useRouter();
  const { can, permissionsLoaded } = usePermissionCheck();

  const allowed = can("treatments.create");

  useEffect(() => {
    if (permissionsLoaded && !allowed) {
      router.replace("/sin-acceso");
    }
  }, [permissionsLoaded, allowed, router]);

  if (!companyId || !allowed) return null;

  function handleSaved(treatment: Treatment) {
    router.push(`/admin/tratamientos/${treatment.id}`);
  }

  return (
    <div className="flex min-h-full w-full flex-col bg-[#F8FAFC]">
      <div className="w-full px-5 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
          <Link href="/admin" className="hover:underline">
            Inicio
          </Link>
          <Icon icon="tabler:chevron-right" className="text-base text-[#94A3B8]" />
          <Link href="/admin/tratamientos" className="hover:underline">
            Tratamientos
          </Link>
          <Icon icon="tabler:chevron-right" className="text-base text-[#94A3B8]" />
          <span className="font-semibold" style={{ color: NAVY }}>
            Nuevo
          </span>
        </nav>
        <h1
          className="text-[24px] font-bold tracking-tight sm:text-[26px]"
          style={{ color: NAVY }}
        >
          Nuevo tratamiento
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[#64748B]">
          Se creará como borrador. Podrás completar la información y activarlo
          cuando esté listo.
        </p>
      </div>

      <div className="w-full px-5 py-6 sm:px-6 sm:py-7 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto w-full max-w-3xl">
          <TreatmentForm
            companyId={companyId}
            mode="create"
            onSaved={handleSaved}
            onCancel={() => router.push("/admin/tratamientos")}
          />
        </div>
      </div>
    </div>
  );
}
