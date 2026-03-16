"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Button from "../base/Button";
import { ConfirmDialogOptions } from "./ConfirmProvider";

interface Props extends ConfirmDialogOptions {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<Props> = (props) => {
  const {
    open,
    title = "¿Estás seguro?",
    description,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
    loading,
    danger,
    withReasonField,
    reasonLabel,
    reasonPlaceholder,
    onReasonChange,
  } = props;
  if (!open) return null;

  const [reason, setReason] = useState("");

  useEffect(() => {
    // Resetear motivo cada vez que se abre el modal
    if (open) {
      setReason("");
    }
  }, [open]);

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
          <div className="mt-2 text-sm text-stone-500">{description}</div>
        )}

        {typeof withReasonField !== "undefined" &&
          withReasonField && (
            <div className="mt-4">
              <label className="block text-xs font-medium text-stone-600 mb-1">
                {reasonLabel || "Razón (opcional)"}
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => {
                  const value = e.target.value;
                  setReason(value);
                  onReasonChange?.(value);
                }}
                placeholder={
                  reasonPlaceholder || "Escribe aquí el motivo de esta acción..."
                }
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-primary-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>
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
