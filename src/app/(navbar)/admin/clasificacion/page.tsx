"use client";

import Button from "@/components/base/Button";
import SectionSearchBar from "@/components/base/SectionSearchBar";
import DataOfficerCard from "@/components/administration/DataOfficerCard";
import ClasificationTable from "@/components/clasification/ClasificationTable";
import UploadExcelTemplateDialog from "@/components/dialogs/UploadExcelTemplateFile";
import ConsentCampaignDialog from "@/components/dialogs/ConsentCampaignDialog";
import CheckPermission from "@/components/checkers/CheckPermission";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { useCollectFormClasifications } from "@/hooks/useCollectFormClasifications";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { useSessionStore } from "@/store/useSessionStore";
import { showDialog } from "@/utils/dialogs.utils";
import { downloadExcelTemplate } from "@/utils/downloadExcelTemplate";
import { Icon } from "@iconify/react";
import Link from "next/link";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { CollectFormClasification } from "@/types/collectForm.types";

const topCardClass =
  "bg-white border border-[#E8EDF7] rounded-2xl shadow-[0_2px_10px_rgba(15,35,70,0.03)]";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function filterByFormName(
  list: CollectFormClasification[] | null,
  query: string
): CollectFormClasification[] | null {
  if (!list) return null;
  const nq = normalizeText(query);
  if (!nq) return list;
  return list.filter((item) =>
    normalizeText(item.name || "").includes(nq)
  );
}

export default function ClassificationPage() {
  const user = useSessionStore((store) => store.user);
  const companyId = user?.companyUserData?.companyId;
  const { shouldFetch } = usePermissionCheck();
  const [search, setSearch] = useState("");
  const [consentCampaignTarget, setConsentCampaignTarget] = useState<{
    formId: string;
    formName: string;
  } | null>(null);
  const [formPickerOpen, setFormPickerOpen] = useState(false);
  const { data, summary, loading, error, refresh } =
    useCollectFormClasifications({
      companyId,
      enabled: shouldFetch("classification.view"),
    });

  const filteredItems = useMemo(
    () => filterByFormName(data, search),
    [data, search]
  );

  const openConsentCampaign = useCallback(
    (formId: string, formName: string) => {
      setFormPickerOpen(false);
      setConsentCampaignTarget({ formId, formName });
      requestAnimationFrame(() => {
        showDialog(HTML_IDS_DATA.consentCampaignDialog);
      });
    },
    []
  );

  const handleCreateConsentCampaignClick = useCallback(() => {
    if (!filteredItems?.length) {
      toast.error("No hay formularios disponibles para crear una campaña.");
      return;
    }
    if (filteredItems.length === 1) {
      openConsentCampaign(filteredItems[0]._id, filteredItems[0].name);
      return;
    }
    setFormPickerOpen(true);
  }, [filteredItems, openConsentCampaign]);

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 w-full bg-[#F9FBFF]">
      <UploadExcelTemplateDialog refresh={refresh} />

      {consentCampaignTarget && companyId && (
        <ConsentCampaignDialog
          companyId={companyId}
          formId={consentCampaignTarget.formId}
          formName={consentCampaignTarget.formName}
        />
      )}

      {formPickerOpen && filteredItems && filteredItems.length > 1 && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-stone-900/50 p-4"
          onClick={() => setFormPickerOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E8EDF7] px-5 py-4">
              <h3 className="font-bold text-[#0B1737] text-lg">
                Elegir formulario
              </h3>
              <button
                type="button"
                onClick={() => setFormPickerOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100"
                aria-label="Cerrar"
              >
                <Icon icon="tabler:x" className="text-xl" />
              </button>
            </div>
            <p className="px-5 pt-3 text-sm text-[#64748B]">
              Selecciona el formulario para la campaña de consentimiento.
            </p>
            <ul className="max-h-72 overflow-y-auto p-3 flex flex-col gap-2">
              {filteredItems.map((item) => (
                <li key={item._id}>
                  <button
                    type="button"
                    onClick={() => openConsentCampaign(item._id, item.name)}
                    className="w-full text-left rounded-xl border border-[#E8EDF7] px-4 py-3 hover:bg-[#F0FDF4] hover:border-emerald-200 transition-colors"
                  >
                    <span className="font-semibold text-[#0B1737] text-sm block truncate">
                      {item.name}
                    </span>
                    <span className="text-xs text-[#64748B] mt-0.5">
                      {item.totalResponses ?? 0} registros
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="px-5 md:px-6 pt-4 shrink-0">
        <div className="max-w-[1200px] mx-auto w-full">
          <section className={clsx(topCardClass, "px-5 md:px-6 py-4 md:py-5")}>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
                <div className="flex-1 min-w-0 w-full [&_label]:max-w-full">
                  <SectionSearchBar search={search} onSearchChange={setSearch} />
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <CheckPermission group="classification" permission="create">
                    <Button
                      onClick={() => downloadExcelTemplate()}
                      hierarchy="secondary"
                      className="rounded-xl! border-[#E3E9F4]! text-[13px]! px-4! py-2.5!"
                      startContent={
                        <Icon icon="tabler:download" className="text-lg" />
                      }
                    >
                      Descargar plantilla
                    </Button>
                    <Button
                      onClick={() =>
                        showDialog(HTML_IDS_DATA.uploadExcelTemplateDialog)
                      }
                      className="rounded-xl! bg-[#0D2B74]! border-[#0D2B74]! text-[13px]! px-4! py-2.5!"
                      startContent={
                        <Icon icon="tabler:upload" className="text-lg" />
                      }
                    >
                      Subir Excel
                    </Button>
                  </CheckPermission>
                  <CheckPermission group="campaigns" permission="create">
                    <Button
                      onClick={handleCreateConsentCampaignClick}
                      hierarchy="secondary"
                      className="rounded-xl! border-emerald-200! bg-emerald-50! text-emerald-800! text-[13px]! px-4! py-2.5! hover:bg-emerald-100!"
                      startContent={
                        <Icon icon="tabler:send" className="text-lg" />
                      }
                    >
                      Crear campaña de consentimiento
                    </Button>
                  </CheckPermission>
                </div>
              </div>

              <header className="border-t border-[#EEF2F8] pt-4 space-y-2">
                <nav className="flex flex-wrap items-center gap-2 text-sm text-[#7384A6]">
                  <Link href="/admin" className="hover:underline">
                    Inicio
                  </Link>
                  <Icon
                    icon="tabler:chevron-right"
                    className="text-base shrink-0"
                  />
                  <span className="text-[#1D2E56] font-semibold">
                    Clasificación
                  </span>
                </nav>
                <h1 className="text-[24px] sm:text-[26px] leading-tight font-bold text-[#0B1737]">
                  Clasificación de datos
                </h1>
                <p className="text-[#6F7F9F] text-[13px] max-w-3xl leading-relaxed">
                  Selecciona un formulario para ver los datos recolectados y su
                  trazabilidad.
                </p>
              </header>
            </div>
          </section>
        </div>
      </div>

      <div className="px-5 md:px-6 py-4 md:py-5 flex-1 flex flex-col min-h-0 min-w-0">
        <div className="max-w-[1200px] mx-auto w-full flex-1 min-h-0 min-w-0">
          <div className="mb-4">
            <DataOfficerCard compact hideWhenAssigned={false} />
          </div>
          <ClasificationTable
            items={filteredItems}
            aggregateSource={data}
            listSummary={summary}
            loading={loading}
            error={error}
            onCreateConsentCampaign={openConsentCampaign}
          />
        </div>
      </div>
    </div>
  );
}
