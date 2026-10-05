import { hasYes } from "../answerReader";
import {
  SecurityMeasureItem,
  SecurityRule,
  SecurityWhen,
  WizardInferenceFlags,
  WizardInferenceInput,
} from "../types";

export interface SecurityDraft {
  id: string;
  tags: string[];
  isSensitive: boolean;
  internationalTransfer: boolean;
}

function evaluateWhen(when: SecurityWhen, input: WizardInferenceInput, flags: WizardInferenceFlags): boolean {
  switch (when.kind) {
    case "always":
      return true;
    case "flag":
      return Boolean(flags[when.flag]);
    case "yes":
      return hasYes(input.answers, when.key);
    default:
      return false;
  }
}

function appliesTo(ruleTarget: SecurityRule["applyTo"], draft: SecurityDraft): boolean {
  switch (ruleTarget.target) {
    case "all":
      return true;
    case "sensitive":
      return draft.isSensitive;
    case "international":
      return draft.internationalTransfer;
    case "tags":
      return ruleTarget.tags.some((tag) => draft.tags.includes(tag));
    case "ids":
      return ruleTarget.ids.includes(draft.id);
    default:
      return false;
  }
}

function slug(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Inyecta las medidas de la Tabla 6. Obligatorias y de alto riesgo no son removibles.
 */
export function injectSecurityMeasures(
  draft: SecurityDraft,
  input: WizardInferenceInput,
  flags: WizardInferenceFlags,
  securityRules: SecurityRule[]
): SecurityMeasureItem[] {
  const byLabel = new Map<string, SecurityMeasureItem>();

  for (const rule of securityRules) {
    if (!evaluateWhen(rule.when, input, flags) || !appliesTo(rule.applyTo, draft)) continue;

    for (const label of rule.measures) {
      const normalized = slug(label);
      const existing = byLabel.get(normalized);
      const next: SecurityMeasureItem = {
        code: `${rule.id}:${normalized}`,
        label,
        foundation: rule.foundation,
        level: rule.level,
        removable: rule.level === "RECOMENDADO",
      };
      if (!existing || severity(next.level) > severity(existing.level)) {
        byLabel.set(normalized, next);
      }
    }
  }

  return [...byLabel.values()];
}

function severity(level: SecurityMeasureItem["level"]): number {
  if (level === "OBLIGATORIO") return 3;
  if (level === "ALTO_RIESGO") return 2;
  return 1;
}
