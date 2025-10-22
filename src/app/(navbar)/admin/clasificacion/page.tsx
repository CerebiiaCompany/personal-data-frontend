"use client";

import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import ClasificationTable from "@/components/clasification/ClasificationTable";
import UploadExcelTemplateDialog from "@/components/dialogs/UploadExcelTemplateFile";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { useCollectFormClasifications } from "@/hooks/useCollectFormClasifications";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useSessionStore } from "@/store/useSessionStore";
import { showDialog } from "@/utils/dialogs.utils";

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
      <div className="px-8 py-6 flex flex-col gap-6 flex-1">
        <header className="w-full flex gap-2 justify-between items-center">
          <Button
            onClick={(_) => showDialog(HTML_IDS_DATA.uploadExcelTemplateDialog)}
          >
            Cargar plantilla de excel
          </Button>
          <h4 className="font-semibold text-xl text-primary-900">
            Clasificación de los formularios
          </h4>
          <span />
        </header>

        {/* Forms Table */}
        <ClasificationTable items={data} loading={loading} error={error} />
      </div>
    </div>
  );
}
