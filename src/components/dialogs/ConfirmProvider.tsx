"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import ConfirmDialog from "./ConfirmDialog";

export interface ConfirmDialogOptions {
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean; // optional: you can toggle this externally if needed
  /** Mostrar campo de texto para razón de la acción (por ejemplo, motivo de eliminación) */
  withReasonField?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  /** Callback opcional para recibir el valor del campo de razón */
  onReasonChange?: (reason: string) => void;
}

type ConfirmFn = (opts?: ConfirmDialogOptions) => Promise<boolean>;
const ConfirmCtx = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const resolverRef = useRef<(v: boolean) => void>(() => {});
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmDialogOptions | undefined>(undefined);
  const [internalLoading, setInternalLoading] = useState(false);

  const confirm: ConfirmFn = useCallback((options) => {
    setOpts(options);
    setOpen(true);
    setInternalLoading(false);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleClose = (value: boolean) => {
    resolverRef.current?.(value);
    setOpen(false);
    setInternalLoading(false);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}

      <ConfirmDialog
        {...opts}
        open={open}
        loading={opts?.loading ?? internalLoading}
        onCancel={() => handleClose(false)}
        onConfirm={() => handleClose(true)}
      />
    </ConfirmCtx.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) {
    throw new Error("useConfirm must be used within <ConfirmProvider>");
  }
  return ctx;
}
