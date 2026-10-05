import { WIZARD_TOTAL_BLOCKS, WIZARD_TOTAL_QUESTIONS } from "@/types/wizardRisk.types";

export const WIZARD_WELCOME_PATH = "/wizard/bienvenida";
export const WIZARD_COMPLETION_PATH = "/wizard/finalizacion";

export function getWizardBlockQuestionPath(blockNum: number, questionNum: number): string {
  return `/wizard/bloque/${blockNum}/pregunta/${questionNum}`;
}

export function isValidWizardBlock(blockNum: number): boolean {
  return Number.isInteger(blockNum) && blockNum >= 1 && blockNum <= WIZARD_TOTAL_BLOCKS;
}

export function isValidWizardQuestion(questionNum: number): boolean {
  return Number.isInteger(questionNum) && questionNum >= 1 && questionNum <= WIZARD_TOTAL_QUESTIONS;
}
