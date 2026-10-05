import { WizardQuestionDefinition } from "@/types/wizardRisk.types";

/**
 * Bloque 1 — Perfil de la Organización (5 preguntas).
 * Texto y opciones según spec de configuración inicial. No alterar copy.
 */
export const BLOCK1_QUESTIONS: WizardQuestionDefinition[] = [
  {
    questionKey: "B1-P1",
    questionText: "¿Cuál es el sector o industria principal de su empresa?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "salud", label: "Salud y clínicas" },
      { value: "educacion", label: "Educación y colegios" },
      { value: "gimnasios", label: "Gimnasios y bienestar" },
      { value: "retail", label: "Retail y comercio" },
      { value: "servicios_profesionales", label: "Servicios profesionales" },
      { value: "tecnologia", label: "Tecnología y software" },
      { value: "construccion", label: "Construcción e inmobiliaria" },
      { value: "rrhh", label: "Recursos humanos" },
      { value: "finanzas", label: "Finanzas y seguros" },
      { value: "logistica", label: "Logística y transporte" },
      { value: "alimentos", label: "Alimentos y restaurantes" },
      { value: "otra", label: "Otra industria — especifique." },
    ],
    conditionalFieldsByOption: {
      otra: { label: "Especifique", fieldType: "text", required: true, placeholder: "Industria" },
    },
  },
  {
    questionKey: "B1-P2",
    questionText: "¿Cuántos empleados o colaboradores trabajan en su empresa?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "1-5", label: "1 a 5 (microempresa)" },
      { value: "6-50", label: "6 a 50 (empresa pequeña)" },
      { value: "51-200", label: "51 a 200 (empresa mediana)" },
      { value: "200+", label: "Más de 200 (empresa grande)" },
    ],
  },
  {
    // Item C-03 — antes SINGLE_CHOICE (forzaba a elegir entre sitio propio Y
    // e-commerce, cuando una empresa puede tener ambos). MULTIPLE_CHOICE con
    // "no" exclusive: mismo patrón que B2-P14 (MULTIPLE_CHOICE + exclusive +
    // conditionalFieldsByOption conviven sin problema en ese mismo archivo).
    questionKey: "B1-P3",
    questionText: "¿Su empresa tiene sitio web o tienda en línea?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "propio", label: "Sí, sitio web propio (URL: _______________)" },
      { value: "ecommerce", label: "Sí, tienda en línea o e-commerce (URL: _______________)" },
      { value: "no", label: "No tenemos sitio web.", exclusive: true },
    ],
    conditionalFieldsByOption: {
      propio: { label: "URL", fieldType: "url", required: true, placeholder: "https://miempresa.cl" },
      ecommerce: { label: "URL", fieldType: "url", required: true, placeholder: "https://tienda.miempresa.cl" },
    },
  },
  {
    questionKey: "B1-P4",
    questionText: "¿Su empresa tiene aplicación móvil propia?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí (nombre: _______________)" },
      { value: "no", label: "No." },
    ],
    conditionalFieldsByOption: {
      si: { label: "Nombre", fieldType: "text", required: true, placeholder: "Nombre de la aplicación" },
    },
  },
  {
    questionKey: "B1-P5",
    questionText: "¿Su empresa opera solo en Chile o también en otros países?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "solo_chile", label: "Solo en Chile" },
      { value: "latam", label: "En Chile y otros países de Latinoamérica (cuáles: _______________)" },
      { value: "otros_continentes", label: "En Chile y otros continentes (cuáles: _______________)" },
    ],
    conditionalFieldsByOption: {
      latam: { label: "Cuáles", fieldType: "list", required: true, placeholder: "Países de Latinoamérica" },
      otros_continentes: { label: "Cuáles", fieldType: "list", required: true, placeholder: "Países o continentes" },
    },
  },
];
