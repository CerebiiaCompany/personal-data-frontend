import React, { useState } from "react";
import { deleteCollectForm } from "@/lib/collectForm.api";
import { useSessionStore } from "@/store/useSessionStore";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";
import { Company } from "@/types/company.types";
import { showDialog } from "@/utils/dialogs.utils";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import EditCompanyCountryDialog from "@/components/dialogs/EditCompanyCountryDialog";
import { Icon } from "@iconify/react/dist/iconify.js";
import CompanyCard from "./CompanyCard";

interface Props {
  items: Company[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const CompanyCardSkeleton = () => (
  <div className="flex flex-col overflow-hidden rounded-2xl border border-primary-50 bg-white p-5">
    <div className="flex items-start gap-3">
      <div className="skeleton-shimmer h-12 w-12 rounded-xl" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="skeleton-shimmer h-4 w-3/4 rounded" />
        <div className="skeleton-shimmer h-4 w-1/3 rounded-full" />
      </div>
    </div>
    <div className="mt-5 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton-shimmer h-2.5 w-1/4 rounded" />
            <div className="skeleton-shimmer h-3.5 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CompaniesList = ({ items, loading, error, refresh }: Props) => {
  const user = useSessionStore((store) => store.user);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  async function deleteForm(id: string) {
    const companyId = user?.companyUserData?.companyId;
    if (!companyId) return;
    const res = await deleteCollectForm(companyId, id);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("Formulario eliminado");
    refresh();
  }

  function handleEditCountry(company: Company) {
    setEditingCompany(company);
    showDialog(HTML_IDS_DATA.editCompanyCountryDialog);
  }

  const gridClass =
    "grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-6";

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-red-200 bg-red-50/40 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-500">
          <Icon icon="tabler:alert-triangle" className="text-3xl" />
        </span>
        <p className="text-base font-semibold text-red-600">
          Ocurrió un error al cargar las empresas
        </p>
        <p className="max-w-md text-sm text-red-500/80">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-1 flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-50"
        >
          <Icon icon="tabler:refresh" />
          Reintentar
        </button>
      </div>
    );
  }

  if (loading && !items) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 6 }).map((_, i) => (
          <CompanyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items && items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary-50 bg-slate-50/50 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-500">
          <Icon icon="tabler:building-skyscraper" className="text-3xl" />
        </span>
        <p className="text-base font-semibold text-primary-900">
          No hay empresas para mostrar
        </p>
        <p className="max-w-sm text-sm text-slate-500">
          Aún no se han registrado empresas o ninguna coincide con tu búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      <div className={gridClass}>
        {items?.map((item) => (
          <CompanyCard
            deleteHandler={deleteForm}
            onEditCountry={handleEditCountry}
            key={item._id}
            data={item}
          />
        ))}
      </div>
      <EditCompanyCountryDialog company={editingCompany} onUpdated={refresh} />
    </div>
  );
};

export default CompaniesList;
