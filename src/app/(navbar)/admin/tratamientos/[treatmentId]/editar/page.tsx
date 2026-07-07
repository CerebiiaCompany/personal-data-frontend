"use client";

import Button from "@/components/base/Button";
import TreatmentForm from "@/components/treatments/TreatmentForm";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { useTreatment } from "@/hooks/useTreatment";
import { Treatment } from "@/types/treatment.types";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const NAVY = "#1A2B5B";

export default function EditTreatmentPage() {
  const params = useParams();
  const treatmentId = params.treatmentId as string;
  const companyId = useActiveCompanyId();
  const router = useRouter();
  const { can, permissionsLoaded } = usePermissionCheck();

  const allowed = can("treatments.edit");

  const { data, loading } = useTreatment({
    companyId,
    treatmentId,
    enabled: allowed,
  });

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
          <Link href="/admin/tratamientos" className="hover:underline">
            Tratamientos
          </Link>
          <Icon icon="tabler:chevron-right" className="text-base text-[#94A3B8]" />
          <Link
            href={`/admin/tratamientos/${treatmentId}`}
            className="hover:underline"
          >
            Detalle
          </Link>
          <Icon icon="tabler:chevron-right" className="text-base text-[#94A3B8]" />
          <span className="font-semibold" style={{ color: NAVY }}>
            Editar
          </span>
        </nav>
        <h1
          className="text-[24px] font-bold tracking-tight sm:text-[26px]"
          style={{ color: NAVY }}
        >
          Editar tratamiento
        </h1>
        {data?.status === "ARCHIVED" && (
          <p className="mt-2 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-xs text-amber-950">
            <Icon icon="tabler:archive" className="mt-0.5 text-base" />
            Este tratamiento está archivado. Editar su contenido no cambia su
            estado.
          </p>
        )}
      </div>

      <div className="w-full px-5 py-6 sm:px-6 sm:py-7 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto w-full max-w-3xl">
          {loading && !data ? (
            <div className="flex flex-col gap-4">
              <div className="h-40 w-full animate-pulse rounded-2xl bg-[#EEF3FB]" />
              <div className="h-56 w-full animate-pulse rounded-2xl bg-[#EEF3FB]" />
            </div>
          ) : data ? (
            <TreatmentForm
              companyId={companyId}
              mode="edit"
              initial={data}
              onSaved={handleSaved}
              onCancel={() =>
                router.push(`/admin/tratamientos/${treatmentId}`)
              }
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <Icon icon="tabler:file-off" className="text-4xl text-[#94A3B8]" />
              <p className="text-sm text-[#64748B]">
                No se encontró el tratamiento.
              </p>
              <Button hierarchy="secondary" href="/admin/tratamientos">
                Volver al listado
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
