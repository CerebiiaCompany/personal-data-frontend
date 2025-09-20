"use client";

import React, { useRef, useState } from "react";
import CustomInput from "../forms/CustomInput";
import Button from "../base/Button";
import { Icon } from "@iconify/react/dist/iconify.js";
import CustomCheckbox from "../forms/CustomCheckbox";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";

const SelectTemplateDialog = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  function hideDialog() {
    wrapperRef.current?.classList.remove("dialog-visible");
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if ((e.target as HTMLElement).id === HTML_IDS_DATA.selectTemplateDialog) {
      hideDialog();
    }
  }

  return (
    /* Wrapper */
    <div
      onClick={handleClick}
      id={HTML_IDS_DATA.selectTemplateDialog}
      ref={wrapperRef}
      className="dialog-wrapper fixed hidden w-full top-0 left-0 h-full z-20 justify-center items-center bg-stone-900/50"
    >
      {/* Modal */}
      <div className="w-full animate-appear max-w-xl rounded-xl overflow-hidden bg-white flex flex-col max-h-3/4 gap-4">
        <header className="border-b justify-between border-b-disabled flex items-center p-4">
          <span />
          <h3 className="font-bold text-xl">Seleccionar plantilla</h3>

          <button
            onClick={hideDialog}
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
            <ul className="w-full flex flex-col items-center gap-2 h-full">
              {new Array(10).fill(null).map((_, index) => (
                <li className="w-full" key={index}>
                  {/* Template card */}
                  <div className="w-full p-1.5 flex gap-3 items-center">
                    {/* Checkbox */}
                    <div className="">
                      <CustomCheckbox />
                    </div>
                    <div className="flex-1 flex items-center gap-4 border border-disabled px-3 py-1 rounded-lg">
                      <Icon
                        icon={"fa6-regular:file-pdf"}
                        className="text-6xl text-primary-500"
                      />
                      <h6 className="w-full relative before:w-full before:absolute before:top-full before:left-0 before:h-[1px] before:bg-disabled font-bold text-lg">
                        Plantilla #1
                      </h6>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* End Actions */}
          <Button className="w-full">Subir archivo</Button>
        </div>
      </div>
    </div>
  );
};

export default SelectTemplateDialog;
