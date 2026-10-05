"use client";

import SystemInventoryForm from "@/components/systemInventory/SystemInventoryForm";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { fetchSystemInventory } from "@/lib/systemInventory.api";
import { SystemInventory } from "@/types/systemInventory.types";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAVY = "#1A2B5B";

export default function EditSystemInventoryPage() {
  const params = useParams<{ systemId: string }>();
  const systemId = params.systemId;
  const companyId = useActiveCompanyId();
  const router = useRouter();
  const { can, permissionsLoaded } = usePermissionCheck();

  const allowed = can("treatments.edit");
  const [system, setSystem] = useState<SystemInventory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (permissionsLoaded && !allowed) {
      router.replace("/sin-acceso");
    }
  }, [permissionsLoaded, allowed, router]);

  useEffect(() => {
    if (!companyId || !systemId) return;
    setLoading(true);
    fetchSystemInventory(companyId, systemId).then((res) => {
      setLoading(false);
      if (res.data) setSystem(res.data);
    });
  }, [companyId, systemId]);

  if (!companyId || !allowed) return null;

  function handleSaved(updated: SystemInventory) {
    router.push(`/admin/inventario-sistemas/${updated.id}`);
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
            Editar
          </span>
        </nav>
        <h1 className="text-[24px] font-bold tracking-tight sm:text-[26px]" style={{ color: NAVY }}>
          Editar sistema
        </h1>
      </div>

      <div className="w-full px-5 py-6 sm:px-6 sm:py-7 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto w-full max-w-3xl">
          {loading || !system ? (
            <div className="h-64 w-full animate-pulse rounded-2xl bg-[#F1F5FB]" />
          ) : (
            <SystemInventoryForm
              companyId={companyId}
              mode="edit"
              initial={system}
              onSaved={handleSaved}
              onCancel={() => router.push(`/admin/inventario-sistemas/${systemId}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
