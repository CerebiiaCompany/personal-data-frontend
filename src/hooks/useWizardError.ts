import { useErrorContext } from "@/contexts/ErrorContext";
import { WizardErrorKey } from "@/constants/wizardErrors";

/**
 * Punto único para disparar errores del wizard desde cualquier componente.
 *
 * Uso:
 *   const { showError, clearError } = useWizardError();
 *   showError("ERR_01");
 *   showError("ERR_02", { TYPE: "datos de salud" });
 */
export function useWizardError() {
  const { showError, showValidationError, showBlockingError, clearError, error, isVisible } =
    useErrorContext();

  return {
    error,
    isVisible,
    showError: (key: WizardErrorKey, replacements?: Record<string, string>) =>
      showError(key, replacements),
    showValidationError: (
      key: WizardErrorKey,
      fieldName?: string,
      replacements?: Record<string, string>
    ) => showValidationError(key, fieldName, replacements),
    showBlockingError: (key: WizardErrorKey, replacements?: Record<string, string>) =>
      showBlockingError(key, replacements),
    clearError,
  };
}
