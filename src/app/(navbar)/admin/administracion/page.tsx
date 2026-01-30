"use client";

import Button from "@/components/base/Button";
import EditOwnCompanyDialog from "@/components/dialogs/EditOwnCompanyDialog";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { useOwnCompany } from "@/hooks/useOwnCompany";
import { showDialog } from "@/utils/dialogs.utils";
import { Icon } from "@iconify/react";

export default function AdministrationPage() {
  const { data, loading, error, refresh } = useOwnCompany();

  return (
    <div className="w-full p-3 sm:p-4 md:p-5 rounded-md border border-disabled">
      <EditOwnCompanyDialog company={data} onUpdated={refresh} />
      <header className="w-full flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-between sm:items-center">
        <h4 className="font-semibold text-lg sm:text-xl text-primary-900 text-center sm:text-left break-words">{data?.name || "..."}</h4>
        <div className="flex gap-2 justify-center sm:justify-end">
          <Button
            type="button"
            onClick={() => showDialog(HTML_IDS_DATA.editOwnCompanyDialog)}
            className="w-full sm:w-auto text-sm sm:text-base"
            endContent={
              <Icon
                icon={"material-symbols:edit-outline"}
                className="text-lg sm:text-xl"
              />
            }
          >
            Editar datos
          </Button>
        </div>
      </header>

      {/* Info de la empresa */}
      <div className="mt-4 sm:mt-5 rounded-lg border border-disabled bg-white p-4 sm:p-5">
        {loading ? (
          <div className="text-sm text-stone-500">Cargando información...</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-stone-500 font-medium">NIT</span>
              <span className="text-sm text-primary-900 font-semibold break-words">
                {data.nit}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-stone-500 font-medium">Correo</span>
              <span className="text-sm text-primary-900 font-semibold break-words">
                {data.email}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-stone-500 font-medium">Teléfono</span>
              <span className="text-sm text-primary-900 font-semibold break-words">
                {data.phone}
              </span>
            </div>
            {data.plan?.name ? (
              <div className="flex flex-col">
                <span className="text-xs text-stone-500 font-medium">Plan</span>
                <span className="text-sm text-primary-900 font-semibold break-words">
                  {data.plan.name}
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-sm text-stone-500">Sin información disponible.</div>
        )}
      </div>
    </div>
  );
}
