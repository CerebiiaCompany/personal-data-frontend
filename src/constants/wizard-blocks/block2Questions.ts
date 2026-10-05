import { WizardQuestionDefinition } from "@/types/wizardRisk.types";

/**
 * Bloque 2 — Diagnóstico Inicial de Riesgo (10 preguntas, selección múltiple).
 * Texto y opciones según spec. Las opciones "No..." son exclusivas.
 */
export const BLOCK2_QUESTIONS: WizardQuestionDefinition[] = [
  {
    questionKey: "B2-P6",
    questionText: "¿Su empresa trata datos de salud de clientes o empleados?",
    tooltipWhy:
      "Los datos de salud son una categoría sensible bajo la Ley 21.719 y requieren medidas de protección reforzadas.",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "salud_clientes", label: "Sí, datos de salud de clientes (fichas, condiciones físicas, historial clínico, alergias)" },
      { value: "salud_empleados", label: "Sí, datos de salud de empleados (licencias médicas, certificados, condiciones físicas)" },
      { value: "no", label: "No tratamos datos de salud.", exclusive: true },
    ],
    mark: "is_sensitive_data",
  },
  {
    questionKey: "B2-P7",
    questionText: "¿Su empresa tiene cámaras de videovigilancia?",
    tooltipWhy: "Las cámaras que captan personas identificables tratan datos personales y requieren aviso visible.",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "publico", label: "Sí, en áreas de atención al público" },
      { value: "empleados", label: "Sí, en áreas de empleados o bodegas" },
      { value: "ambas", label: "Sí, en ambas áreas" },
      { value: "no", label: "No tenemos cámaras.", exclusive: true },
    ],
    mark: "videovigilancia",
  },
  {
    questionKey: "B2-P8",
    questionText: "¿Su empresa usa datos biométricos para identificar personas?",
    tooltipWhy: "Los datos biométricos son una categoría sensible que en general requiere consentimiento explícito.",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "huella_empleados", label: "Sí, huella digital para control de asistencia de empleados" },
      { value: "acceso_clientes", label: "Sí, huella digital o reconocimiento facial para acceso de clientes" },
      { value: "otros_biometricos", label: "Sí, otros datos biométricos (iris, geometría de la mano)" },
      { value: "no", label: "No usamos datos biométricos.", exclusive: true },
    ],
    mark: "require_explicit_consent",
  },
  {
    questionKey: "B2-P9",
    questionText: "¿Su empresa hace marketing directo por correo, SMS o WhatsApp?",
    tooltipWhy: "El marketing directo tiene reglas propias de consentimiento y derecho a oposición (opt-out).",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "correos", label: "Sí, correos de marketing o newsletters" },
      { value: "sms", label: "Sí, SMS comerciales" },
      { value: "whatsapp", label: "Sí, mensajes por WhatsApp Business" },
      { value: "no", label: "No hacemos marketing directo.", exclusive: true },
    ],
    mark: "activate_marketing_questions",
  },
  {
    questionKey: "B2-P10",
    questionText: "¿Su empresa atiende o tiene datos de personas menores de 18 años?",
    tooltipWhy: "El tratamiento de datos de menores exige, en general, el consentimiento del representante legal.",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "clientes_principales", label: "Sí, menores como clientes principales (gimnasios, colegios, clínicas pediátricas)" },
      { value: "ocasional", label: "Sí, ocasionalmente menores junto con adultos" },
      { value: "empleados_menores", label: "Sí, empleados menores de edad" },
      { value: "no", label: "No tenemos datos de menores.", exclusive: true },
    ],
    mark: "require_guardian_consent",
  },
  {
    questionKey: "B2-P11",
    questionText: "¿Su empresa usa servicios digitales cuyo servidor está fuera de Chile?",
    tooltipWhy: "Almacenar datos en servidores fuera de Chile puede constituir una transferencia internacional.",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "cloud", label: "Sí, servicios en la nube (Google Workspace, Microsoft 365, AWS, Azure, etc.)" },
      { value: "saas", label: "Sí, CRM, ERP o software SaaS extranjero" },
      { value: "marketing_analytics", label: "Sí, plataformas de marketing o analytics extranjeras (Mailchimp, HubSpot, GA)" },
      { value: "no_chile", label: "No, todos nuestros sistemas están en Chile", exclusive: true },
      { value: "no_seguro", label: "No estoy seguro.", exclusive: true },
    ],
    mark: "international_transfer",
  },
  {
    questionKey: "B2-P12",
    questionText: "¿Su empresa envía activamente datos de clientes o empleados a empresas en el extranjero?",
    tooltipWhy: "Enviar datos a terceros en otros países puede requerir garantías adicionales de protección.",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí (países: _______________)" },
      { value: "no", label: "No compartimos datos fuera de Chile." },
    ],
    conditionalFieldsByOption: {
      si: { label: "Países", fieldType: "list", required: true, placeholder: "Países de destino" },
    },
    mark: "international_transfer",
  },
  {
    questionKey: "B2-P13",
    questionText: "¿Su empresa usa inteligencia artificial o sistemas automatizados para tomar decisiones sobre personas?",
    tooltipWhy: "Las decisiones automatizadas con efectos significativos dan derecho a explicación e impugnación.",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "scoring", label: "Sí, scoring crediticio o evaluación de riesgo automática" },
      { value: "curriculos", label: "Sí, selección de currículos sin revisión humana inicial" },
      { value: "precios", label: "Sí, segmentación automática para precios o condiciones diferenciadas" },
      { value: "recomendaciones", label: "Sí, recomendaciones automáticas que determinan lo que ve cada persona" },
      { value: "no", label: "No usamos sistemas automatizados.", exclusive: true },
      // Item N-14 (mecanismo de "Incertidumbre") — mismo patrón que B2-P11:
      // si el usuario no sabe, el tratamiento "Decisiones Automatizadas" se
      // genera igual, marcado para revisión manual (ver wizard-inference/
      // engine/pendingReview.ts).
      { value: "no_seguro", label: "No estoy seguro.", exclusive: true },
    ],
    mark: "automated_decisions",
  },
  {
    questionKey: "B2-P14",
    questionText: "¿Su empresa terceriza atención al cliente, call center o cobranza?",
    tooltipWhy: "Un proveedor externo que trata datos por tu cuenta suele requerir un contrato de encargo (DPA).",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "call_center", label: "Sí, call center externo (empresa: _______________)" },
      { value: "cobranza", label: "Sí, cobranza tercerizada (empresa: _______________)" },
      { value: "otros", label: "Sí, otros servicios con acceso a datos (especifique: _______________)" },
      { value: "no", label: "No, todo lo hacemos internamente.", exclusive: true },
    ],
    conditionalFieldsByOption: {
      call_center: { label: "Empresa", fieldType: "text", required: true, placeholder: "Nombre de la empresa" },
      cobranza: { label: "Empresa", fieldType: "text", required: true, placeholder: "Nombre de la empresa" },
      otros: { label: "Especifique", fieldType: "text", required: true, placeholder: "Servicio y proveedor" },
    },
    mark: "requires_dpa",
  },
  {
    questionKey: "B2-P15",
    questionText: "¿Su empresa hace perfilamiento de clientes para personalizar ofertas o experiencias?",
    tooltipWhy: "El perfilamiento puede requerir medidas adicionales como la seudonimización de los datos.",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "historial_compras", label: "Sí, usamos historial de compras para personalizar ofertas" },
      { value: "comportamiento", label: "Sí, usamos comportamiento web o de app para personalizar" },
      { value: "demograficos", label: "Sí, usamos datos demográficos para segmentar campañas" },
      { value: "no", label: "No hacemos perfilamiento.", exclusive: true },
    ],
    mark: "requires_pseudonymization",
  },
];
