"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  WIZARD_ERRORS,
  WizardErrorKey,
  WizardErrorType,
  formatWizardErrorMessage,
} from "@/constants/wizardErrors";

export interface WizardActiveError {
  code: string;
  message: string;
  type: WizardErrorType;
  fieldName?: string;
  showRetry?: boolean;
  showCode?: boolean;
  timestamp: string;
}

interface ErrorContextValue {
  error: WizardActiveError | null;
  isVisible: boolean;
  showError: (key: WizardErrorKey, replacements?: Record<string, string>) => void;
  showValidationError: (
    key: WizardErrorKey,
    fieldName?: string,
    replacements?: Record<string, string>
  ) => void;
  showBlockingError: (key: WizardErrorKey, replacements?: Record<string, string>) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextValue | null>(null);

export function useErrorContext() {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error("useErrorContext debe usarse dentro de ErrorProvider");
  return ctx;
}

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [error, setErrorState] = useState<WizardActiveError | null>(null);

  const buildError = useCallback(
    (key: WizardErrorKey, replacements?: Record<string, string>, fieldName?: string): WizardActiveError => {
      const def = WIZARD_ERRORS[key];
      const message = formatWizardErrorMessage(key, {
        ...replacements,
        TIMESTAMP: replacements?.TIMESTAMP ?? new Date().toISOString(),
      });
      return {
        code: def.code,
        message,
        type: def.type,
        fieldName,
        showRetry: "showRetry" in def ? def.showRetry : undefined,
        showCode: "showCode" in def ? def.showCode : undefined,
        timestamp: new Date().toISOString(),
      };
    },
    []
  );

  const showError = useCallback(
    (key: WizardErrorKey, replacements?: Record<string, string>) => {
      setErrorState(buildError(key, replacements));
    },
    [buildError]
  );

  const showValidationError = useCallback(
    (key: WizardErrorKey, fieldName?: string, replacements?: Record<string, string>) => {
      setErrorState(buildError(key, replacements, fieldName));
    },
    [buildError]
  );

  const showBlockingError = useCallback(
    (key: WizardErrorKey, replacements?: Record<string, string>) => {
      setErrorState(buildError(key, replacements));
    },
    [buildError]
  );

  const clearError = useCallback(() => setErrorState(null), []);

  const value = useMemo<ErrorContextValue>(
    () => ({
      error,
      isVisible: error !== null,
      showError,
      showValidationError,
      showBlockingError,
      clearError,
    }),
    [error, showError, showValidationError, showBlockingError, clearError]
  );

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
}
