import { WizardAnswers } from "@/types/wizardRisk.types";
import { BLOCK1_QUESTIONS } from "@/constants/wizard-blocks/block1Questions";
import { BLOCK2_QUESTIONS } from "@/constants/wizard-blocks/block2Questions";
import { BLOCK3_QUESTIONS } from "@/constants/wizard-blocks/block3Questions";
import { BLOCK4_QUESTIONS } from "@/constants/wizard-blocks/block4Questions";

export interface WizardBlockInfo {
  number: 1 | 2 | 3 | 4 | 5;
  name: string;
  shortName: string;
  estimatedMinutes: number;
  icon: string;
  summary: string;
}

/** Batch 2 — copy y estimaciones de tiempo de la pantalla de bienvenida y del WizardHeader. */
export const WIZARD_BLOCKS: WizardBlockInfo[] = [
  {
    number: 1,
    name: "Perfil de la Organización",
    shortName: "Perfil",
    estimatedMinutes: 5,
    icon: "tabler:building",
    summary: "Con tu perfil adaptamos el resto del diagnóstico a tu empresa.",
  },
  {
    number: 2,
    name: "Diagnóstico Inicial de Riesgo",
    shortName: "Riesgo",
    estimatedMinutes: 10,
    icon: "tabler:shield-search",
    summary: "Detectamos datos sensibles y obligaciones especiales de la Ley 21.719.",
  },
  {
    number: 3,
    name: "Inventario de Tratamientos",
    shortName: "Tratamientos",
    estimatedMinutes: 15,
    icon: "tabler:clipboard-list",
    summary: "Registramos las actividades que tratan datos personales.",
  },
  {
    number: 4,
    name: "Inventario de Sistemas",
    shortName: "Sistemas",
    estimatedMinutes: 10,
    icon: "tabler:server",
    summary: "Documentamos dónde viven los datos y si salen de Chile.",
  },
  {
    number: 5,
    name: "Validación y Designación del DPO",
    shortName: "DPO",
    estimatedMinutes: 8,
    icon: "tabler:rocket",
    summary: "Validas lo inferido, el consentimiento biométrico (si aplica) y designas al responsable de protección de datos.",
  },
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
// El bloque real se deriva de `currentQuestion` y de las preguntas
// VISIBLES para estas respuestas (B3-P16..P19 y B3-P23 son condicionales).
// Bloque 4 suma 1 slot (tabla de sistemas) y Bloque 5 suma 3 (validación
// de tratamientos + consentimiento biométrico C-01 + formulario DPO).
function countVisibleQuestions(
  questions: { showIf?: (answers: WizardAnswers) => boolean; hideIf?: (answers: WizardAnswers) => boolean }[],
  answers: WizardAnswers
): number {
  return questions.filter((q) => {
    if (q.showIf) return q.showIf(answers);
    if (q.hideIf) return !q.hideIf(answers);
    return true;
  }).length;
}

function wizardBlockSlotCounts(answers: WizardAnswers): number[] {
  return [
    countVisibleQuestions(BLOCK1_QUESTIONS, answers),
    countVisibleQuestions(BLOCK2_QUESTIONS, answers),
    countVisibleQuestions(BLOCK3_QUESTIONS, answers),
    countVisibleQuestions(BLOCK4_QUESTIONS, answers) + 1, // tabla de sistemas
    3, // validación de tratamientos + consentimiento biométrico (C-01) + DPO
  ];
}

export function resolveWizardBlockForQuestion(questionNum: number, answers: WizardAnswers): number {
  const counts = wizardBlockSlotCounts(answers);
  let cumulative = 0;
  for (let i = 0; i < counts.length; i++) {
    cumulative += counts[i];
    if (questionNum <= cumulative) return i + 1;
  }
  return WIZARD_BLOCKS.length;
}

// Bug real encontrado en producción (ver conversación) — cada WizardBlockN
// traía su propio `BLOCK_START_QUESTION` HARDCODEADO (1/6/16/31/37),
// asumiendo que los bloques anteriores siempre muestran TODAS sus
// preguntas condicionales. `resolveWizardBlockForQuestion` (arriba) ya se
// había corregido para calcularlo en vivo (Batch 15), pero cada bloque
// seguía indexando sus propias preguntas VISIBLES contra ese número fijo.
// Resultado real: cualquier empresa con al menos un "No" en una pregunta
// condicional de Bloque 2/3 (el caso normal — casi ninguna empresa activa
// los 10 factores de riesgo de Bloque 2) hacía que `currentQuestion`
// llegara a Bloque 4 por debajo de 31, `localIndex` daba negativo,
// `WizardBlock4` lo confundía con "ya terminé las 5 preguntas" y saltaba
// directo a la tabla de sistemas — preguntas reales del bloque nunca se
// mostraban ni se guardaban. Se reemplaza por este cálculo dinámico
// (mismo criterio que `resolveWizardBlockForQuestion`): la primera
// pregunta global de un bloque es 1 + la suma de "slots" (preguntas
// visibles + pasos extra) de todos los bloques anteriores, para ESTAS
// respuestas concretas.
export function getWizardBlockStartQuestion(blockNum: number, answers: WizardAnswers): number {
  const counts = wizardBlockSlotCounts(answers);
  let start = 1;
  for (let i = 0; i < blockNum - 1; i++) {
    start += counts[i];
  }
  return start;
}

export function getWizardLocalProgress(blockNum: number, questionNum: number, answers: WizardAnswers) {
  const counts = wizardBlockSlotCounts(answers);
  const total = Math.max(1, counts[blockNum - 1] ?? 1);
  const start = getWizardBlockStartQuestion(blockNum, answers);
  const local = Math.min(total, Math.max(1, questionNum - start + 1));
  const overallTotal = counts.reduce((sum, count) => sum + count, 0);
  const overallPercent = Math.min(100, Math.round((questionNum / Math.max(overallTotal, 1)) * 100));

  return { local, total, overallPercent, overallTotal };
}
