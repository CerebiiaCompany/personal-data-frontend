import { CollectForm } from "@/types/collectForm.types";
import React from "react";
import CollectFormCard from "./CollectFormCard";
import LoadingCover from "../layout/LoadingCover";
import { deleteCollectForm } from "@/lib/collectForm.api";
import { useSessionStore } from "@/store/useSessionStore";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";

interface Props {
  items: CollectForm[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const CollectFormsList = ({ items, loading, error, refresh }: Props) => {
  const user = useSessionStore((store) => store.user);

  async function deleteForm(id: string) {
    const companyId = user?.companyUserData?.companyId;
    if (!companyId) return;
    const res = await deleteCollectForm(companyId, id);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("Fomrulario eliminado");
    refresh();
  }

  return (
    <div className="w-full grid grid-cols-[repeat(auto-fill,_minmax(280px,_1fr))] gap-6 relative flex-1">
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
          <p>No hay formularios para mostrar</p>
        )
      ) : null}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default CollectFormsList;
