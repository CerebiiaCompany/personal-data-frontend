import { CollectForm } from "@/types/collectForm.types";
import React from "react";
import CollectFormCard from "./CollectFormCard";
import LoadingCover from "../layout/LoadingCover";
import { deleteCollectForm } from "@/lib/collectForm.api";
import { useSessionStore } from "@/store/useSessionStore";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";
import { useConfirm } from "@/components/dialogs/ConfirmProvider";

interface Props {
  items: CollectForm[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const CollectFormsList = ({ items, loading, error, refresh }: Props) => {
  const user = useSessionStore((store) => store.user);
  const confirm = useConfirm();

  async function deleteForm(id: string) {
    const confirmed = await confirm({
      title: "⚠️ Eliminar Formulario de Recolección",
      description: (
        <div className="space-y-3">
          <p className="font-semibold text-primary-900">
            Esta acción es irreversible y puede causar pérdida de datos.
          </p>
          <p className="text-stone-600">
            Al eliminar este formulario:
          </p>
          <ul className="list-disc list-inside text-sm text-stone-600 space-y-1 ml-2">
            <li>Se eliminarán todas las respuestas asociadas</li>
            <li>Las campañas que lo usan se verán afectadas</li>
            <li>Los datos de clasificación se perderán</li>
            <li>No podrás recuperar esta información</li>
          </ul>
          <p className="text-sm font-medium text-red-600 mt-3">
            ¿Estás seguro de que deseas continuar?
          </p>
        </div>
      ),
      confirmText: "Sí, eliminar formulario",
      cancelText: "Cancelar",
      danger: true,
    });

    if (!confirmed) return;

    const companyId = user?.companyUserData?.companyId;
    if (!companyId) return;
    
    const res = await deleteCollectForm(companyId, id);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("Formulario eliminado");
    refresh();
  }

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,_minmax(280px,_1fr))] gap-4 sm:gap-5 md:gap-6 relative flex-1">
      {loading && <LoadingCover />}
      {items ? (
        items.length ? (
          items.map((item) => (
            <CollectFormCard
              deleteHandler={deleteForm}
              key={item._id}
              data={item}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-8 px-4">
            <p className="text-stone-500 text-sm sm:text-base text-center">No hay formularios para mostrar</p>
          </div>
        )
      ) : null}
      {error && (
        <div className="col-span-full flex flex-col items-center justify-center py-8 px-4">
          <p className="text-red-500 text-sm sm:text-base text-center">Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default CollectFormsList;
