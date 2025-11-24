"use client";

import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import CampaignsTable from "@/components/campaigns/CampaignsTable";
import CheckPermission from "@/components/checkers/CheckPermission";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { usePermissions } from "@/hooks/usePermissions";
import { deleteCampaign } from "@/lib/campaign.api";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export default function CampaignsPage() {
const user = useSessionStore((store) => store.user);
const { canCreate, canEdit, canView } = usePermissions();
const { search, debouncedValue, setSearch } = useDebouncedSearch();
const { data, loading, error, refresh } = useCampaigns({
companyId: user?.companyUserData?.companyId,
search: debouncedValue,
});
const [selectedIds, setSelectedIds] = useState<string[]>([]);

// Memoizar verificaciones de permisos para evitar recalcularlas en cada render
const hasViewPermission = useMemo(() => canView("campaigns"), [canView]);
const hasCreatePermission = useMemo(() => canCreate("campaigns"), [canCreate]);
const hasEditPermission = useMemo(() => canEdit("campaigns"), [canEdit]);

    function toggleSelectedId(id: string) {
    if (selectedIds.includes(id)) {
    // remove it
    const newSelectedIds = [...selectedIds];
    newSelectedIds.splice(
    selectedIds.findIndex((e) => e === id),
    1
    );
    setSelectedIds(newSelectedIds);
    } else {
    // add it
    setSelectedIds([...selectedIds, id]);
    }
    }

    async function deleteSelectedCampaigns() {
    const companyId = user?.companyUserData?.companyId;

    if (!companyId) return;
    
    const results = await Promise.all(
    selectedIds.map(async (id) => {
    const res = await deleteCampaign(companyId, id);
    return { id, error: res.error };
    })
    );

    const errors = results.filter((r) => r.error);
    const successCount = results.length - errors.length;

    if (errors.length > 0) {
    errors.forEach(({ error }) => {
    toast.error(parseApiError(error!));
    });
    }

    if (successCount > 0) {
    toast.success(
    successCount === 1
    ? `Campaña eliminada`
    : `${successCount} campañas eliminadas`
    );
    }

    setSelectedIds([]);
    refresh();
    }

    return (
    <div className="flex flex-col">
        <SectionHeader search={search} onSearchChange={setSearch} />

        {/* Content */}
        <div className="px-8 py-6 flex flex-col gap-6">
            <header className="w-full flex flex-col gap-2 items-start justify-between">
                <div className="w-fit flex items-center gap-2">
                    {/* Ejemplo 1: Usando el componente CheckPermission */}
                    <CheckPermission group="campaigns" permission="create">
                        <Button href="/admin/campanas/crear-programada" startContent={<Icon icon={"tabler:plus"}
                            className="text-xl" />}
                        >
                        Crear
                        </Button>
                    </CheckPermission>
                    
                    {/* Ejemplo 2: Usando el hook directamente */}
                    {selectedIds.length > 0 && hasEditPermission && (
                    <Button href={`/admin/campanas/${selectedIds[0]}/editar`} disabled={selectedIds.length> 1}
                        onClick={(e) => console.log("first")}
                        hierarchy="secondary"
                        startContent={
                        <Icon icon={"material-symbols:edit-outline"} className="text-xl" />
                        }
                        >
                        Editar
                    </Button>
                    )}
                    {selectedIds.length > 0 && hasEditPermission && (
                    <Button onClick={deleteSelectedCampaigns} hierarchy="secondary">
                        <Icon icon={"bx:trash"} className="text-2xl" />
                    </Button>
                    )}
                </div>
            </header>

            <CampaignsTable toggleSelected={toggleSelectedId} selectedIds={selectedIds} items={data} loading={loading}
                error={error} />
        </div>
    </div>
    );
    }
