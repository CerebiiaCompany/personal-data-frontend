import { WizardQuestionDefinition } from "@/types/wizardRisk.types";

/**
 * Bloque 2 — Diagnóstico Inicial de Riesgo (preguntas globales 6-15 de 30).
 *
 * Todas son, en la práctica, un checkbox booleano opcional: una sola
 * opción "Sí, ..." (ver utils/wizardQuestionHelpers.ts,
 * isOptionalSingleCheckbox) — no marcarla es una respuesta válida ("No"),
 * WizardBlock2 le pasa `canGoNext={true}` a QuestionCard para que no
 * exija selección.
 *
 * `tooltipWhy` es copy provisorio (pendiente de validación de
 * producto/legal, igual que el resto de textos nuevos de este flujo) —
 * `mark` es metadata para lógica de bloques futuros, no se envía al
 * backend todavía.
 */
export const BLOCK2_QUESTIONS: WizardQuestionDefinition[] = [
  {
    questionKey: "B2-P6",
    questionText: "¿Tratas datos de salud o diagnósticos?",
    helpText: "Incluye información médica, historial.",
    tooltipWhy:
      "Los datos de salud son una categoría sensible bajo la Ley 21.719 y requieren medidas de protección reforzadas.",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí, tratamos datos de salud" }],
    mark: "is_sensitive_data",
  },
  {
    questionKey: "B2-P7",
    questionText: "¿Utilizas videovigilancia?",
    helpText: "Cámaras de seguridad en oficina, almacén, sucursales.",
    tooltipWhy: "Las cámaras que captan personas identificables tratan datos personales y requieren aviso visible.",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí, usamos videovigilancia" }],
  },
  {
    questionKey: "B2-P8",
    questionText: "¿Tratas datos biométricos?",
    helpText: "Huellas, reconocimiento facial, iris.",
    tooltipWhy: "Los datos biométricos son una categoría sensible que en general requiere consentimiento explícito.",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí, tratamos biometría" }],
    mark: "require_explicit_consent",
  },
  {
    questionKey: "B2-P9",
    questionText: "¿Realizas marketing directo?",
    helpText: "Email, SMS, marketing directo.",
    tooltipWhy: "El marketing directo tiene reglas propias de consentimiento y derecho a oposición (opt-out).",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí, hacemos marketing directo" }],
    mark: "activate_marketing_questions",
  },
  {
    questionKey: "B2-P10",
    questionText: "¿Tratas datos de menores?",
    helpText: "Datos de personas menores de 18 años.",
    tooltipWhy: "El tratamiento de datos de menores exige, en general, el consentimiento de madre, padre o tutor.",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí, tratamos menores" }],
    mark: "require_guardian_consent",
  },
  {
    questionKey: "B2-P11",
    questionText: "¿Usas cloud en el extranjero?",
    helpText: "AWS USA, Google Cloud Europa, Azure, etc.",
    tooltipWhy: "Almacenar datos en servidores fuera de Chile puede constituir una transferencia internacional.",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí, cloud extranjero" }],
    mark: "international_transfer",
  },
  {
    questionKey: "B2-P12",
    questionText: "¿Transferencias internacionales de datos?",
    helpText: "Envíos a terceros en otros países.",
    tooltipWhy: "Enviar datos a terceros en otros países puede requerir garantías adicionales de protección.",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí, transferencias" }],
    mark: "international_transfer",
  },
  {
    questionKey: "B2-P13",
    questionText: "¿Usas IA para decisiones?",
    helpText: "Scoring, automatización, algoritmos.",
    tooltipWhy: "Las decisiones automatizadas con efectos significativos dan derecho a explicación e impugnación.",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí, IA para decisiones" }],
    mark: "automated_decisions",
  },
  {
    questionKey: "B2-P14",
    questionText: "¿Tercerizan el tratamiento?",
    helpText: "Proveedores externos para datos.",
    tooltipWhy: "Un proveedor externo que trata datos por tu cuenta suele requerir un contrato de encargo (DPA).",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí, tercerizan" }],
    mark: "requires_dpa",
  },
  {
    questionKey: "B2-P15",
    questionText: "¿Perfilamiento de personas?",
    helpText: "Análisis de comportamiento, segmentación.",
    tooltipWhy: "El perfilamiento puede requerir medidas adicionales como la seudonimización de los datos.",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí, perfilamiento" }],
    mark: "requires_pseudonymization",
  },
];
