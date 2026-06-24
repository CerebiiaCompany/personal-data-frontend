"use client";

import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { hideDialog } from "@/utils/dialogs.utils";
import { CollectFormResponse } from "@/types/collectFormResponse.types";
import EditCollectFormResponseForm from "@/components/clasification/EditCollectFormResponseForm";
import { useDialogBackdropClose } from "@/hooks/useDialogBackdropClose";

interface Props {
  companyId: string;
  collectFormId: string;
  response: CollectFormResponse | null;
  onUpdated?: () => void;
}

const EditCollectFormResponseDialog = ({
  companyId,
  collectFormId,
  response,
  onUpdated,
}: Props) => {
  const id = HTML_IDS_DATA.editCollectFormResponseDialog;

  function handleClose() {
    hideDialog(id);
  }

  const backdropClose = useDialogBackdropClose(handleClose, { matchId: id });

  function handleUpdated() {
    onUpdated?.();
    hideDialog(id);
  }

  if (!response) return null;

  const displayName = [response.user?.name, response.user?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...backdropClose}
      id={id}
      className="dialog-wrapper fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E8EDF7] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-[#EEF2FF] rounded-lg shrink-0">
              <Icon icon="tabler:user-edit" className="text-xl text-[#1A2B5B]" />
            </div>
            <div className="min-w-0">
              <h5 className="font-semibold text-base text-[#0B1737]">
                Editar información recolectada
              </h5>
              {displayName ? (
                <p className="text-[12px] text-[#64748B] truncate">{displayName}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors shrink-0"
          >
            <Icon icon="tabler:x" className="text-xl text-stone-600" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0">
          <EditCollectFormResponseForm
            key={response._id || response.id}
            companyId={companyId}
            collectFormId={collectFormId}
            response={response}
            onUpdated={handleUpdated}
            onCancel={handleClose}
          />
        </div>
      </div>
    </div>
  );
};

export default EditCollectFormResponseDialog;
