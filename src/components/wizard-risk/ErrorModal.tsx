"use client";

import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "@/components/base/Button";

interface ErrorModalProps {
  code: string;
  message: string;
  showRetry?: boolean;
  showCode?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorModal({
  code,
  message,
  showRetry,
  showCode,
  onRetry,
  onDismiss,
}: ErrorModalProps) {
  const [copied, setCopied] = useState(false);
  const wizCode = `WIZ-${new Date().toISOString()}`;

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(wizCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Portapapeles no disponible; no bloquea el flujo.
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-error-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-full bg-red-100 p-2">
            <Icon icon="tabler:alert-triangle" className="text-xl text-red-700" aria-hidden="true" />
          </div>
          <div>
            <h3 id="wizard-error-modal-title" className="text-lg font-semibold text-primary-900">
              ⚠️ Hay un problema
            </h3>
            <p className="mt-1 text-sm text-stone-700">{message}</p>
            <p className="mt-1 text-xs text-stone-400">Código: {code}</p>
            {showCode && (
              <p className="mt-1 font-mono text-xs text-stone-500">{wizCode}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {showCode && (
            <Button hierarchy="secondary" onClick={handleCopyCode}>
              {copied ? "Copiado" : "Copiar código"}
            </Button>
          )}
          {showRetry && onRetry && <Button onClick={onRetry}>Reintentar</Button>}
          {onDismiss && (
            <Button hierarchy={showRetry ? "secondary" : "primary"} onClick={onDismiss}>
              {showRetry ? "Cancelar" : "Cerrar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
