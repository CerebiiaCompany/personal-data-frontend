"use client";

import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import UploadTemplateDialog from "@/components/dialogs/UploadTemplateDialog";
import CustomCheckbox from "@/components/forms/CustomCheckbox";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { FORMS_MOCK_DATA } from "@/mock/formMock";
import { TEMPLATES_MOCK_DATA } from "@/mock/templatesMock";
import { formatDateToString } from "@/utils/date.utils";
import { Icon } from "@iconify/react";

export default function TemplatesPage() {
  return (
    <div className="flex flex-col">
      <SectionHeader />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6">
        <header className="w-full flex flex-col gap-2 items-start">
          <div className="w-full justify-between flex items-center">
            <Button>Plantillas Ley 1581</Button>
          </div>
        </header>

        <UploadTemplateDialog />

        {/* Grid view */}
        <div className="w-fill grid grid-cols-[repeat(auto-fit,_minmax(350px,_1fr))] gap-8 justify-center">
          <button
            onClick={() => {
              document
                .getElementById(HTML_IDS_DATA.uploadTemplateDialog)
                ?.classList.add("dialog-visible");
            }}
            className="w-full rounded-lg bg-primary-50 relative flex flex-col items-center gap-2 justify-center hover:brightness-90 transition-[filter_.3s]"
          >
            <div className="w-full rounded-lg z-0 h-full pointer-events-none border-l-4 border-primary-500 absolute left-0 top-0" />

            <Icon icon={"tabler:plus"} className="text-7xl text-primary-300" />
            <div className="flex flex-col items-center border-t-2 border-disabled font-bold text-primary-900 w-full max-w-[85%]">
              Cargar nueva plantilla
            </div>
          </button>
          {TEMPLATES_MOCK_DATA.map((data) => (
            <div
              className="w-full rounded-lg shadow-lg shadow-primary-shadows border flex-1 flex items-center gap-8 border-disabled p-4 relative"
              key={data.id}
            >
              <div className="w-full rounded-lg z-0 h-full pointer-events-none border-l-4 border-primary-500 absolute left-0 top-0" />

              <Icon
                icon={"fa6-regular:file-pdf"}
                className="text-8xl text-primary-500"
              />
              <div className="flex flex-col justify-between gap-0 w-full h-full">
                <div className="w-full flex gap-2 justify-between py-1">
                  <h6 className="w-full font-bold text-lg">{data.title}</h6>
                  <button className="p-2 hover:bg-stone-100 transition-colors rounded-full">
                    <Icon icon={"ion:ellipsis-horizontal"} />
                  </button>
                </div>
                <span className="w-full h-[1px] bg-disabled" />

                {/* Action buttons */}
                <div className="w-full mt-7 items-center gap-4 justify-between flex flex-1 h-full">
                  <Button className="text-sm flex-1" hierarchy="secondary">
                    Ver en la web
                  </Button>
                  <Button className="text-sm flex-1" hierarchy="secondary">
                    Descargar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
