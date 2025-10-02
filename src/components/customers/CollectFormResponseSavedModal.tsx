"use client";

import React from "react";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { hideDialog } from "@/utils/dialogs.utils";
import { Icon } from "@iconify/react/dist/iconify.js";

interface Props {
  fullName: string;
}

const CollectFormResponseSavedModal = ({ fullName }: Props) => {
  const id = HTML_IDS_DATA.collectFormResponseSavedModal;

  return (
    /* Wrapper */
    <div
      id={id}
      className="dialog-wrapper fixed hidden w-full top-0 left-0 h-full z-20 justify-center items-center bg-stone-900/50"
    >
      {/* Modal */}
      <div className="w-full animate-appear max-w-lg rounded-xl overflow-hidden bg-white flex flex-col items-center max-h-3/4 text-center gap-4 px-4 py-3">
        <Icon
          icon={"tabler:circle-check"}
          className="text-7xl text-primary-500"
        />
        <h3 className="text-2xl text-primary-500 font-semibold">
          ¡Todo listo!
        </h3>
        <p className="text-stone-500">
          <span className="font-semibold text-stone-700">{fullName}</span>, se
          ha guardado tu respuesta para este formulario.
        </p>
        <span className="text-sm w-fit flex gap-1 items-center py-1 px-2 bg-primary-500/10 rounded-lg text-primary-500 mt-4">
          <Icon icon={"tabler:info-circle"} className="text-lg" />
          Ya puedes cerrar esta pestaña ;)
        </span>
      </div>
    </div>
  );
};

export default CollectFormResponseSavedModal;
