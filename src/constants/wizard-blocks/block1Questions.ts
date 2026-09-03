import { WizardQuestionDefinition } from "@/types/wizardRisk.types";

/**
 * Bloque 1 — Perfil de la Organización (preguntas globales 1-5 de 30).
 *
 * B1-P3/P4/P5 son "Sí/No" simples por ahora — los campos condicionales
 * (URL del sitio, nombre de la app, selector de países) llegan en un
 * batch posterior; aquí solo se guarda la respuesta.
 */
export const BLOCK1_QUESTIONS: WizardQuestionDefinition[] = [
  {
    questionKey: "B1-P1",
    questionText: "¿Cuál es tu sector de industria?",
    helpText: "Esto nos ayuda a personalizar las medidas de seguridad.",
    tooltipWhy: "Diferentes sectores tienen requisitos de protección distintos.",
    type: "SINGLE_CHOICE",
    options: [
      { value: "technology", label: "Tecnología / Software" },
      { value: "finance", label: "Finanzas / Banca" },
      { value: "healthcare", label: "Salud / Farmacéutico" },
      { value: "education", label: "Educación" },
      { value: "retail", label: "Retail / E-commerce" },
      { value: "manufacturing", label: "Manufactura / Industria" },
      { value: "government", label: "Sector Público / Gobierno" },
      { value: "legal", label: "Legal / Asesoría" },
      { value: "media", label: "Medios / Comunicación" },
      { value: "energy", label: "Energía / Utilities" },
      { value: "transport", label: "Transporte / Logística" },
      { value: "other", label: "Otro (especificar)" },
    ],
  },
  {
    // CRÍTICO: esta respuesta habilita/deshabilita las preguntas de RRHH
    // del Bloque 3 (Batch 6) — "1-5" las oculta, el resto las muestra.
    // Esa lógica condicional todavía no existe; por ahora solo se guarda.
    questionKey: "B1-P2",
    questionText: "¿Cuántos empleados tiene tu empresa?",
    helpText: "Esta información nos ayuda a dimensionar las medidas de seguridad.",
    tooltipWhy: "El tamaño de la empresa afecta cuáles tratamientos de datos son relevantes.",
    type: "SINGLE_CHOICE",
    options: [
      { value: "1-5", label: "1 a 5 empleados" },
      { value: "6-50", label: "6 a 50 empleados" },
      { value: "51-200", label: "51 a 200 empleados" },
      { value: "200+", label: "Más de 200 empleados" },
    ],
  },
  {
    questionKey: "B1-P3",
    questionText: "¿Tienes un sitio web?",
    helpText: "Un sitio web donde recolectas datos de usuarios o clientes.",
    tooltipWhy: "Los sitios web pueden recopilar datos personales (emails, contraseñas, etc.).",
    type: "SINGLE_CHOICE",
    options: [
      { value: "yes", label: "Sí, tenemos un sitio web" },
      { value: "no", label: "No, no tenemos sitio web" },
    ],
  },
  {
    questionKey: "B1-P4",
    questionText: "¿Tienes una aplicación móvil?",
    helpText: "Una app en iOS, Android o ambas.",
    tooltipWhy: "Las aplicaciones móviles pueden recopilar datos de ubicación, contactos, etc.",
    type: "SINGLE_CHOICE",
    options: [
      { value: "yes", label: "Sí, tenemos app móvil" },
      { value: "no", label: "No, no tenemos app móvil" },
    ],
  },
  {
    questionKey: "B1-P5",
    questionText: "¿Tu empresa opera en múltiples países?",
    helpText: "Esto puede afectar las leyes de protección de datos aplicables.",
    tooltipWhy:
      "Diferentes países tienen regulaciones diferentes (GDPR en EU, CCPA en California, etc.).",
    type: "SINGLE_CHOICE",
    options: [
      { value: "yes", label: "Sí, operamos en múltiples países" },
      { value: "no", label: "No, solo en Chile" },
      { value: "unsure", label: "No estoy seguro" },
    ],
  },
];
