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
      className="mt-2 flex animate-in fade-in slide-in-from-top-1 items-start gap-1.5 text-sm duration-150"
      style={{ color: "#DC2626" }}
    >
      <Icon icon="tabler:alert-triangle" className="mt-0.5 shrink-0 text-base" aria-hidden="true" />
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Descartar mensaje de validación"
          className="ml-1 text-xs underline"
        >
          Cerrar
        </button>
      )}
    </div>
  );
}
