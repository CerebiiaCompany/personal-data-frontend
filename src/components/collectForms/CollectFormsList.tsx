import { CollectForm } from "@/types/collectForm.types";
import React from "react";
import CollectFormCard from "./CollectFormCard";
import { CollectFormsListSkeleton } from "./CollectSkeletons";
import { deleteCollectForm } from "@/lib/collectForm.api";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";
import { useConfirm } from "@/components/dialogs/ConfirmProvider";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { Icon } from "@iconify/react";
import clsx from "clsx";

interface Props {
  items: CollectForm[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  /** Sin borde propio cuando va dentro del panel unificado con filtros */
  embedded?: boolean;
}

const CollectFormsList = ({
  items,
  loading,
  error,
  refresh,
  embedded,
}: Props) => {
  const companyId = useActiveCompanyId();
  const confirm = useConfirm();

  async function deleteForm(id: string) {
    let reason = "";
    const confirmed = await confirm({
      title: "⚠️ Eliminar Formulario de Recolección",
      description: (
        <div className="space-y-3">
          <p className="font-semibold text-primary-900">
            Esta acción es irreversible y puede causar pérdida de datos.
          </p>
          <p className="text-stone-600">Al eliminar este formulario:</p>
          <ul className="ml-2 list-inside list-disc space-y-1 text-sm text-stone-600">
            <li>Se eliminarán todas las respuestas asociadas</li>
            <li>Las campañas que lo usan se verán afectadas</li>
            <li>Los datos de clasificación se perderán</li>
            <li>No podrás recuperar esta información</li>
          </ul>
          <p className="mt-3 text-sm font-medium text-red-600">
            ¿Estás seguro de que deseas continuar?
          </p>
        </div>
      ),
      withReasonField: true,
      reasonLabel: "Razón de eliminación (opcional)",
      reasonPlaceholder: "Ej. Datos cargados por error, formulario de prueba, etc.",
      onReasonChange: (value) => {
        reason = value;
      },
      confirmText: "Sí, eliminar formulario",
      cancelText: "Cancelar",
      danger: true,
    });

    if (!confirmed) return;
    if (!companyId) return;

    const res = await deleteCollectForm(companyId, id, reason || undefined);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("Formulario eliminado");
    refresh();
  }

  return (
    <div
      className={clsx(
        "relative grid w-full flex-1 content-start grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,_minmax(320px,_1fr))]",
        embedded ? "p-4 sm:p-5" : ""
      )}
    >
      {loading && <CollectFormsListSkeleton count={6} />}

      {!loading && items && items.length > 0 && (
        <>
          {items.map((item, index) => (
            <div
              key={item._id}
              className="dashboard-content-in"
              style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
            >
              <CollectFormCard deleteHandler={deleteForm} data={item} />
            </div>
          ))}
        </>
      )}

      {!loading && items && items.length === 0 && (
        <div className="dashboard-content-in col-span-full flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5F9]">
            <Icon icon="tabler:file-off" className="text-3xl text-[#94A3B8]" />
          </div>
          <p className="max-w-sm text-sm font-semibold text-[#334155]">
            No hay formularios con estos filtros
          </p>
          <p className="mt-1.5 max-w-sm text-xs text-[#64748B]">
            Prueba cambiando el filtro o crea un nuevo formulario de recolección.
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="col-span-full flex flex-col items-center justify-center px-6 py-12 text-center">
          <Icon
            icon="material-symbols:report-outline-rounded"
            className="mb-3 text-4xl text-red-400"
          />
          <p className="text-sm font-medium text-red-600">Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default CollectFormsList;
