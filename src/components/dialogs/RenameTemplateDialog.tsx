"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";

import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { hideDialog } from "@/utils/dialogs.utils";
import { parseApiError } from "@/utils/parseApiError";
import { useDialogBackdropClose } from "@/hooks/useDialogBackdropClose";
import { updatePolicyTemplate } from "@/lib/policyTemplate.api";
import type { PolicyTemplate } from "@/types/policyTemplate.types";

interface Props {
  companyId?: string | null;
  template: PolicyTemplate | null;
  onUpdated?: () => void;
}

const RenameTemplateDialog = ({ companyId, template, onUpdated }: Props) => {
  const id = HTML_IDS_DATA.renameTemplateDialog;
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    setName(template?.name ?? "");
  }, [template]);

  const backdropClose = useDialogBackdropClose(() => hideDialog(id), {
    matchId: id,
    disabled: loading,
  });

  const trimmedName = name.trim();
  const isUnchanged = trimmedName === (template?.name ?? "").trim();
  const canSave = !!trimmedName && !isUnchanged && !!companyId && !!template;

  async function handleSave() {
    if (!canSave || !template || !companyId) return;

    setLoading(true);
    const res = await updatePolicyTemplate(companyId, template._id, {
      name: trimmedName,
    });
    setLoading(false);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("Nombre de la plantilla actualizado");
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
              <Icon icon={"tabler:edit"} className="text-2xl" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-xl text-primary-900">
                Renombrar plantilla
              </h3>
              <p className="text-stone-500 text-sm">
                Cambia el nombre visible de la plantilla.
              </p>
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="flex flex-col gap-4"
        >
          <CustomInput
            label="Nombre de la plantilla"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Política de tratamiento de datos"
            maxLength={200}
            autoFocus
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
              type="submit"
              loading={loading}
              disabled={!canSave}
            >
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameTemplateDialog;
