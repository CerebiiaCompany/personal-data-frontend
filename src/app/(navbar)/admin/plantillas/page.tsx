"use client";

import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import UploadTemplateDialog from "@/components/dialogs/UploadTemplateDialog";
import CustomCheckbox from "@/components/forms/CustomCheckbox";
import LoadingCover from "@/components/layout/LoadingCover";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { usePolicyTemplates } from "@/hooks/usePolicyTemplates";
import { getPresignedUrl } from "@/lib/server/getPresignedUrl";
import { FORMS_MOCK_DATA } from "@/mock/formMock";
import { TEMPLATES_MOCK_DATA } from "@/mock/templatesMock";
import { useSessionStore } from "@/store/useSessionStore";
import { formatDateToString } from "@/utils/date.utils";
import { showDialog } from "@/utils/dialogs.utils";
import { Icon } from "@iconify/react";

export default function TemplatesPage() {
  const user = useSessionStore((store) => store.user);
  const { data, loading, error, refresh } = usePolicyTemplates({
    companyId: user?.companyUserData?.companyId,
  });

  async function viewInWeb(fileKey: string, download?: string) {
    const presignedUrl = await getPresignedUrl(fileKey, download);
    const a = document.createElement("a");
    a.href = presignedUrl;
    if (download) {
      a.download = download;
      a.removeAttribute("target");
    } else {
      a.target = "_blank";
    }

    a.click();
    a.remove();
  }

  return (
    <div className="flex flex-col">
      <SectionHeader />

      {/* Content */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 flex flex-col gap-4 sm:gap-5 md:gap-6">
        <UploadTemplateDialog refresh={refresh} />

        {/* Grid view */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] md:grid-cols-[repeat(auto-fit,_minmax(350px,_1fr))] gap-4 sm:gap-6 md:gap-8 justify-center">
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
          {loading && (
            <div className="w-full relative h-20">
              <LoadingCover />
            </div>
          )}
          {data ? (
            data.length ? (
              data.map((policyTemplate) => (
                <div
                  className="w-full rounded-lg shadow-lg shadow-primary-shadows border flex-1 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8 border-disabled p-4 sm:p-5 relative min-h-[200px] sm:min-h-[220px] md:min-h-0"
                  key={policyTemplate._id}
                >
                  <div className="w-full rounded-lg z-0 h-full pointer-events-none border-l-4 border-primary-500 absolute left-0 top-0" />

                  <Icon
                    icon={"fa6-regular:file-pdf"}
                    className="text-6xl sm:text-7xl md:text-8xl text-primary-500 flex-shrink-0"
                  />
                  <div className="flex flex-col justify-between gap-3 sm:gap-0 w-full h-full">
                    <h6 className="w-full font-bold text-base sm:text-lg text-center sm:text-left">
                      {policyTemplate.name}
                    </h6>
                    <span className="w-full h-[1px] bg-disabled" />

                    {/* Action buttons */}
                    <div className="w-full mt-4 sm:mt-7 items-stretch sm:items-center gap-2 sm:gap-3 md:gap-4 justify-between flex flex-col sm:flex-row flex-1 h-full">
                      <Button
                        onClick={(_) => viewInWeb(policyTemplate.file.key)}
                        className="text-xs sm:text-sm flex-1 w-full sm:w-auto"
                        hierarchy="secondary"
                      >
                        Ver en la web
                      </Button>
                      <Button
                        onClick={(_) =>
                          viewInWeb(
                            policyTemplate.file.key,
                            `${
                              policyTemplate.name
                            }.${policyTemplate.file.originalName
                              .split(".")
                              .pop()}`
                          )
                        }
                        className="text-xs sm:text-sm flex-1 w-full sm:w-auto"
                        hierarchy="secondary"
                      >
                        Descargar
                      </Button>
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
