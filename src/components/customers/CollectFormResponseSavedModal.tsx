"use client";

import React from "react";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { hideDialog } from "@/utils/dialogs.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "../base/Button";

interface Props {
  fullName: string;
  onNewRegistration?: () => void;
}

const CollectFormResponseSavedModal = ({ fullName, onNewRegistration }: Props) => {
  const id = HTML_IDS_DATA.collectFormResponseSavedModal;

  const handleNewRegistration = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    hideDialog(id);
    if (onNewRegistration) {
      onNewRegistration();
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hideDialog(id);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Solo cerrar si se hace clic directamente en el backdrop, no en el modal
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      hideDialog(id);
    }
  };

  return (
    /* Wrapper */
    <div
      id={id}
      className="dialog-wrapper fixed w-full top-0 left-0 h-full z-20 justify-center items-center bg-black/50"
      onClick={handleBackdropClick}
    >
      {/* Modal */}
      <div 
        className="animate-appear w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center">
          {/* Icono de verificación con animación */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center shadow-lg">
              <Icon
                icon="tabler:circle-check-filled"
                className="text-6xl text-green-500"
              />
            </div>
          </div>
          
          {/* Título mejorado */}
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            ¡Registro exitoso!
          </h3>
          
          {/* Mensaje mejorado */}
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            <span className="font-semibold text-gray-900">{fullName}</span> ha sido registrado correctamente.
          </p>
          
          {/* Botón principal mejorado */}
          <div className="mb-4">
            <Button
              type="button"
              hierarchy="primary"
              className="w-full py-3 px-6 text-base font-semibold h-12 shadow-md hover:shadow-lg transition-shadow"
              onClick={handleNewRegistration}
              startContent={
                <Icon 
                  icon="tabler:user-plus" 
                  className="text-xl"
                />
              }
            >
              Registrar nuevo
            </Button>
          </div>
          
          {/* Enlace para cerrar mejorado */}
          <button 
            type="button"
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-200 font-medium underline underline-offset-2"
          >
            O haz clic aquí para cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectFormResponseSavedModal;
