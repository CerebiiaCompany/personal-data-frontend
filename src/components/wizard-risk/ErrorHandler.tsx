"use client";

import { useErrorContext } from "@/contexts/ErrorContext";
import ValidationMessage from "./ValidationMessage";
import ErrorModal from "./ErrorModal";

interface ErrorHandlerProps {
  /** Se invoca cuando el usuario pulsa "Reintentar" en un error bloqueante con showRetry. */
  onRetry?: () => void;
}

/** Orquesta el render del error activo del wizard según su tipo (inline vs. modal). */
export default function ErrorHandler({ onRetry }: ErrorHandlerProps) {
  const { error, clearError } = useErrorContext();

  if (!error) return null;

  if (error.type === "VALIDATION") {
    return (
      <ValidationMessage message={error.message} fieldName={error.fieldName} onDismiss={clearError} />
    );
  }

  return (
    <ErrorModal
      code={error.code}
      message={error.message}
      showRetry={error.showRetry}
      showCode={error.showCode}
      onRetry={onRetry ?? clearError}
      onDismiss={clearError}
    />
  );
}
