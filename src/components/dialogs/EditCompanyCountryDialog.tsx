"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";

import Button from "@/components/base/Button";
import CustomSelect from "@/components/forms/CustomSelect";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { hideDialog } from "@/utils/dialogs.utils";
import { parseApiError } from "@/utils/parseApiError";
import { useDialogBackdropClose } from "@/hooks/useDialogBackdropClose";
import { updateCompanyCountryCode } from "@/lib/company.api";
import {
  Company,
  CompanyCountryCode,
  COMPANY_COUNTRY_CODE_OPTIONS,
} from "@/types/company.types";

interface Props {
  company: Company | null;
  onUpdated?: () => void;
}

const EditCompanyCountryDialog = ({ company, onUpdated }: Props) => {
  const id = HTML_IDS_DATA.editCompanyCountryDialog;
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<CompanyCountryCode | "">("");

  useEffect(() => {
    setCountryCode(company?.countryCode ?? "");
  }, [company]);

  const backdropClose = useDialogBackdropClose(() => hideDialog(id), {
    matchId: id,
    disabled: loading,
  });

  async function handleSave() {
    if (!company || !countryCode) return;

    setLoading(true);
    const res = await updateCompanyCountryCode(company._id, countryCode);
    setLoading(false);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("País de la empresa actualizado");
    hideDialog(id);
    onUpdated?.();
  }

  return (
    <div
      {...backdropClose}
      id={id}
      className="dialog-wrapper fixed hidden w-full top-0 left-0 h-full z-20 justify-center items-center bg-stone-900/50"
    >
      <div className="w-full animate-appear max-w-md rounded-xl overflow-hidden bg-white flex flex-col gap-4 p-6 sm:p-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-disabled p-2">
              <Icon icon={"tabler:world"} className="text-2xl" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-xl text-primary-900">
                Editar país de la empresa
              </h3>
              {company && (
                <p className="text-stone-500 text-sm">{company.name}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => !loading && hideDialog(id)}
            className="w-fit p-1 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Cerrar"
          >
            <Icon icon={"tabler:x"} className="text-2xl" />
          </button>
        </header>

        <p className="text-xs text-stone-500 -mt-2">
          El país determina qué políticas de tratamiento, tipos de documento y
          plazos ARCO aplican para esta empresa. Cámbialo solo si estás
          seguro — afecta comunicaciones y cálculos legales en curso.
        </p>

        <CustomSelect
          label="País"
          options={COMPANY_COUNTRY_CODE_OPTIONS}
          value={countryCode}
          onChange={(value) => setCountryCode(value)}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-disabled bg-white">
          <Button
            hierarchy="secondary"
            type="button"
            onClick={() => hideDialog(id)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            hierarchy="primary"
            type="button"
            loading={loading}
            disabled={!countryCode || countryCode === company?.countryCode}
            onClick={handleSave}
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditCompanyCountryDialog;
