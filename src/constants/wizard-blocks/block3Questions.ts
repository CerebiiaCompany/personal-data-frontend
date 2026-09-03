import { WizardQuestionDefinition } from "@/types/wizardRisk.types";

/**
 * Bloque 3 — Inventario de Tratamientos (preguntas globales 16-30 de 30).
 *
 * Con condicionales: algunas preguntas se ocultan u ofrecen según
 * respuestas ya dadas en Bloque 1-2 (`showIf`/`hideIf`, evaluadas por
 * hooks/useWizardBlockQuestions contra el `state.answers` ya cargado en
 * contexto). El ORDEN de este arreglo es el orden real en que se navega
 * — B3-P26..P30 quedan últimas siempre, así que la "última pregunta del
 * bloque" es predecible sin importar qué condicionales se activen.
 *
 * B3-P16/P24/P25/P26/P29 son checkboxes booleanos opcionales de una sola
 * opción (ver isOptionalSingleCheckbox) — el resto tiene varias opciones
 * reales y sí exige selección.
 */
export const BLOCK3_QUESTIONS: WizardQuestionDefinition[] = [
  {
    questionKey: "B3-P16",
    questionText: "¿Tratas datos de empleados (nómina, currículos)?",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí" }],
    hideIf: (answers) => answers["B1-P2"]?.[0] === "1-5",
    mark: "has_hr_data",
  },
  {
    questionKey: "B3-P17",
    questionText: "¿Tratas datos de clientes (contactos, emails)?",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí" }],
    mark: "has_customer_data",
  },
  {
    questionKey: "B3-P18",
    questionText: "¿Almacenas datos financieros?",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí, datos bancarios/tarjetas" }],
    mark: "has_financial_data",
  },
  {
    questionKey: "B3-P19",
    questionText: "¿Tratas datos de proveedores?",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí" }],
    mark: "has_vendor_data",
  },
  {
    questionKey: "B3-P20",
    questionText: "¿Almacenas comunicaciones (emails, chats)?",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí" }],
    mark: "has_communication_data",
  },
  {
    questionKey: "B3-P21",
    questionText: "¿Tienes datos de usuarios/visitantes web?",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí" }],
    mark: "has_user_data",
  },
  {
    questionKey: "B3-P22",
    questionText: "¿Para marketing usas segmentación de datos?",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí" }],
    showIf: (answers) => answers["B2-P9"]?.includes("yes") ?? false,
    mark: "marketing_segmentation",
  },
  {
    questionKey: "B3-P23",
    questionText: "¿Los datos de salud incluyen diagnósticos sensibles?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "mental", label: "Información psiquiátrica/salud mental" },
      { value: "hiv", label: "VIH u otras infecciones" },
      { value: "genetic", label: "Información genética" },
    ],
    showIf: (answers) => answers["B2-P6"]?.includes("yes") ?? false,
    mark: "sensitive_health_category",
  },
  {
    questionKey: "B3-P24",
    questionText: "¿Tipos de datos de RRHH?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "payroll", label: "Nómina y salarios" },
      { value: "performance", label: "Evaluaciones de desempeño" },
      { value: "medical", label: "Datos médicos de empleados" },
      { value: "background", label: "Antecedentes/historial" },
    ],
    hideIf: (answers) => answers["B1-P2"]?.[0] === "1-5",
  },
  {
    questionKey: "B3-P25",
    questionText: "¿Sistema de gestión de RRHH externo?",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí, usamos software RRHH (SAP, Workday, etc.)" }],
    hideIf: (answers) => answers["B1-P2"]?.[0] === "1-5",
  },
  {
    questionKey: "B3-P26",
    questionText: "¿Guarda logs/auditoría de acceso?",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí" }],
    mark: "has_audit_logs",
  },
  {
    questionKey: "B3-P27",
    questionText: "¿Tiene política de retención de datos?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "yes", label: "Sí, tenemos política" },
      { value: "no", label: "No, los guardamos indefinidamente" },
      { value: "unsure", label: "No estamos seguros" },
    ],
    mark: "has_retention_policy",
  },
  {
    questionKey: "B3-P28",
    questionText: "¿Realiza copias de seguridad?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "daily", label: "Sí, diarias" },
      { value: "weekly", label: "Sí, semanales" },
      { value: "monthly", label: "Sí, mensuales" },
      { value: "no", label: "No, no tenemos backups" },
    ],
    mark: "backup_frequency",
  },
  {
    questionKey: "B3-P29",
    questionText: "¿Cifra datos en reposo?",
    type: "MULTIPLE_CHOICE",
    options: [{ value: "yes", label: "Sí, los datos están cifrados" }],
    mark: "encrypts_at_rest",
  },
  {
    questionKey: "B3-P30",
    questionText: "¿Cifra datos en tránsito?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "yes", label: "Sí, HTTPS/SSL" },
      { value: "partial", label: "Parcialmente" },
      { value: "no", label: "No" },
    ],
    mark: "encrypts_in_transit",
  },
];
