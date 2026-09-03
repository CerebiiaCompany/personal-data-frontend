import { WizardQuestionDefinition } from "@/types/wizardRisk.types";

/**
 * Batch 5 — varias preguntas de diagnóstico son MULTIPLE_CHOICE con una
 * sola opción ("Sí, tratamos datos de salud"): son en realidad un checkbox
 * booleano opcional, donde NO marcarlo es una respuesta válida ("No"), no
 * un estado inválido. Distinto de una pregunta con varias opciones reales,
 * donde sí debe elegirse una — ahí aplica la validación normal de
 * QuestionCard (ERR-01 si no hay selección).
 */
export function isOptionalSingleCheckbox(question: WizardQuestionDefinition): boolean {
  return question.type === "MULTIPLE_CHOICE" && question.options.length === 1;
}
