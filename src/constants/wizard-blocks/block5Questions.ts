import { QuestionOption, TreatmentCardDefinition, WizardQuestionDefinition } from "@/types/wizardRisk.types";

/**
 * Bloque 5 Parte 1 — tarjetas de tratamiento (globales 37-46 de 47).
 *
 * El spec original (Batch 8) solo definió B5-P36..P40 completas y dejó
 * "P41-P45: más tarjetas (Menores, DPA con proveedores, Auditoría, etc.)"
 * como referencia de tema, sin contenido. B5-P41..P45 abajo son un
 * borrador propio usando los `mark` ya definidos en Bloque 2-3 como
 * disparador — pendiente de validación de producto/legal, igual que el
 * resto de copy nuevo de este flujo.
 *
 * B5-P36 (evaluación general) es la única siempre visible; el resto se
 * muestra solo si el riesgo correspondiente fue detectado en Bloque 2-3.
 */

const STANDARD_OPTIONS: QuestionOption[] = [
  { value: "yes", label: "Sí, lo haremos" },
  { value: "partial", label: "Parcialmente" },
  { value: "no", label: "No, por ahora no" },
];

const YES_NO_OPTIONS: QuestionOption[] = [
  { value: "yes", label: "Sí" },
  { value: "no", label: "No" },
];

export const BLOCK5_TREATMENT_CARDS: TreatmentCardDefinition[] = [
  {
    questionKey: "B5-P36",
    title: "Evaluación de Riesgos",
    description: "Basado en tus respuestas, hemos identificado riesgos en el tratamiento de datos de tu empresa.",
    riskLevel: "HIGH",
    recommendedTreatments: [
      "Política de protección de datos",
      "Consentimiento explícito",
      "Cláusulas DPA con proveedores",
    ],
    questionText: "¿Implementarás estas medidas?",
    options: STANDARD_OPTIONS,
  },
  {
    questionKey: "B5-P37",
    title: "Datos Sensibles Detectados",
    description: "Detectamos datos de salud y/o biometría en tus respuestas del Bloque 2.",
    riskLevel: "CRITICAL",
    recommendedTreatments: [
      "Consentimiento EXPRESO",
      "Cifrado de extremo a extremo",
      "Auditoría de acceso",
      "Derecho a olvido implementado",
    ],
    questionText: "¿Tienes medidas para datos sensibles?",
    options: STANDARD_OPTIONS,
    showIf: (a) => (a["B2-P6"]?.includes("yes") ?? false) || (a["B2-P8"]?.includes("yes") ?? false),
  },
  {
    questionKey: "B5-P38",
    title: "Transferencias Internacionales",
    description: "Detectamos transferencias a cloud extranjero o a terceros en otros países.",
    riskLevel: "HIGH",
    recommendedTreatments: [
      "Cláusula de transferencia internacional",
      "Estándar de Adecuación Ley 21.719 Art. 14",
      "Auditoría de cumplimiento en destino",
    ],
    questionText: "¿Tienes contratos firmados?",
    options: YES_NO_OPTIONS,
    showIf: (a) => (a["B2-P11"]?.includes("yes") ?? false) || (a["B2-P12"]?.includes("yes") ?? false),
  },
  {
    questionKey: "B5-P39",
    title: "Marketing y Consentimiento",
    riskLevel: "MEDIUM",
    recommendedTreatments: [
      "Registro de consentimiento (opt-in)",
      "Mecanismo de unsubscribe",
      "Política de No Contacto",
    ],
    questionText: "¿Tienes registro de consentimiento?",
    options: YES_NO_OPTIONS,
    showIf: (a) => a["B2-P9"]?.includes("yes") ?? false,
  },
  {
    questionKey: "B5-P40",
    title: "Decisiones Automatizadas",
    riskLevel: "CRITICAL",
    recommendedTreatments: [
      "Derecho a no ser sujeto de perfilamiento",
      "Derecho a explicación",
      "Intervención humana en decisiones",
    ],
    questionText: "¿Informas decisiones automatizadas a sujetos?",
    options: YES_NO_OPTIONS,
    showIf: (a) => a["B2-P13"]?.includes("yes") ?? false,
  },
  {
    questionKey: "B5-P41",
    title: "Datos de Menores",
    description: "Detectamos tratamiento de datos de personas menores de 18 años.",
    riskLevel: "CRITICAL",
    recommendedTreatments: [
      "Consentimiento de madre, padre o tutor",
      "Verificación de edad",
      "Restricción de perfilamiento a menores",
    ],
    questionText: "¿Tienes el consentimiento del tutor registrado?",
    options: YES_NO_OPTIONS,
    showIf: (a) => a["B2-P10"]?.includes("yes") ?? false,
  },
  {
    questionKey: "B5-P42",
    title: "Encargados de Tratamiento",
    description: "Detectamos que terceros tratan datos por cuenta de tu empresa.",
    riskLevel: "MEDIUM",
    recommendedTreatments: [
      "Contrato de encargo de tratamiento (DPA)",
      "Cláusulas de confidencialidad",
      "Evaluación periódica del proveedor",
    ],
    questionText: "¿Tienes DPA firmados con tus proveedores?",
    options: STANDARD_OPTIONS,
    showIf: (a) => a["B2-P14"]?.includes("yes") ?? false,
  },
  {
    questionKey: "B5-P43",
    title: "Auditoría y Trazabilidad",
    description: "No registraste logs de auditoría de acceso en el Bloque 3.",
    riskLevel: "MEDIUM",
    recommendedTreatments: [
      "Registro de accesos y modificaciones",
      "Retención de logs por un período definido",
      "Revisión periódica de accesos",
    ],
    questionText: "¿Implementarás un registro de auditoría?",
    options: STANDARD_OPTIONS,
    showIf: (a) => !(a["B3-P26"]?.includes("yes") ?? false),
  },
  {
    questionKey: "B5-P44",
    title: "Política de Retención de Datos",
    description: "No confirmaste tener una política de retención definida en el Bloque 3.",
    riskLevel: "MEDIUM",
    recommendedTreatments: [
      "Definir plazos de conservación por tipo de dato",
      "Procedimiento de eliminación segura",
    ],
    questionText: "¿Definirás una política de retención?",
    options: STANDARD_OPTIONS,
    showIf: (a) => (a["B3-P27"]?.[0] ?? "no") !== "yes",
  },
  {
    questionKey: "B5-P45",
    title: "Cifrado de la Información",
    description: "Detectamos datos sin cifrar en reposo y/o en tránsito.",
    riskLevel: "HIGH",
    recommendedTreatments: [
      "Cifrado de datos en reposo (at rest)",
      "HTTPS/TLS en todas las conexiones",
      "Gestión segura de llaves de cifrado",
    ],
    questionText: "¿Implementarás cifrado donde falte?",
    options: STANDARD_OPTIONS,
    showIf: (a) => !(a["B3-P29"]?.includes("yes") ?? false) || (a["B3-P30"]?.[0] ?? "no") !== "yes",
  },
];

/** Bloque 5 Parte 2 — selector de DPO (global 47 de 47, siempre visible). */
export const BLOCK5_DPO_QUESTION: WizardQuestionDefinition = {
  questionKey: "B5-P46",
  questionText: "¿Quién será el Responsable de Protección de Datos?",
  helpText: "Puedes cambiar esta designación más adelante desde la configuración de tu empresa.",
  type: "SINGLE_CHOICE",
  options: [
    { value: "internal-cto", label: "CTO/Responsable técnico interno" },
    { value: "internal-legal", label: "Responsable legal interno" },
    { value: "internal-compliance", label: "Responsable de cumplimiento interno" },
    { value: "internal-other", label: "Otro responsable interno" },
    { value: "external-consulting", label: "Consultoría externa" },
    { value: "no-assigned", label: "Aún no asignado" },
  ],
};
