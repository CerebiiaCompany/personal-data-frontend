"use client";

import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import CampaignsTable from "@/components/campaigns/CampaignsTable";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { deleteCampaign } from "@/lib/campaign.api";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { toast } from "sonner";

export default function CampaignsPage() {
  const user = useSessionStore((store) => store.user);
  const { search, debouncedValue, setSearch } = useDebouncedSearch();
  const { data, loading, error, refresh } = useCampaigns({
    companyId: user?.companyUserData?.companyId,
    search: debouncedValue,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
    await Promise.all(
      selectedIds.map(async (id) => {
        const res = await deleteCampaign(companyId, id);
        if (res.error) {
          return toast.error(parseApiError(res.error));
        }

        toast.success(`Campaña eliminada`);
      })
    );

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
            <Button
              href="/admin/campanas/crear"
              startContent={<Icon icon={"tabler:plus"} className="text-xl" />}
            >
              Crear
            </Button>
            {selectedIds.length > 0 && (
              <Button
                href={`/admin/campanas/${selectedIds[0]}/editar`}
                disabled={selectedIds.length > 1}
                onClick={(e) => console.log("first")}
                hierarchy="secondary"
                startContent={
                  <Icon
                    icon={"material-symbols:edit-outline"}
                    className="text-xl"
                  />
                }
              >
                Editar
              </Button>
            )}
            {selectedIds.length > 0 && (
              <Button onClick={deleteSelectedCampaigns} hierarchy="secondary">
                <Icon icon={"bx:trash"} className="text-2xl" />
              </Button>
            )}
          </div>
        </header>

        <CampaignsTable
          toggleSelected={toggleSelectedId}
          selectedIds={selectedIds}
          items={data}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
