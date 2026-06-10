import { ArcoOppositionScope } from "@/types/arco.types";

export const ARCO_OPPOSITION_SCOPE_VALUES: readonly ArcoOppositionScope[] = [
  "ALL_CAMPAIGNS",
  "MARKETING_CAMPAIGNS",
  "CONSENT_CAMPAIGNS",
  "THIRD_PARTY_SHARING",
] as const;

const ALLOWED_SET = new Set<string>(ARCO_OPPOSITION_SCOPE_VALUES);

export function isArcoOppositionScope(value: string): value is ArcoOppositionScope {
  return ALLOWED_SET.has(value);
}

/**
 * Valida oppositionScopes antes de enviar al backend.
 * Retorna mensaje de error o null si es válido.
 */
export function validateOppositionScopes(scopes: string[]): string | null {
  if (!scopes.length) {
    return "Selecciona al menos un ámbito al que te opones.";
  }

  for (const scope of scopes) {
    if (!isArcoOppositionScope(scope)) {
      return "Hay un ámbito de oposición no válido. Actualiza la página e intenta de nuevo.";
    }
  }

  const hasAll = scopes.includes("ALL_CAMPAIGNS");
  const hasMarketing = scopes.includes("MARKETING_CAMPAIGNS");
  const hasConsent = scopes.includes("CONSENT_CAMPAIGNS");

  if (hasAll && (hasMarketing || hasConsent)) {
    return "«Bloquear todas las campañas» ya incluye marketing y consentimiento. Quita los tipos individuales.";
  }

  if (hasMarketing && hasConsent) {
    return "Para oponerte a marketing y consentimiento a la vez, marca «Bloquear todas las campañas». Puedes añadir «Compartir datos con terceros» si aplica.";
  }

  return null;
}

/**
 * THIRD_PARTY_SHARING es independiente y combinable con cualquier opción de campaña válida.
 * ALL_CAMPAIGNS y los tipos individuales (marketing / consentimiento) son mutuamente excluyentes.
 */
export function toggleOppositionScope(
  current: ArcoOppositionScope[],
  scope: ArcoOppositionScope,
  checked: boolean
): ArcoOppositionScope[] {
  if (scope === "THIRD_PARTY_SHARING") {
    if (checked) {
      return current.includes(scope) ? current : [...current, scope];
    }
    return current.filter((s) => s !== scope);
  }

  if (scope === "ALL_CAMPAIGNS") {
    if (checked) {
      const keepThird = current.includes("THIRD_PARTY_SHARING")
        ? (["THIRD_PARTY_SHARING"] as ArcoOppositionScope[])
        : [];
      return ["ALL_CAMPAIGNS", ...keepThird];
    }
    return current.filter((s) => s !== "ALL_CAMPAIGNS");
  }

  if (scope === "MARKETING_CAMPAIGNS") {
    if (checked) {
      const next = current.filter(
        (s) => s !== "ALL_CAMPAIGNS" && s !== "CONSENT_CAMPAIGNS"
      );
      return next.includes("MARKETING_CAMPAIGNS")
        ? next
        : [...next, "MARKETING_CAMPAIGNS"];
    }
    return current.filter((s) => s !== "MARKETING_CAMPAIGNS");
  }

  if (scope === "CONSENT_CAMPAIGNS") {
    if (checked) {
      const next = current.filter(
        (s) => s !== "ALL_CAMPAIGNS" && s !== "MARKETING_CAMPAIGNS"
      );
      return next.includes("CONSENT_CAMPAIGNS")
        ? next
        : [...next, "CONSENT_CAMPAIGNS"];
    }
    return current.filter((s) => s !== "CONSENT_CAMPAIGNS");
  }

  return current;
}

export function isOppositionScopeDisabled(
  current: ArcoOppositionScope[],
  scope: ArcoOppositionScope
): boolean {
  if (scope === "THIRD_PARTY_SHARING") {
    return false;
  }

  const hasAll = current.includes("ALL_CAMPAIGNS");
  const hasMarketing = current.includes("MARKETING_CAMPAIGNS");
  const hasConsent = current.includes("CONSENT_CAMPAIGNS");

  if (scope === "ALL_CAMPAIGNS") {
    return hasMarketing || hasConsent;
  }
  if (scope === "MARKETING_CAMPAIGNS") {
    return hasAll || hasConsent;
  }
  if (scope === "CONSENT_CAMPAIGNS") {
    return hasAll || hasMarketing;
  }

  return false;
}
