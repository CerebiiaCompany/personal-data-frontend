"use client";

import Button from "@/components/base/Button";
import CheckPermission from "@/components/checkers/CheckPermission";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { DeploymentBadge, DpaStatusBadge, RiskLevelBadge } from "@/components/systemInventory/SystemInventoryBadges";
import SystemInventoryDpaPanel from "@/components/systemInventory/SystemInventoryDpaPanel";
import SystemTreatmentLinksPanel from "@/components/systemInventory/SystemTreatmentLinksPanel";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { deleteSystemInventory, fetchSystemInventory } from "@/lib/systemInventory.api";
import { SystemInventory } from "@/types/systemInventory.types";
import { formatInventoryCountry } from "@/utils/systemInventoryCountry";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const NAVY = "#1A2B5B";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</span>
      <div className="text-sm text-[#1A2B5B]">{children}</div>
    </div>
  );
}

const sectionClass =
  "rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6";

export default function SystemInventoryDetailPage() {
  const params = useParams<{ systemId: string }>();
  const systemId = params.systemId;
  const companyId = useActiveCompanyId();
  const router = useRouter();

  const [system, setSystem] = useState<SystemInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!companyId || !systemId) return;
    setLoading(true);
    fetchSystemInventory(companyId, systemId).then((res) => {
      setLoading(false);
      if (res.error) {
        setError(res.error.message ?? "No se pudo cargar el sistema");
        return;
      }
      if (res.data) setSystem(res.data);
    });
  }, [companyId, systemId]);

  async function handleDelete() {
    if (!companyId) return;
    setDeleting(true);
    const res = await deleteSystemInventory(companyId, systemId);
    setDeleting(false);
    setConfirmingDelete(false);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    toast.success("Sistema eliminado");
    router.push("/admin/inventario-sistemas");
  }

  if (loading) {
    return (
      <div className="flex min-h-full w-full flex-col gap-4 bg-[#F8FAFC] p-6">
        <div className="h-24 w-full animate-pulse rounded-2xl bg-[#F1F5FB]" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-[#F1F5FB]" />
      </div>
    );
  }

  if (error || !system) {
    return (
      <div className="flex min-h-full w-full flex-col items-center justify-center gap-2 bg-[#F8FAFC] p-6 text-center">
        <Icon icon="tabler:alert-triangle" className="text-3xl text-rose-400" />
        <p className="text-sm text-[#64748B]">{error ?? "Sistema no encontrado"}</p>
        <Link href="/admin/inventario-sistemas" className="text-sm font-medium text-primary-900 hover:underline">
          Volver al inventario
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-full w-full flex-col bg-[#F8FAFC]">
      <div className="w-full px-5 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
          <Link href="/admin" className="hover:underline">
            Dashboard
          </Link>
          <Icon icon="tabler:chevron-right" className="text-base text-[#94A3B8]" />
          <Link href="/admin/inventario-sistemas" className="hover:underline">
            Inventario de Sistemas
          </Link>
          <Icon icon="tabler:chevron-right" className="text-base text-[#94A3B8]" />
          <span className="font-semibold" style={{ color: NAVY }}>
            {system.name}
          </span>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight sm:text-[26px]" style={{ color: NAVY }}>
              {system.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <DeploymentBadge deployment={system.deployment} />
              <RiskLevelBadge riskLevel={system.riskLevel} />
              <DpaStatusBadge dpaStatus={system.dpaStatus} />
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <CheckPermission group="treatments" permission="edit">
              <Button
                href={`/admin/inventario-sistemas/${system.id}/editar`}
                hierarchy="secondary"
                startContent={<Icon icon="tabler:pencil" className="text-lg" />}
              >
                Editar
              </Button>
              {confirmingDelete ? (
                <>
                  <span className="text-xs text-[#64748B]">¿Eliminar este sistema?</span>
                  <Button hierarchy="tertiary" onClick={() => setConfirmingDelete(false)}>
                    Cancelar
                  </Button>
                  <Button
                    hierarchy="secondary"
                    loading={deleting}
                    onClick={handleDelete}
                    className="border-red-300! text-red-600!"
                  >
                    Confirmar
                  </Button>
                </>
              ) : (
                <Button
                  hierarchy="secondary"
                  onClick={() => setConfirmingDelete(true)}
                  className="border-red-300! text-red-600!"
                  startContent={<Icon icon="tabler:trash" className="text-lg" />}
                >
                  Eliminar
                </Button>
              )}
            </CheckPermission>
          </div>
        </div>
      </div>

      <div className="w-full px-5 py-6 sm:px-6 sm:py-7 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          <section className={sectionClass}>
            <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">Detalle</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoría">{system.category}</Field>
              <Field label="Proveedor">{system.provider || "—"}</Field>
              <Field label="País">{formatInventoryCountry(system.country)}</Field>
              <Field label="¿Un tercero trata estos datos?">{system.hasExternalAccess ? "Sí" : "No"}</Field>
            </div>
            <div className="mt-4">
              <SystemInventoryDpaPanel
                companyId={companyId!}
                system={system}
                onUpdated={(updated) =>
                  setSystem((prev) => (prev ? { ...prev, ...updated, treatments: prev.treatments } : updated))
                }
              />
            </div>
          </section>

          <SystemTreatmentLinksPanel
            companyId={companyId!}
            systemId={system.id}
            links={system.treatments ?? []}
            onChange={(treatments) => setSystem((prev) => (prev ? { ...prev, treatments } : prev))}
          />
        </div>
      </div>
    </div>
  );
}
