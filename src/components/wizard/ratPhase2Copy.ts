import { LegalBasis } from "@/types/treatment.types";

/** Textos en lenguaje claro para la Fase 2 del asistente (RAT guiado). */
export const RAT_PHASE2_INTRO =
  "Te haremos unas preguntas sencillas. Con tus respuestas armamos el registro de tratamiento que exige la ley — sin que tengas que conocer la terminología técnica.";

export const LEGAL_BASIS_HINTS: Partial<Record<LegalBasis, string>> = {
  CONSENT:
    "La persona acepta de forma libre e informada que trates sus datos (formulario, casilla, firma, etc.).",
  CONTRACT_PERFORMANCE:
    "Necesitas los datos para cumplir un contrato o medidas precontractuales con la persona.",
  LEGAL_OBLIGATION:
    "Una ley o norma te obliga a tratar esos datos (debes poder indicar cuál).",
  LEGITIMATE_INTEREST:
    "Tienes un interés legítimo y no hay otra forma menos invasiva de lograrlo.",
  ECONOMIC_FINANCIAL_DATA:
    "Tratas datos económicos, financieros o comerciales con la debida protección.",
  RIGHTS_DEFENSE:
    "Necesitas los datos para ejercer o defender derechos en un procedimiento.",
};

export const RAT_STEP_COPY = {
  rat_identity: {
    title: "¿Qué actividad con datos personales quieres registrar?",
    nameHint:
      "Usa un nombre que tu equipo entienda, por ejemplo «Clientes del sitio web» o «Postulantes de empleo».",
    purposeHint:
      "Selecciona la finalidad principal. Si no encuentras la exacta, elige la más cercana y amplía en la descripción.",
  },
  rat_legal: {
    legalBasisQuestion: "¿Por qué tu empresa puede tratar estos datos?",
    legalBasisHint:
      "La ley exige justificar cada tratamiento. Elige la razón que mejor describe tu caso real.",
    dataCategoriesQuestion: "¿Qué tipos de datos personales vas a tratar?",
    dataCategoriesHint:
      "Marca todo lo que aplique. Si incluyes datos sensibles (salud, biométricos, etc.), el DPO revisará medidas adicionales.",
    subjectCategoriesQuestion: "¿De quién son esos datos?",
    subjectCategoriesHint:
      "Indica a qué grupo de personas pertenecen: clientes, trabajadores, proveedores, etc.",
    consentPolicyQuestion: "¿Ya tienes una política de tratamiento para informar a las personas?",
    consentPolicyHintWithTemplates:
      "Si ya subiste una política, puedes vincularla ahora. Si no, puedes continuar: el tratamiento quedará en borrador hasta que la cargues.",
    consentPolicyHintNoTemplates:
      "Aún no tienes políticas cargadas — es normal en empresas nuevas. Puedes continuar ahora; te guiaremos para subir o generar la política antes de activar el tratamiento.",
    justificationQuestion: "¿Qué norma o situación te obliga o autoriza este tratamiento?",
    justificationHint:
      "Describe brevemente la ley, contrato o circunstancia concreta (ej. «Ley 21.595 — registro de asistencia laboral»).",
    dataSourceQuestion: "¿De dónde obtienes los datos? (opcional)",
    consequencesQuestion:
      "¿Qué pasa si la persona no entrega los datos? (opcional)",
  },
  rat_security: {
    ownerQuestion: "¿Quién en tu empresa es responsable de este tratamiento?",
    ownerHint:
      "Por defecto proponemos al DPO que designaste en la fase 1. Puedes cambiarlo si el responsable operativo del día a día es otra persona.",
    retentionQuestion: "¿Cuánto tiempo conservarás los datos?",
    retentionHint:
      "Indica un plazo razonable según la finalidad. Ejemplo: 5 años desde que termina la relación con el cliente.",
    securityQuestion: "¿Qué medidas de seguridad aplicarás?",
    securityHint:
      "Marca las que ya uses o planeas usar. No hace falta tenerlas todas — el DPO puede sugerir mejoras al activar.",
  },
  rat_systems: {
    question: "¿En qué sistemas o herramientas guardas o procesas estos datos?",
    hint: "Opcional pero recomendado: CRM, hoja de cálculo, software de nómina, plataforma en la nube, etc.",
  },
} as const;
