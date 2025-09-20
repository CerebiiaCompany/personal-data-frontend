"use client";

import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import CollectFormsList from "@/components/collectForms/CollectFormsList";
import { useCollectForms } from "@/hooks/useCollectForms";
import { useSessionStore } from "@/store/useSessionStore";

export default function CollectPage() {
  const user = useSessionStore((store) => store.user);
  const {
    data: collectForms,
    loading,
    error,
  } = useCollectForms({
    companyId: user?.companyUserData?.companyId,
  });

  return (
    <div className="flex flex-col h-full">
      <SectionHeader />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 flex-1">
        <header className="w-full flex flex-col gap-2 items-start">
          <div className="w-full justify-between flex items-center">
            <Button>Plantillas Ley 1581</Button>
            <Button href="/admin/recoleccion/crear-formulario">
              Crear formulario
            </Button>
          </div>
        </header>

        {/* Forms grid */}
        <CollectFormsList
          items={collectForms}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
