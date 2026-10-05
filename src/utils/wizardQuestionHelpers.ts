import { WizardAnswers, WizardQuestionDefinition } from "@/types/wizardRisk.types";

/** Prefijo de campos condicionales dentro del string[] de una respuesta. */
export const CONDITIONAL_FIELD_PREFIX = "__cf:";

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

export function isConditionalFieldToken(value: string): boolean {
  return value.startsWith(CONDITIONAL_FIELD_PREFIX);
}

/** Valores de opción realmente seleccionados (sin campos de texto). */
export function getSelectedValues(answer?: string[]): string[] {
  return (answer ?? []).filter((value) => !isConditionalFieldToken(value));
}

/** Campos de texto asociados a cada opción seleccionada. */
export function getConditionalFields(answer?: string[]): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const item of answer ?? []) {
    if (!isConditionalFieldToken(item)) continue;
    const rest = item.slice(CONDITIONAL_FIELD_PREFIX.length);
    const eq = rest.indexOf("=");
    if (eq < 0) continue;
    fields[rest.slice(0, eq)] = rest.slice(eq + 1);
  }

  return fields;
}

export function encodeAnswer(selected: string[], fields: Record<string, string>): string[] {
  const encoded = [...selected];
  for (const [optionValue, text] of Object.entries(fields)) {
    if (!selected.includes(optionValue)) continue;
    const trimmed = text.trim();
    if (!trimmed) continue;
    encoded.push(`${CONDITIONAL_FIELD_PREFIX}${optionValue}=${trimmed}`);
  }
  return encoded;
}

export function getConditionalFieldValue(answer: string[] | undefined, optionValue: string): string {
  return getConditionalFields(answer)[optionValue] ?? "";
}

/** True si B1-P2 tiene una respuesta (todas las opciones del spec son > 0 empleados). */
export function hasEmployees(answers: WizardAnswers): boolean {
  return getSelectedValues(answers["B1-P2"]).length > 0;
}

/**
 * True si la respuesta incluye alguna opción "Sí" (cualquier value distinto
 * de las opciones exclusivas de "No").
 */
export function hasYesSelection(answer: string[] | undefined, noValues: string[] = ["no", "no_chile", "no_seguro"]): boolean {
  const selected = getSelectedValues(answer);
  return selected.some((value) => !noValues.includes(value));
}

export function isNoSelection(answer: string[] | undefined, noValues: string[] = ["no", "no_chile", "no_seguro"]): boolean {
  const selected = getSelectedValues(answer);
  return selected.length > 0 && selected.every((value) => noValues.includes(value));
}
