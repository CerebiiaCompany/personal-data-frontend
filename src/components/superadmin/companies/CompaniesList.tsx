import { CollectForm } from "@/types/collectForm.types";
import React from "react";
import { deleteCollectForm } from "@/lib/collectForm.api";
import { useSessionStore } from "@/store/useSessionStore";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";
import CollectFormCard from "@/components/collectForms/CollectFormCard";
import LoadingCover from "@/components/layout/LoadingCover";
import { Company } from "@/types/company.types";
import CompanyCard from "./CompanyCard";

interface Props {
  items: Company[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const CompaniesList = ({ items, loading, error, refresh }: Props) => {
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
            <CompanyCard
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

export default CompaniesList;
