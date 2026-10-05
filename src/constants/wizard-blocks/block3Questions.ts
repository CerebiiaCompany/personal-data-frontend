import { WizardQuestionDefinition } from "@/types/wizardRisk.types";
import { hasEmployees, hasYesSelection } from "@/utils/wizardQuestionHelpers";

/**
 * Bloque 3 — Inventario de Tratamientos / RAT Wizard (13 preguntas).
 * Condicionales del spec:
 * - B3-P16, P17, P18, P19: solo si B1-P2 es mayor que 0 empleados.
 * - B3-P23: solo si B2-P9 incluyó alguna opción "Sí".
 */
export const BLOCK3_QUESTIONS: WizardQuestionDefinition[] = [
  {
    questionKey: "B3-P16",
    questionText: "¿Su empresa paga sueldos o remuneraciones a empleados?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No (sin empleados remunerados)" },
    ],
    showIf: hasEmployees,
    mark: "gestion_nomina",
  },
  {
    questionKey: "B3-P17",
    questionText: "¿Su empresa recibe o gestiona currículos de trabajo?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "activamente", label: "Sí, activamente — proceso formal" },
      { value: "ocasionalmente", label: "Sí, ocasionalmente" },
      { value: "no", label: "No gestionamos postulaciones." },
    ],
    showIf: hasEmployees,
    mark: "reclutamiento",
  },
  {
    questionKey: "B3-P18",
    questionText: "¿Su empresa registra la asistencia o el horario de empleados?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "huella_digital", label: "Sí, con huella digital" },
      { value: "reloj_tarjeta", label: "Sí, con reloj control o tarjeta" },
      { value: "app_manual", label: "Sí, con app móvil o registro manual" },
      { value: "no", label: "No registramos asistencia formalmente.", exclusive: true },
    ],
    showIf: hasEmployees,
    mark: "control_asistencia",
  },
  {
    questionKey: "B3-P19",
    questionText: "¿Su empresa gestiona licencias médicas o beneficios de salud de empleados?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "licencias", label: "Sí, licencias médicas" },
      { value: "beneficios", label: "Sí, beneficios de salud (Isapre, Fonasa, seguros)" },
      { value: "ambas", label: "Sí, ambos" },
      { value: "no", label: "No." },
    ],
    showIf: hasEmployees,
    mark: "gestion_salud_empleados",
  },
  {
    questionKey: "B3-P20",
    questionText: "¿Su empresa tiene una base de datos de clientes?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí (cantidad aproximada: _______________)" },
      { value: "no", label: "No — sin base de datos formal de clientes." },
    ],
    conditionalFieldsByOption: {
      si: { label: "Cantidad aproximada", fieldType: "number", required: true, placeholder: "Ej. 250" },
    },
    mark: "base_clientes",
  },
  {
    questionKey: "B3-P21",
    questionText: "¿Su empresa emite facturas o boletas electrónicas?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No emitimos documentos tributarios directamente." },
    ],
    mark: "facturacion",
  },
  {
    questionKey: "B3-P22",
    questionText: "¿Su empresa realiza cobranza — contacta a personas con deudas?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "internamente", label: "Sí, internamente" },
      { value: "tercerizada", label: "Sí, tercerizada" },
      { value: "no", label: "No tenemos cobranza." },
    ],
    mark: "cobranza",
  },
  {
    questionKey: "B3-P23",
    questionText: "¿Su empresa envía newsletters o comunicaciones comerciales?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "newsletters", label: "Sí, newsletters periódicos (frecuencia: _______________)" },
      { value: "promociones", label: "Sí, promociones o campañas especiales" },
      { value: "ambas", label: "Sí, ambos." },
    ],
    conditionalFieldsByOption: {
      newsletters: {
        label: "Frecuencia",
        fieldType: "text",
        required: true,
        placeholder: "Ej. semanal, mensual",
      },
      ambas: {
        label: "Frecuencia",
        fieldType: "text",
        required: true,
        placeholder: "Ej. semanal, mensual",
      },
    },
    showIf: (answers) => hasYesSelection(answers["B2-P9"]),
    mark: "marketing_directo",
  },
  {
    questionKey: "B3-P24",
    questionText: "¿Su empresa realiza encuestas de satisfacción o estudios de mercado?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "post_servicio", label: "Sí, encuestas post-servicio" },
      { value: "estudios", label: "Sí, estudios de mercado o focus groups" },
      { value: "no", label: "No realizamos encuestas.", exclusive: true },
    ],
    mark: "investigacion_mercado",
  },
  {
    questionKey: "B3-P25",
    questionText: "¿Su empresa tiene sistemas de control de acceso a instalaciones?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "camaras", label: "Sí, cámaras" },
      { value: "credenciales_empleados", label: "Sí, tarjetas o credenciales para empleados" },
      { value: "credenciales_visitantes", label: "Sí, tarjetas o credenciales para clientes o visitantes" },
      { value: "no", label: "No tenemos control de acceso.", exclusive: true },
    ],
    mark: "control_acceso",
  },
  {
    questionKey: "B3-P26",
    questionText: "¿Sus sistemas informáticos generan registros de actividad de usuarios?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí, registran qué usuarios accedieron a qué datos y cuándo" },
      { value: "no", label: "No tenemos logs de actividad" },
      { value: "no_se", label: "No sé si tenemos logs." },
    ],
    mark: "logs_seguridad",
  },
  {
    questionKey: "B3-P27",
    questionText: "¿Su empresa gestiona contratos que incluyen datos de personas naturales?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "servicio", label: "Sí, contratos de servicio con personas naturales como clientes" },
      { value: "compraventa", label: "Sí, promesas de compraventa u otros acuerdos con personas naturales" },
      { value: "no", label: "No — solo contratos con empresas.", exclusive: true },
    ],
    mark: "gestion_contratos",
  },
  {
    questionKey: "B3-P28",
    questionText: "¿Su empresa procesa pagos de clientes a través de plataforma externa?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "transbank", label: "Sí, Transbank / WebPay / POS físico" },
      { value: "pasarela", label: "Sí, pasarela de pago en línea (especifique: _______________)" },
      { value: "billeteras", label: "Sí, billeteras digitales o fintech" },
      { value: "no", label: "No, solo efectivo o transferencias directas.", exclusive: true },
    ],
    conditionalFieldsByOption: {
      pasarela: { label: "Especifique", fieldType: "text", required: true, placeholder: "Ej. Stripe, Flow, PayPal" },
    },
    mark: "procesamiento_pagos",
  },
  // Item N-10 — B3-P29 y B3-P34 se omiten a propósito: B3-P34
  // (Accidentes y Enfermedades Laborales) ya está automatizada desde B1-P2
  // (ver treatmentRules.ts, item N-12), sin pregunta propia; B3-P29 no
  // corresponde a este batch. Cada pregunta de abajo agrega un disparador
  // explícito (yes/no) a un tratamiento que hasta ahora solo se inferían
  // por industria o cantidad de empleados (ver treatmentRules.ts) — ambos
  // caminos conviven (any/or), no se reemplazan.
  {
    questionKey: "B3-P30",
    questionText: "¿Su empresa tiene un programa de fidelización o puntos para clientes?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
    ],
    mark: "fidelizacion",
  },
  {
    questionKey: "B3-P31",
    questionText: "¿Su empresa gestiona garantías o reclamos posventa de productos o servicios?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
    ],
    mark: "garantias_reclamos",
  },
  {
    questionKey: "B3-P32",
    questionText: "¿Su empresa realiza evaluaciones de desempeño a sus empleados?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
    ],
    mark: "evaluaciones_desempeno",
  },
  {
    questionKey: "B3-P33",
    questionText: "¿Su empresa capacita o certifica formalmente a su personal?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
    ],
    mark: "capacitacion_certificacion",
  },
  {
    questionKey: "B3-P35",
    questionText: "¿Su empresa realiza encuestas de clima organizacional?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
    ],
    mark: "clima_organizacional",
  },
  {
    // "No estoy seguro" (no genérico en el spec, agregado siguiendo el
    // mismo criterio ya usado en B2-P11/B2-P13, item N-14): si la empresa
    // no sabe si es sujeto obligado UAF, el tratamiento KYC se genera
    // igual, marcado para revisión manual (ver pendingReview.ts).
    questionKey: "B3-P36",
    questionText:
      "¿Su empresa es un sujeto obligado a reportar ante la UAF — la Unidad de Análisis Financiero, el organismo que previene el lavado de activos — por ejemplo notarías, casinos, corredoras u otras actividades financieras reguladas?",
    tooltipWhy: "Los sujetos obligados UAF (Ley 19.913) deben identificar y verificar la identidad de sus clientes.",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
      { value: "no_seguro", label: "No estoy seguro." },
    ],
    mark: "kyc_uaf",
  },
  {
    questionKey: "B3-P37",
    questionText: "¿Su empresa tiene un área o canal formal de soporte o atención al cliente?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
    ],
    mark: "soporte_atencion",
  },
  {
    questionKey: "B3-P38",
    questionText:
      "¿Su empresa opera una plataforma o software propio que sus clientes usan directamente, más allá de una app móvil?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
    ],
    mark: "uso_plataforma",
  },
  {
    questionKey: "B3-P39",
    questionText: "¿Su empresa participa en licitaciones públicas o privadas?",
    type: "SINGLE_CHOICE",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
    ],
    mark: "licitaciones",
  },
];
