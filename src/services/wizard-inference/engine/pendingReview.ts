import { selectedValues } from "../answerReader";
import { TreatmentMappingRule, WizardAnswerMap, WizardInferenceFlags, WizardInferenceSystemInput } from "../types";
import { B4_SYSTEMS_PENDING_KEY, isUnknownServerCountry } from "./serverCountry";

const UNCERTAIN_VALUES = new Set(["no_seguro", "no_se"]);

/** True si la pregunta se respondió con una opción de incertidumbre ("No estoy seguro"/"No sé"). */
export function isUncertain(answers: WizardAnswerMap, key: string): boolean {
  return selectedValues(answers[key]).some((value) => UNCERTAIN_VALUES.has(value));
}

/**
 * Item N-14 — flags de transferencia internacional cuya incertidumbre en
 * B2-P11 (ver C-02: ya no existe un tratamiento propio para esa pregunta,
 * es un atributo de "los demás tratamientos") debe propagarse como revisión
 * pendiente a cualquier tratamiento cuyo atributo de transferencia dependa
 * de una de ellas.
 */
const INTL_TRANSFER_FLAGS: (keyof WizardInferenceFlags)[] = [
  "hasForeignCloud",
  "hasForeignCrm",
  "hasForeignMarketingSaas",
];

export interface PendingReviewResolution {
  generatesPendingReview: boolean;
  pendingReviewQuestionKey?: string;
}

function transferDependsOnForeignFlag(rule: TreatmentMappingRule): boolean {
  return (
    rule.internationalTransfer.mode === "if" &&
    INTL_TRANSFER_FLAGS.includes(rule.internationalTransfer.flag)
  );
}

function hasUncertainServerCountry(systems?: WizardInferenceSystemInput[]): boolean {
  return Boolean(
    systems?.some((row) => {
      if (row.name?.trim().toLowerCase() === "cerebiia") return false;
      return isUnknownServerCountry(row.serverCountry);
    })
  );
}

/**
 * Resuelve si un tratamiento (ya incluido, sea por trigger normal o por
 * rule.forceIncludeOnUncertaintyKey — ver WizardInferenceService.mapTreatments)
 * debe marcarse con incertidumbre pendiente:
 * 1) alguna de sus propias sourceKeys se respondió con incertidumbre, o
 * 2) su regla de transferencia internacional depende de un flag cuya
 *    pregunta de origen (B2-P11) se respondió con incertidumbre, o
 * 3) Item N-16 — el país de un sistema del Bloque 4 quedó en "No estoy seguro"
 *    (el catálogo sugiere, nunca asume; C-04 si no se puede confirmar).
 */
export function resolvePendingReview(
  rule: TreatmentMappingRule,
  answers: WizardAnswerMap,
  systems?: WizardInferenceSystemInput[]
): PendingReviewResolution {
  const ownUncertainKey = rule.sourceKeys.find((key) => isUncertain(answers, key));
  if (ownUncertainKey) {
    return { generatesPendingReview: true, pendingReviewQuestionKey: ownUncertainKey };
  }

  if (transferDependsOnForeignFlag(rule) && isUncertain(answers, "B2-P11")) {
    return { generatesPendingReview: true, pendingReviewQuestionKey: "B2-P11" };
  }

  if (transferDependsOnForeignFlag(rule) && hasUncertainServerCountry(systems)) {
    return { generatesPendingReview: true, pendingReviewQuestionKey: B4_SYSTEMS_PENDING_KEY };
  }

  return { generatesPendingReview: false };
}
