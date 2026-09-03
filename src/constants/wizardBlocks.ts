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
