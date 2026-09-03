import { WIZARD_TOTAL_QUESTIONS } from "@/types/wizardRisk.types";

export interface WizardBlockInfo {
  number: 1 | 2 | 3 | 4 | 5;
  name: string;
  estimatedMinutes: number;
}

/** Batch 2 — copy y estimaciones de tiempo de la pantalla de bienvenida y del WizardHeader. */
export const WIZARD_BLOCKS: WizardBlockInfo[] = [
  { number: 1, name: "Perfil de la Organización", estimatedMinutes: 5 },
  { number: 2, name: "Diagnóstico Inicial de Riesgo", estimatedMinutes: 10 },
  { number: 3, name: "Inventario de Tratamientos", estimatedMinutes: 15 },
  { number: 4, name: "Inventario de Sistemas", estimatedMinutes: 10 },
  { number: 5, name: "Revisión y Activación", estimatedMinutes: 8 },
];

export const WIZARD_TOTAL_ESTIMATED_MINUTES = WIZARD_BLOCKS.reduce(
  (sum, block) => sum + block.estimatedMinutes,
  0
);

export function getWizardBlockName(blockNum: number): string {
  return WIZARD_BLOCKS.find((b) => b.number === blockNum)?.name ?? `Bloque ${blockNum}`;
}

// Batch 4 — el backend (WIZ-01-RISK) no conoce los límites de bloque: solo
// avanza `currentQuestion` de forma global y nunca toca `currentBlock` (no
// tiene catálogo de preguntas). Cruzar de un bloque a otro es, por ahora,
// una decisión puramente del cliente — así que el bloque "real" de una
// sesión se deriva siempre de `currentQuestion`, nunca se confía en el
// `currentBlock` que devuelve el backend ni en el segmento de la URL tal
// cual.
//
// Batch 6 — Bloques 1-3 cubren preguntas 1-30 (1-5, 6-15, 16-30); Bloque 3
// puede mostrar MENOS de 15 según condicionales, pero el límite GLOBAL de
// pregunta no se mueve por eso — las ocultas simplemente nunca se guardan.
//
// Batch 7-9 — Bloque 4 resultó ser 5 preguntas (31-35) + 1 slot para la
// tabla de sistemas (36, ver WizardBlock4.tsx/SystemsTable.tsx — no es una
// QuestionCard pero consume un `currentQuestion` igual al guardarse).
// Bloque 5 es hasta 10 tarjetas de tratamiento condicionales (37-46) + el
// selector de DPO (47). El total real del wizard es 47, no 30 — ver
// WIZARD_TOTAL_QUESTIONS. La pantalla de confirmación no tiene número de
// pregunta propio: es el destino tras terminar la 47.
const KNOWN_BLOCK_LAST_QUESTION: Record<number, number> = {
  1: 5,
  2: 15,
  3: 30,
  4: 36,
  5: WIZARD_TOTAL_QUESTIONS,
};

export function resolveWizardBlockForQuestion(questionNum: number): number {
  let block = 1;
  for (const [blockNumStr, lastQuestion] of Object.entries(KNOWN_BLOCK_LAST_QUESTION)) {
    if (questionNum > lastQuestion) {
      block = Number(blockNumStr) + 1;
    }
  }
  return Math.min(block, WIZARD_BLOCKS.length);
}
