"use client";

import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import ClasificationTable from "@/components/clasification/ClasificationTable";
import UploadExcelTemplateDialog from "@/components/dialogs/UploadExcelTemplateFile";
import CheckPermission from "@/components/checkers/CheckPermission";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { useCollectFormClasifications } from "@/hooks/useCollectFormClasifications";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useSessionStore } from "@/store/useSessionStore";
import { showDialog } from "@/utils/dialogs.utils";
import { downloadExcelTemplate } from "@/utils/downloadExcelTemplate";
import { Icon } from "@iconify/react";

export default function ClassificationPage() {
  const user = useSessionStore((store) => store.user);
  const { debouncedValue, search, setSearch } = useDebouncedSearch();
  const { data, loading, error, refresh } = useCollectFormClasifications({
    companyId: user?.companyUserData?.companyId,
    search: debouncedValue,
  });

  return (
    <div className="flex flex-col h-full">
      <SectionHeader search={search} onSearchChange={setSearch} />

      <UploadExcelTemplateDialog refresh={refresh} />

      {/* Content */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 flex flex-col gap-4 sm:gap-5 md:gap-6 flex-1">
        <header className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between sm:items-center">
          <CheckPermission group="classification" permission="create">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Button
                onClick={(_) => showDialog(HTML_IDS_DATA.uploadExcelTemplateDialog)}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Cargar plantilla de excel
              </Button>
              <Button
                onClick={() => downloadExcelTemplate()}
                hierarchy="secondary"
                className="w-full sm:w-auto text-sm sm:text-base"
                startContent={
                  <Icon icon={"tabler:download"} className="text-lg" />
                }
              >
                Descargar plantilla base
              </Button>
            </div>
          </CheckPermission>
          <h4 className="font-semibold text-lg sm:text-xl text-primary-900 text-center sm:text-left">
            Clasificación de los formularios
          </h4>
        </header>

        {/* Forms Table */}
        <ClasificationTable items={data} loading={loading} error={error} />
      </div>
    </div>
  );
}
