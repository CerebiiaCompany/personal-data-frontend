/**
 * Nombres de bloque para el WizardHeader. Placeholder hasta que los batches
 * de contenido (2+) definan el copy definitivo de cada bloque.
 */
export const WIZARD_BLOCK_NAMES: Record<number, string> = {
  1: "Identificación de la Empresa",
  2: "Diagnóstico Inicial de Riesgo",
  3: "Tratamientos de Datos",
  4: "Medidas de Seguridad",
  5: "Validación y Confirmación",
};

export function getWizardBlockName(blockNum: number): string {
  return WIZARD_BLOCK_NAMES[blockNum] ?? `Bloque ${blockNum}`;
}
