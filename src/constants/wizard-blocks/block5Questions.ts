import { WizardAnswers, WizardTreatment } from "@/types/wizardRisk.types";
import { getConditionalFieldValue, hasYesSelection } from "@/utils/wizardQuestionHelpers";

export interface TreatmentTemplate {
  id: string;
  name: string;
  legalBasis: string;
  securityMeasures: string;
  retentionPeriod: string;
  sourceKeys: string[];
  trigger: (answers: WizardAnswers) => boolean;
}

/**
 * Plantillas de tratamientos inferidos para el Bloque 5.
 * El usuario acepta o corrige cada fila (nombre, base legal, medidas, plazo).
 */
export const TREATMENT_TEMPLATES: TreatmentTemplate[] = [
  {
    id: "nomina",
    name: "Gestión de remuneraciones y nómina",
    legalBasis: "Obligación legal (Código del Trabajo y normativa previsional)",
    securityMeasures: "Acceso restringido a RR.HH. y finanzas; registro de accesos; copias de seguridad cifradas",
    retentionPeriod: "Duración del vínculo laboral y plazos legales de prescripción laboral y previsional",
    sourceKeys: ["B3-P16"],
    trigger: (a) => hasYesSelection(a["B3-P16"]),
  },
  {
    id: "reclutamiento",
    name: "Recepción y gestión de currículos",
    legalBasis: "Medidas precontractuales y/o consentimiento del postulante",
    securityMeasures: "Acceso restringido al equipo de selección; eliminación segura de postulaciones no seleccionadas",
    retentionPeriod: "Hasta 6 meses desde el cierre del proceso, salvo consentimiento para un plazo mayor",
    sourceKeys: ["B3-P17"],
    trigger: (a) => hasYesSelection(a["B3-P17"]),
  },
  {
    id: "asistencia",
    name: "Control de asistencia y jornada",
    legalBasis: "Obligación legal de control de jornada e interés legítimo de la organización",
    securityMeasures: "Acceso restringido; si hay biometría, cifrado y minimización de la plantilla biométrica",
    retentionPeriod: "Duración del vínculo laboral y plazos de fiscalización laboral",
    sourceKeys: ["B3-P18"],
    trigger: (a) => hasYesSelection(a["B3-P18"]),
  },
  {
    id: "salud_empleados",
    name: "Licencias médicas y beneficios de salud de empleados",
    legalBasis: "Obligación legal y, cuando corresponda, consentimiento para datos de salud",
    securityMeasures: "Cifrado; acceso restringido a personal autorizado; registro de quién consulta la ficha",
    retentionPeriod: "Plazos legales de licencias, cotizaciones y beneficios de salud",
    sourceKeys: ["B3-P19"],
    trigger: (a) => hasYesSelection(a["B3-P19"]),
  },
  {
    id: "base_clientes",
    name: "Base de datos de clientes",
    legalBasis: "Ejecución de contrato y/o interés legítimo de gestión comercial",
    securityMeasures: "Control de acceso por rol; copias de seguridad; registro de actividad sobre la base",
    retentionPeriod: "Duración de la relación comercial y plazos legales tributarios o de reclamación",
    sourceKeys: ["B3-P20"],
    trigger: (a) => hasYesSelection(a["B3-P20"]),
  },
  {
    id: "facturacion",
    name: "Emisión de facturas y boletas electrónicas",
    legalBasis: "Obligación legal tributaria (SII)",
    securityMeasures: "Acceso restringido a facturación; integridad de los documentos; copias de seguridad",
    retentionPeriod: "Plazos de conservación tributaria (en general, 6 años)",
    sourceKeys: ["B3-P21"],
    trigger: (a) => hasYesSelection(a["B3-P21"]),
  },
  {
    id: "cobranza",
    name: "Cobranza de deudas",
    legalBasis: "Ejecución de contrato e interés legítimo de cobro del crédito",
    securityMeasures: "Acceso restringido al equipo de cobranza; confidencialidad con encargados externos",
    retentionPeriod: "Hasta la extinción de la deuda y los plazos de prescripción aplicables",
    sourceKeys: ["B3-P22"],
    trigger: (a) => hasYesSelection(a["B3-P22"]),
  },
  {
    id: "newsletters",
    name: "Newsletters y comunicaciones comerciales",
    legalBasis: "Consentimiento y/o interés legítimo, con derecho de oposición (opt-out)",
    securityMeasures: "Registro de consentimiento u oposición; listas de no contacto; acceso restringido a la base",
    retentionPeriod: "Hasta la revocación del consentimiento o la oposición del titular",
    sourceKeys: ["B3-P23", "B2-P9"],
    trigger: (a) => hasYesSelection(a["B3-P23"]) || hasYesSelection(a["B2-P9"]),
  },
  {
    id: "encuestas",
    name: "Encuestas de satisfacción y estudios de mercado",
    legalBasis: "Consentimiento y/o interés legítimo de mejora del servicio",
    securityMeasures: "Minimización; anonimización o seudonimización cuando el identificador no sea necesario",
    retentionPeriod: "Duración del estudio y un plazo definido de análisis posterior",
    sourceKeys: ["B3-P24"],
    trigger: (a) => hasYesSelection(a["B3-P24"]),
  },
  {
    id: "control_acceso",
    name: "Control de acceso a instalaciones",
    legalBasis: "Interés legítimo de seguridad de las personas y las instalaciones",
    securityMeasures: "Acceso restringido a registros y credenciales; retención limitada de eventos de acceso",
    retentionPeriod: "30 a 90 días para registros de acceso, salvo incidente que justifique un plazo mayor",
    sourceKeys: ["B3-P25"],
    trigger: (a) => hasYesSelection(a["B3-P25"]),
  },
  {
    id: "logs",
    name: "Registros de actividad de usuarios (logs)",
    legalBasis: "Interés legítimo y obligación de adoptar medidas de seguridad",
    securityMeasures: "Acceso restringido a logs; integridad e inmutabilidad razonable; revisión periódica",
    retentionPeriod: "6 a 12 meses, salvo investigación de un incidente de seguridad",
    sourceKeys: ["B3-P26"],
    trigger: (a) => a["B3-P26"]?.[0] === "si",
  },
  {
    id: "contratos",
    name: "Gestión de contratos con personas naturales",
    legalBasis: "Ejecución de contrato y obligación legal de conservación documental",
    securityMeasures: "Acceso restringido al área legal/comercial; copias de seguridad; control de versiones",
    retentionPeriod: "Duración del contrato y plazos legales de prescripción civil o comercial",
    sourceKeys: ["B3-P27"],
    trigger: (a) => hasYesSelection(a["B3-P27"]),
  },
  {
    id: "pagos",
    name: "Procesamiento de pagos de clientes",
    legalBasis: "Ejecución de contrato",
    securityMeasures: "Cifrado en tránsito; no almacenar datos de tarjeta más allá de lo que exige el procesador; DPA con la pasarela",
    retentionPeriod: "Plazos tributarios y de disputa de pagos",
    sourceKeys: ["B3-P28"],
    trigger: (a) => hasYesSelection(a["B3-P28"]),
  },
  {
    id: "salud_titulares",
    name: "Tratamiento de datos de salud",
    legalBasis: "Consentimiento explícito y/o obligación legal específica",
    securityMeasures: "Cifrado; acceso restringido; registro de accesos; minimización de la ficha",
    retentionPeriod: "Según la ficha clínica o el plazo laboral/previsional que corresponda",
    sourceKeys: ["B2-P6"],
    trigger: (a) => hasYesSelection(a["B2-P6"]),
  },
  {
    id: "videovigilancia",
    name: "Videovigilancia",
    legalBasis: "Interés legítimo de seguridad, con aviso visible",
    securityMeasures: "Aviso en el lugar; acceso restringido a las grabaciones; no usar las imágenes para fines distintos",
    retentionPeriod: "30 a 90 días, salvo denuncia o investigación en curso",
    sourceKeys: ["B2-P7"],
    trigger: (a) => hasYesSelection(a["B2-P7"]),
  },
  {
    id: "biometria",
    name: "Identificación biométrica",
    legalBasis: "Consentimiento explícito, salvo norma especial que habilite otro fundamento",
    securityMeasures: "Cifrado de plantillas; minimización; prohibición de reutilizar la biometría para otros fines",
    retentionPeriod: "Duración del vínculo o del acceso autorizado, con eliminación de la plantilla al término",
    sourceKeys: ["B2-P8"],
    trigger: (a) => hasYesSelection(a["B2-P8"]),
  },
  {
    id: "menores",
    name: "Tratamiento de datos de menores de 18 años",
    legalBasis: "Consentimiento del representante legal, con el interés superior del niño",
    securityMeasures: "Acceso restringido; minimización; restricción de perfilamiento de menores",
    retentionPeriod: "Duración del servicio o del vínculo, y plazos legales aplicables",
    sourceKeys: ["B2-P10"],
    trigger: (a) => hasYesSelection(a["B2-P10"]),
  },
  {
    id: "transferencia_internacional",
    name: "Transferencia internacional de datos",
    legalBasis: "Ley 21.719 — transferencias con garantías adecuadas o consentimiento informado",
    securityMeasures: "Contratos de encargo o cláusulas de transferencia; inventario de destinos; evaluación del destinatario",
    retentionPeriod: "Mientras subsista el servicio en el extranjero y los plazos del tratamiento de origen",
    sourceKeys: ["B2-P11", "B2-P12"],
    trigger: (a) =>
      hasYesSelection(a["B2-P11"], ["no_chile", "no_seguro"]) || hasYesSelection(a["B2-P12"]),
  },
  {
    id: "decisiones_automatizadas",
    name: "Decisiones automatizadas o inteligencia artificial sobre personas",
    legalBasis: "Consentimiento y/o ejecución de contrato, con derecho a explicación e intervención humana",
    securityMeasures: "Registro de la lógica del modelo; canal de impugnación; revisión humana de decisiones de alto impacto",
    retentionPeriod: "Duración de la relación y el plazo necesario para auditar o impugnar la decisión",
    sourceKeys: ["B2-P13"],
    trigger: (a) => hasYesSelection(a["B2-P13"]),
  },
  {
    id: "encargados",
    name: "Encargo de tratamiento a terceros (call center, cobranza u otros)",
    legalBasis: "Ejecución de contrato, con contrato de encargo (DPA) con el proveedor",
    securityMeasures: "DPA firmado; instrucciones documentadas; evaluación periódica del encargado",
    retentionPeriod: "Duración del contrato de encargo y plazos de devolución o eliminación de los datos",
    sourceKeys: ["B2-P14"],
    trigger: (a) => hasYesSelection(a["B2-P14"]),
  },
  {
    id: "perfilamiento",
    name: "Perfilamiento de clientes para personalizar ofertas o experiencias",
    legalBasis: "Consentimiento y/o interés legítimo, con derecho de oposición",
    securityMeasures: "Seudonimización cuando sea posible; minimización; opt-out visible",
    retentionPeriod: "Hasta la oposición del titular o el fin de la relación comercial",
    sourceKeys: ["B2-P15"],
    trigger: (a) => hasYesSelection(a["B2-P15"]),
  },
];

export function buildInferredTreatments(answers: WizardAnswers): WizardTreatment[] {
  return TREATMENT_TEMPLATES.filter((template) => template.trigger(answers)).map((template) => {
    const extra =
      template.id === "base_clientes"
        ? getConditionalFieldValue(answers["B3-P20"], "si")
        : template.id === "newsletters"
          ? getConditionalFieldValue(answers["B3-P23"], "newsletters") ||
            getConditionalFieldValue(answers["B3-P23"], "ambas")
          : "";

    return {
      id: template.id,
      name: extra && template.id === "base_clientes" ? `${template.name} (~${extra})` : template.name,
      legalBasis: template.legalBasis,
      securityMeasures: template.securityMeasures,
      retentionPeriod:
        extra && template.id === "newsletters"
          ? `${template.retentionPeriod} Frecuencia declarada: ${extra}.`
          : template.retentionPeriod,
      accepted: false,
      modified: false,
      sourceKeys: template.sourceKeys,
    };
  });
}

/** Reservado: el Bloque 5 ya no usa tarjetas tipo QuestionCard. */
export const BLOCK5_TREATMENT_CARDS: [] = [];
