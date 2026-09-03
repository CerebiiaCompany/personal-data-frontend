import { WizardQuestionDefinition } from "@/types/wizardRisk.types";

/**
 * Bloque 4 — Inventario de Sistemas, preguntas previas (globales 31-35 de
 * 47). Tras B4-P35 sigue la tabla de sistemas editable (SystemsTable), que
 * no es una pregunta de este catálogo — ver WizardBlock4.tsx.
 */
export const BLOCK4_QUESTIONS: WizardQuestionDefinition[] = [
  {
    questionKey: "B4-P31",
    questionText: "¿Cuántos sistemas/aplicaciones usan datos?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "1-5", label: "1-5 sistemas" },
      { value: "6-20", label: "6-20 sistemas" },
      { value: "20+", label: "Más de 20 sistemas" },
    ],
  },
  {
    questionKey: "B4-P32",
    questionText: "¿Sistemas están documentados?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "yes", label: "Sí, tenemos listado" },
      { value: "partial", label: "Parcialmente" },
      { value: "no", label: "No" },
    ],
  },
  {
    questionKey: "B4-P33",
    questionText: "¿Requieres ayuda para documentarlos?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "yes", label: "Sí" },
      { value: "no", label: "No" },
    ],
  },
  {
    questionKey: "B4-P34",
    questionText: "¿Cuál es el tamaño de la BD principal?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "small", label: "< 100 MB" },
      { value: "medium", label: "100 MB - 1 GB" },
      { value: "large", label: "1 GB - 100 GB" },
      { value: "huge", label: "> 100 GB" },
    ],
  },
  {
    questionKey: "B4-P35",
    questionText: "¿Despliegue es cloud o on-premise?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "cloud", label: "Cloud (SaaS)" },
      { value: "hybrid", label: "Híbrido" },
      { value: "onprem", label: "On-premise" },
    ],
  },
];
