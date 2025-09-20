import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import { FORMS_MOCK_DATA } from "@/mock/formMock";
import { formatDateToString } from "@/utils/date.utils";
import { Icon } from "@iconify/react";

export default function CampaignsPage() {
  return (
    <div className="flex flex-col">
      <SectionHeader />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6">
        <header className="w-full flex flex-col gap-2 items-start">
          <div className="w-full justify-between flex items-center">
            <Button>Plantillas Ley 1581</Button>
            <Button href="/recoleccion/crear-formulario">
              Crear formulario
            </Button>
          </div>
        </header>
        Campañas
      </div>
    </div>
  );
}
