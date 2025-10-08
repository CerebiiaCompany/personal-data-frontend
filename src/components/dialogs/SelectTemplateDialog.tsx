"use client";

import React, { useRef, useState } from "react";
import CustomInput from "../forms/CustomInput";
import Button from "../base/Button";
import { Icon } from "@iconify/react/dist/iconify.js";
import CustomCheckbox from "../forms/CustomCheckbox";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { hideDialog } from "@/utils/dialogs.utils";
import { useSessionStore } from "@/store/useSessionStore";
import { usePolicyTemplates } from "@/hooks/usePolicyTemplates";
import clsx from "clsx";
import { PolicyTemplate } from "@/types/policyTemplate.types";

interface Props {
  items: PolicyTemplate[];
  value: string;
  onSelect: (id: string) => void;
}

const SelectTemplateDialog = ({ value, onSelect, items }: Props) => {
  const user = useSessionStore((store) => store.user);

  const id = HTML_IDS_DATA.selectTemplateDialog;

  function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if ((e.target as HTMLElement).id === id) {
      hideDialog(id);
    }
  }

  function handleSelect(templateId: string) {
    onSelect(templateId);
    hideDialog(id);
  }

  return (
    /* Wrapper */
    <div
      onClick={handleClick}
      id={id}
      className="dialog-wrapper fixed hidden w-full top-0 left-0 h-full z-20 justify-center items-center bg-stone-900/50"
    >
      {/* Modal */}
      <div className="w-full animate-appear max-w-xl rounded-xl overflow-hidden bg-white flex flex-col max-h-3/4 gap-4">
        <header className="border-b justify-between border-b-disabled flex items-center p-4">
          <span />
          <h3 className="font-bold text-xl">Seleccionar plantilla</h3>

          <button
            onClick={() => hideDialog(id)}
            className="w-fit p-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <Icon icon={"tabler:x"} className="text-2xl" />
          </button>
        </header>
        <div className="flex-1 px-4 py-3 flex flex-col gap-4 h-full overflow-y-auto">
          <header className="">
            <CustomInput placeholder="Buscar..." />
          </header>

          {/* Modal body */}
          <div className="flex-1 overflow-y-auto pr-1 w-full h-full">
            {items.length ? (
              <ul className="w-full flex flex-col items-center gap-2 h-full">
                {items.map((template) => (
                  <li className="w-full" key={template._id}>
                    {/* Template card */}
                    <button
                      type="button"
                      onClick={() => handleSelect(template._id)}
                      className={clsx([
                        "text-left w-full flex items-center gap-4 border transition-colors px-3 py-1 rounded-lg",
                        value === template._id
                          ? "bg-primary-500/20 border-primary-500/40"
                          : "hover:bg-stone-200 border-disabled",
                      ])}
                    >
                      <Icon
                        icon={"fa6-regular:file-pdf"}
                        className="text-6xl text-primary-500"
                      />
                      <h6 className="w-full relative before:w-full before:absolute before:top-full before:left-0 before:h-[1px] before:bg-disabled font-bold text-lg">
                        {template.name}
                      </h6>

                      {value === template._id && (
                        <Icon
                          icon={"tabler:check"}
                          className="text-3xl text-primary-500"
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay plantillas para mostrar</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectTemplateDialog;
