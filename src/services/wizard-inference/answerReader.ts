import { WizardAnswerMap } from "./types";

const FIELD_PREFIX = "__cf:";
const NO_VALUES = new Set(["no", "no_chile", "no_seguro", "no_se"]);

export function selectedValues(answer?: string[]): string[] {
  return (answer ?? []).filter((value) => !value.startsWith(FIELD_PREFIX));
}

export function hasYes(answers: WizardAnswerMap, key: string, anyOf?: string[]): boolean {
  const selected = selectedValues(answers[key]);
  const yes = selected.filter((value) => !NO_VALUES.has(value));
  if (yes.length === 0) return false;
  if (!anyOf || anyOf.length === 0) return true;
  return yes.some((value) => anyOf.includes(value));
}

export function firstValue(answers: WizardAnswerMap, key: string): string | null {
  return selectedValues(answers[key])[0] ?? null;
}

export function employeeCountMin(band: string | null): number {
  switch (band) {
    case "1-5":
      return 1;
    case "6-50":
      return 6;
    case "51-200":
      return 51;
    case "200+":
      return 201;
    default:
      return 0;
  }
}
