import { hasYes } from "../answerReader";
import { TriggerExpr, WizardInferenceFlags, WizardInferenceInput } from "../types";

export function evaluateTrigger(expr: TriggerExpr, input: WizardInferenceInput, flags: WizardInferenceFlags): boolean {
  switch (expr.kind) {
    case "always":
      return true;
    case "yes":
      return hasYes(input.answers, expr.key, expr.anyOf);
    case "industry":
      return flags.industry !== null && expr.in.includes(flags.industry);
    case "employeesGt":
      return flags.employeeCountMin > expr.n;
    case "all":
      return expr.of.every((child) => evaluateTrigger(child, input, flags));
    case "any":
      return expr.of.some((child) => evaluateTrigger(child, input, flags));
    case "not":
      return !evaluateTrigger(expr.of, input, flags);
    default:
      return false;
  }
}
