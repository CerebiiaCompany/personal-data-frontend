export type WizardErrorSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";
export type WizardErrorType = "VALIDATION" | "BLOCKING";

export interface WizardErrorDefinition {
  code: string;
  message: string;
  type: WizardErrorType;
  severity: WizardErrorSeverity;
  showRetry?: boolean;
  showCode?: boolean;
}

export const WIZARD_ERRORS = {
  ERR_01: {
    code: "ERR-01",
    message: "Por favor selecciona una respuesta para continuar.",
    type: "VALIDATION",
    severity: "INFO",
  },
  ERR_02: {
    code: "ERR-02",
    message:
      "Los datos de [TYPE] solo pueden tratarse con autorización expresa de cada persona.",
    type: "BLOCKING",
    severity: "ERROR",
  },
  ERR_03: {
    code: "ERR-03",
    message:
      "Para activar tu empresa necesitas designar responsable de protección de datos.",
    type: "BLOCKING",
    severity: "ERROR",
  },
  ERR_04: {
    code: "ERR-04",
    message: "Aún hay [COUNT] tratamientos sin revisar. Por favor revisa cada uno.",
    type: "VALIDATION",
    severity: "WARNING",
  },
  ERR_05: {
    code: "ERR-05",
    message:
      "No pudimos guardar tu configuración. Verifica tu conexión e intenta de nuevo.",
    type: "BLOCKING",
    severity: "ERROR",
    showRetry: true,
  },
  ERR_06: {
    code: "ERR-06",
    message: "Por favor indica si este sistema almacena los datos en Chile o fuera.",
    type: "VALIDATION",
    severity: "WARNING",
  },
  ERR_07: {
    code: "ERR-07",
    message:
      "Necesitamos identificar al menos una actividad que involucre datos de personas.",
    type: "BLOCKING",
    severity: "ERROR",
  },
  ERR_08: {
    code: "ERR-08",
    message: "Error inesperado. Tus respuestas están guardadas. Intenta de nuevo.",
    type: "BLOCKING",
    severity: "ERROR",
  },
  ERR_09: {
    code: "ERR-09",
    message: "Error crítico. Contacta a soporte con código: WIZ-[TIMESTAMP]",
    type: "BLOCKING",
    severity: "CRITICAL",
    showCode: true,
  },
} as const satisfies Record<string, WizardErrorDefinition>;

export type WizardErrorKey = keyof typeof WIZARD_ERRORS;

export function formatWizardErrorMessage(
  key: WizardErrorKey,
  replacements?: Record<string, string>
): string {
  let message: string = WIZARD_ERRORS[key].message;
  if (!replacements) return message;
  for (const [token, value] of Object.entries(replacements)) {
    message = message.replaceAll(`[${token}]`, value);
  }
  return message;
}
