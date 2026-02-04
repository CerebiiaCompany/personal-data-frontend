"use client";

import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import UploadTemplateDialog from "@/components/dialogs/UploadTemplateDialog";
import CustomCheckbox from "@/components/forms/CustomCheckbox";
import LoadingCover from "@/components/layout/LoadingCover";
import CheckPermission from "@/components/checkers/CheckPermission";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { usePolicyTemplates } from "@/hooks/usePolicyTemplates";
import { deletePolicyTemplate } from "@/lib/policyTemplate.api";
import { getPolicyTemplateFileUrl } from "@/lib/policyTemplate.api";
import { FORMS_MOCK_DATA } from "@/mock/formMock";
import { TEMPLATES_MOCK_DATA } from "@/mock/templatesMock";
import { useSessionStore } from "@/store/useSessionStore";
import { formatDateToString } from "@/utils/date.utils";
import { parseApiError } from "@/utils/parseApiError";
import { showDialog } from "@/utils/dialogs.utils";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";

export default function TemplatesPage() {
  const user = useSessionStore((store) => store.user);
  const { can } = usePermissionCheck();
  const { data, loading, error, refresh } = usePolicyTemplates({
    companyId: user?.companyUserData?.companyId,
  });

  async function viewInWeb(policyTemplateId: string, download?: string) {
    const companyId = user?.companyUserData?.companyId;
    if (!companyId) {
      toast.error("No se pudo obtener la información de la compañía");
      return;
    }

    try {
      const res = await getPolicyTemplateFileUrl(companyId, policyTemplateId);

      if (res.error) {
        return toast.error(parseApiError(res.error));
      }

      if (!res.data?.url) {
        return toast.error("Error al obtener la URL del archivo");
      }

      const a = document.createElement("a");
      a.href = res.data.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      if (download) {
        a.download = download;
      }

      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      toast.error("Error al obtener la URL del archivo");
      console.error(error);
    }
  }

  async function deleteTemplate(policyId: string) {
    const companyId = user?.companyUserData?.companyId;
    if (!companyId) return;

    const res = await deletePolicyTemplate(companyId, policyId);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("Plantilla eliminada");
    refresh();
  }

  return (
    <div className="flex flex-col">
      <SectionHeader />

      {/* Content */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 flex flex-col gap-4 sm:gap-5 md:gap-6">
        <UploadTemplateDialog refresh={refresh} />

        {/* Grid view */}
        <div 
          className={`w-full grid gap-4 sm:gap-6 md:gap-8 ${
            can('templates.create') 
              ? 'grid-cols-1 sm:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] md:grid-cols-[repeat(auto-fit,_minmax(350px,_1fr))] justify-center'
              : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 justify-items-center'
          }`}
        >
          <CheckPermission group="templates" permission="create">
            {!loading && (
              <button
                onClick={() => showDialog(HTML_IDS_DATA.uploadTemplateDialog)}
                className="w-full rounded-lg bg-primary-50 relative flex flex-col items-center gap-2 sm:gap-3 justify-center hover:brightness-90 transition-[filter_.3s] min-h-[180px] sm:min-h-[200px] md:min-h-[220px]"
              >
                <div className="w-full rounded-lg z-0 h-full pointer-events-none border-l-4 border-primary-500 absolute left-0 top-0" />

                <Icon
                  icon={"tabler:plus"}
                  className="text-5xl sm:text-6xl md:text-7xl text-primary-300"
                />
                <div className="flex flex-col items-center border-t-2 border-disabled font-bold text-primary-900 w-full max-w-[85%] text-sm sm:text-base md:text-lg px-4 py-2">
                  Cargar nueva plantilla
                </div>
              </button>
            )}
          </CheckPermission>
          {loading && (
            <div className="w-full relative h-20">
              <LoadingCover />
            </div>
          )}
          {data ? (
            data.length ? (
              data.map((policyTemplate) => (
                <div
                  className={`rounded-lg shadow-lg shadow-primary-shadows border flex-1 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8 border-disabled p-4 sm:p-5 relative min-h-[200px] sm:min-h-[220px] md:min-h-0 overflow-hidden ${
                    can('templates.create') ? 'w-full' : 'w-full max-w-2xl'
                  }`}
                  key={policyTemplate._id}
                >
                  <div className="w-full rounded-lg z-0 h-full pointer-events-none border-l-4 border-primary-500 absolute left-0 top-0" />

                  <Icon
                    icon={"fa6-regular:file-pdf"}
                    className="text-6xl sm:text-7xl md:text-8xl text-primary-500 flex-shrink-0"
                  />
                  <div className="flex flex-col justify-between gap-3 sm:gap-0 w-full h-full min-w-0">
                    <h6 className="w-full font-bold text-base sm:text-lg text-center sm:text-left truncate">
                      {policyTemplate.name}
                    </h6>
                    <span className="w-full h-[1px] bg-disabled" />

                    {/* Action buttons */}
                    <div className="w-full mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4 min-w-0">
                      <div className="w-full flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 md:gap-4 min-w-0">
                        <Button
                          onClick={(_) => viewInWeb(policyTemplate._id)}
                          startContent={
                            <Icon
                              icon="tabler:external-link"
                              className="text-base"
                            />
                          }
                          className="text-xs sm:text-sm w-full sm:w-[170px] whitespace-nowrap !py-0 h-9 hover:bg-stone-50"
                          hierarchy="secondary"
                        >
                          Ver en la web
                        </Button>
                        <Button
                          onClick={(_) =>
                            viewInWeb(
                              policyTemplate._id,
                              `${
                                policyTemplate.name
                              }.${policyTemplate.file.originalName
                                .split(".")
                                .pop()}`
                            )
                          }
                          startContent={
                            <Icon icon="tabler:download" className="text-base" />
                          }
                          className="text-xs sm:text-sm w-full sm:w-[170px] whitespace-nowrap !py-0 h-9 hover:bg-stone-50"
                          hierarchy="secondary"
                        >
                          Descargar
                        </Button>
                      </div>
                      <CheckPermission group="templates" permission="delete">
                        <Button
                          onClick={(_) => deleteTemplate(policyTemplate._id)}
                          className="bg-red-500/10 border-red-400 flex-shrink-0 sm:ml-auto self-end sm:self-auto !p-0 !h-9 !w-9 hover:bg-red-500/15"
                          aria-label="Eliminar plantilla"
                        >
                          <div className="flex items-center justify-center w-full h-9">
                            <Icon
                              icon="bx:trash"
                              className="text-lg text-red-500"
                            />
                          </div>
                        </Button>
                      </CheckPermission>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-8 px-4">
                <p className="text-center text-stone-500 text-sm sm:text-base">No hay plantillas para mostrar</p>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
