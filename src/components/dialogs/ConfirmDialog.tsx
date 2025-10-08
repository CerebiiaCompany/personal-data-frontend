"use client";

import React from "react";
import ReactDOM from "react-dom";
import Button from "../base/Button";
import { ConfirmDialogOptions } from "./ConfirmProvider";

interface Props extends ConfirmDialogOptions {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<Props> = ({
  open,
  title = "¿Estás seguro?",
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  loading,
  danger,
}) => {
  if (!open) return null;

  // Render via portal to avoid z-index/layout issues
  return ReactDOM.createPortal(
    <div
      aria-modal
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={loading ? undefined : onCancel}
      />
      {/* Card */}
      <div className="relative z-10 animate-appear w-[min(92vw,28rem)] rounded-lg bg-white p-5 shadow-xl">
        {title && (
          <h3 className="font-bold text-primary-900 text-xl">{title}</h3>
        )}
        {description && (
          <p className="mt-2 text-sm text-stone-500">{description}</p>
        )}

        <div className="mt-5 flex gap-3 justify-end">
          <Button
            hierarchy="secondary"
            type="button"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            className={danger ? "bg-red-400 border-red-400" : ""}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
