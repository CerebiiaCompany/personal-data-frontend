"use client";

import React, { useRef, useState } from "react";
import CustomInput from "../forms/CustomInput";
import Button from "../base/Button";
import { Icon } from "@iconify/react/dist/iconify.js";
import CustomCheckbox from "../forms/CustomCheckbox";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { hideDialog } from "@/utils/dialogs.utils";

const UploadTemplateDialog = () => {
  const id = HTML_IDS_DATA.uploadTemplateDialog;

  function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if ((e.target as HTMLElement).id === id) {
      hideDialog(id);
    }
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
        <header className="border-b justify-between border-b-disabled flex items-center p-4 gap-6">
          <div className="rounded-full ml-4 border border-disabled p-2">
            <Icon icon={"basil:cloud-upload-outline"} className="text-5xl" />
          </div>

          <div className="flex flex-col items-start text-left">
            <h3 className="font-bold text-xl text-left w-full">
              Subir archivos
            </h3>
            <p>Selecciona y carga los archivos de tu elección</p>
          </div>

          <button
            onClick={() => hideDialog(id)}
            className="w-fit p-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <Icon icon={"tabler:x"} className="text-2xl" />
          </button>
        </header>
        <div className="flex-1 px-4 py-3 flex flex-col gap-4 h-full overflow-y-auto">
          {/* Modal body */}
          <div className="flex-1 overflow-y-auto pr-1 w-full h-full flex flex-col gap-4">
            {/* Drop zone */}
            <div className="w-full border border-dashed border-disabled rounded-lg px-4 py-3 bg-primary-50 flex flex-col items-center gap-2">
              <Icon
                icon={"basil:cloud-upload-outline"}
                className="text-6xl text-primary-900"
              />
              <h6 className="text-primary-900 font-bold text-lg">
                Elige un archivo o arrástralo y suéltalo aquí.
              </h6>
              <p className="font-medium">Formato: PDF hasta 50 MB.</p>
              <Button hierarchy="secondary">Buscar archivo</Button>
            </div>

            {/* Files to upload resume */}

            <div className="h-full w-full flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
              {new Array(3).fill(null).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-disabled px-4 py-2 flex-col gap-1.5 flex"
                >
                  <div className="flex items-center gap-4">
                    <Icon
                      icon={"fa6-regular:file-pdf"}
                      className="text-6xl text-primary-500"
                    />

                    <div className="w-full flex-col items-start gap-3">
                      <h6 className="font-bold text-lg text-primary-900">
                        Plantilla #1
                      </h6>
                      <div className="flex items-center gap-1">
                        <p className="text-stone-500 text-sm font-medium">
                          60 KB DE 120 KB
                        </p>
                        <Icon
                          icon={"line-md:uploading"}
                          className="text-primary-500"
                        />
                        <p className="text-stone-500 text-sm font-medium">
                          Subiendo{" "}
                        </p>
                      </div>
                    </div>

                    <button className="w-fit p-1 rounded-lg hover:bg-stone-100 transition-colors">
                      <Icon icon={"tabler:x"} className="text-2xl" />
                    </button>
                  </div>

                  <div className="h-1.5 bg-stone-400 w-full rounded-lg flex">
                    <span className="w-3/4 bg-primary-900 rounded-lg h-full inline-block"></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* End Actions */}
          <Button className="w-full">Subir archivo</Button>
        </div>
      </div>
    </div>
  );
};

export default UploadTemplateDialog;
