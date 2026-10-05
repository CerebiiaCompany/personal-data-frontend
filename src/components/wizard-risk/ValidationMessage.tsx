"use client";

import { Icon } from "@iconify/react/dist/iconify.js";

interface ValidationMessageProps {
  message: string;
  fieldName?: string;
  onDismiss?: () => void;
}

export default function ValidationMessage({ message, fieldName, onDismiss }: ValidationMessageProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      data-field={fieldName}
      className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
    >
      <Icon icon="tabler:alert-triangle" className="mt-0.5 shrink-0 text-base" aria-hidden="true" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Descartar mensaje de validación"
          className="text-xs font-semibold underline"
        >
          Cerrar
        </button>
      )}
    </div>
  );
}
