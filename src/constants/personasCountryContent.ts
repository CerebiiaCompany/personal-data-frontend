import { ArcoRequestType } from "@/types/arco.types";
import { CustomSelectOption } from "@/types/forms.types";
import {
  PersonasCountryCode,
  PersonasDocTypeId,
} from "@/types/personas.types";
import { PlanFeature } from "@/utils/planFeatures.utils";

export interface PersonasCountryContent {
  code: PersonasCountryCode;
  label: string;
  flag: string;
  legalBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  rightsLabel: string;
  docTypeOptions: CustomSelectOption<PersonasDocTypeId>[];
  defaultDocType: PersonasDocTypeId;
  trustStats: { icon: string; label: string; value: string }[];
  faq: { question: string; answer: string }[];
  legalReferences: { icon: string; text: string }[];
  responseDaysLabel: string;
}

const SHARED_FEATURES = [
  {
    icon: "tabler:lock",
    title: "Validación segura",
    description: "Documento + código enviado a tu correo registrado.",
  },
  {
    icon: "tabler:file-certificate",
    title: "Derechos del titular",
    description: "Acceso, rectificación, supresión y oposición.",
  },
  {
    icon: "tabler:route",
    title: "Seguimiento",
    description: "Cada solicitud queda registrada con folio.",
  },
] as const;

export const personasHeroFeatures = SHARED_FEATURES;

export const personasHowItWorks = [
  {
    step: 1,
    icon: "tabler:id",
    title: "Identifícate",
    description:
      "Ingresa tu tipo y número de documento según el país seleccionado.",
  },
  {
    step: 2,
    icon: "tabler:mail-check",
    title: "Verifica tu correo",
    description: "Recibe un código en el email registrado por las empresas.",
  },
  {
    step: 3,
    icon: "tabler:building-community",
    title: "Consulta empresas",
    description: "Revisa qué organizaciones tratan tus datos personales.",
  },
  {
    step: 4,
    icon: "tabler:send",
    title: "Ejerce tus derechos",
    description: "Envía solicitudes con trazabilidad y folio de seguimiento.",
  },
] as const;

export const personasRights = [
  {
    key: "acceso",
    icon: "tabler:eye",
    title: "Acceso",
    description:
      "Conocer qué datos tiene la empresa y cómo los utiliza.",
  },
  {
    key: "rectificacion",
    icon: "tabler:edit",
    title: "Rectificación",
    description: "Corregir datos incompletos, inexactos o desactualizados.",
  },
  {
    key: "supresion",
    icon: "tabler:trash",
    title: "Supresión",
    description:
      "Solicitar supresión cuando no exista deber legal de conservación.",
  },
  {
    key: "oposicion",
    icon: "tabler:hand-stop",
    title: "Oposición",
    description: "Oponerte al tratamiento en los casos previstos por la ley.",
  },
] as const;

export const personasTips = [
  {
    icon: "tabler:mail-forward",
    title: "Revisa el canal elegido",
    text: "El código puede tardar unos minutos. Si elegiste correo, revisa spam. Si elegiste SMS, revisa tus mensajes de texto.",
  },
  {
    icon: "tabler:file-description",
    title: "Documento correcto",
    text: "Usa el mismo documento con el que te registraste en la empresa.",
  },
  {
    icon: "tabler:history",
    title: "Guarda tu folio",
    text: "Conserva el número de seguimiento de cada solicitud.",
  },
] as const;

export interface PersonasArcoAction {
  value: ArcoRequestType;
  label: string;
  icon: string;
  hint: string;
  /**
   * Si se define, la acción solo se muestra cuando la empresa activa pertenece
   * a ese país. PORTABILITY solo existe (regulación sembrada) para Chile.
   */
  onlyCountry?: PersonasCountryCode;
  /**
   * Item 6: si se define, la acción solo se muestra cuando el plan de la
   * empresa alcanza el tier mínimo de esta feature (hasFeature() en
   * @/utils/planFeatures.utils). Módulos de Fase 2 futuros solo agregan este
   * campo a su entrada — no requieren tocar el filtro que lo consume.
   */
  requiresFeature?: PlanFeature;
}

export const personasArcoActions: PersonasArcoAction[] = [
  {
    value: "ACCESS",
    label: "Acceso",
    icon: "tabler:eye",
    hint: "Conocer qué datos tiene la empresa",
  },
  {
    value: "RECTIFICATION",
    label: "Rectificación",
    icon: "tabler:edit",
    hint: "Corregir datos incorrectos",
  },
  {
    value: "CANCELLATION",
    label: "Supresión",
    icon: "tabler:trash",
    hint: "Solicitar eliminación de datos",
  },
  {
    value: "OPPOSITION",
    label: "Oposición",
    icon: "tabler:hand-stop",
    hint: "Oponerte al tratamiento",
  },
  {
    value: "PORTABILITY",
    label: "Portabilidad",
    icon: "tabler:package-export",
    hint: "Llevar una copia de tus datos a otro proveedor",
    onlyCountry: "CL",
    // Item 6: funcionalidad de Fase 2, solo disponible desde plan PROFESIONAL.
    requiresFeature: "PORTABILITY",
  },
  {
    value: "BLOCKING",
    label: "Bloqueo preventivo",
    icon: "tabler:lock",
    hint: "Pausar el uso de tus datos mientras se resuelve otra solicitud",
    // Art. 8 ter (Ley 21.719) — mismo criterio que PORTABILITY: solo existe
    // regulación sembrada (arcoBlockingRegulation.seed.ts) para Chile,
    // ningún documento de referencia describe un derecho equivalente en la
    // Ley 1581 colombiana.
    onlyCountry: "CL",
  },
];

export const personasFlowSteps = [
  { id: "documento", label: "Documento", path: "/personas/ingresar" },
  { id: "codigo", label: "Código", path: "/personas/verificar" },
  { id: "portal", label: "Tu panel", path: "/personas/portal" },
] as const;

export const PERSONAS_COUNTRIES: PersonasCountryCode[] = ["CO", "CL"];

export const PERSONAS_COUNTRY_CONTENT: Record<
  PersonasCountryCode,
  PersonasCountryContent
> = {
  CO: {
    code: "CO",
    label: "Colombia",
    flag: "🇨🇴",
    legalBadge: "Ley 1581 de 2012 · Habeas Data",
    heroTitle: "Ejerce tus derechos sobre",
    heroHighlight: "tus datos personales",
    heroDescription:
      "Consulta empresas afiliadas, solicita acceso, rectificación, cancelación u oposición (ARCO) y haz seguimiento con folio.",
    rightsLabel: "Derechos ARCO",
    docTypeOptions: [
      { value: "CC", title: "Cédula de ciudadanía" },
      { value: "TI", title: "Tarjeta de identidad" },
      { value: "OTHER", title: "Otro documento" },
    ],
    defaultDocType: "CC",
    trustStats: [
      { icon: "tabler:scale", label: "Marco legal", value: "Ley 1581 / 2012" },
      {
        icon: "tabler:clock",
        label: "Plazo respuesta",
        value: "15 días hábiles",
      },
      { icon: "tabler:receipt", label: "Seguimiento", value: "Folio por caso" },
    ],
    responseDaysLabel: "15 días hábiles",
    legalReferences: [
      { icon: "tabler:gavel", text: "Ley 1581 de 2012" },
      { icon: "tabler:file-text", text: "Decreto 1377 de 2013" },
      { icon: "tabler:shield-lock", text: "Derechos ARCO" },
    ],
    faq: [
      {
        question: "¿Quién puede usar este portal en Colombia?",
        answer:
          "Titulares que hayan entregado datos a empresas afiliadas y cuenten con correo registrado para verificación.",
      },
      {
        question: "¿Cuánto tarda la respuesta ARCO?",
        answer:
          "Hasta 15 días hábiles, prorrogables según la Ley 1581 de 2012 y su reglamento.",
      },
      {
        question: "¿No recibí el código de verificación?",
        answer:
          "Revisa spam, espera unos minutos y usa reenvío. Si persiste, contacta a la empresa responsable.",
      },
      {
        question: "¿Puedo solicitar ante varias empresas?",
        answer:
          "Sí. Tras verificar tu identidad verás cada empresa y podrás enviar solicitudes independientes.",
      },
      {
        question: "¿Mis datos están protegidos?",
        answer:
          "Sí. El proceso usa verificación segura y registro auditable de cada solicitud.",
      },
    ],
  },
  CL: {
    code: "CL",
    label: "Chile",
    flag: "🇨🇱",
    // Ley 19.628 fue derogada; el marco vigente es la Ley 21.719 (mismo
    // criterio que getDataProtectionLegalNotice en legalNotices.ts/.utils.ts).
    legalBadge: "Ley 21.719 · Protección de Datos Personales",
    heroTitle: "Gestiona tus datos personales en",
    heroHighlight: "Chile con trazabilidad",
    heroDescription:
      "Identifica empresas que tratan tu información, ejerce derechos de acceso, rectificación, supresión y oposición, y consulta el estado de tus solicitudes.",
    rightsLabel: "Derechos del titular",
    docTypeOptions: [
      { value: "RUT", title: "RUT" },
      { value: "CI", title: "Cédula de identidad" },
      { value: "PASSPORT", title: "Pasaporte" },
      { value: "OTHER", title: "Otro documento" },
    ],
    defaultDocType: "RUT",
    trustStats: [
      {
        icon: "tabler:scale",
        label: "Marco legal",
        value: "Ley 21.719",
      },
      {
        icon: "tabler:clock",
        label: "Plazo respuesta",
        value: "Según normativa vigente",
      },
      { icon: "tabler:receipt", label: "Seguimiento", value: "Folio por caso" },
    ],
    responseDaysLabel: "plazo legal aplicable",
    legalReferences: [
      { icon: "tabler:gavel", text: "Ley 21.719 de 2024" },
      {
        icon: "tabler:building-bank",
        text: "Agencia de Protección de Datos Personales (APDP)",
      },
      { icon: "tabler:shield-lock", text: "Derechos del titular" },
    ],
    faq: [
      {
        question: "¿Quién puede usar este portal en Chile?",
        answer:
          "Personas naturales titulares de datos tratados por empresas afiliadas, con correo registrado para validación.",
      },
      {
        question: "¿Qué leyes aplican en Chile?",
        answer:
          "La Ley 21.719 sobre Protección de Datos Personales, que reemplazó a la anterior Ley 19.628.",
      },
      {
        question: "¿Qué documento debo usar?",
        answer:
          "Generalmente tu RUT o cédula de identidad, según el documento que entregaste a la empresa.",
      },
      {
        question: "¿Puedo gestionar varias empresas?",
        answer:
          "Sí. Verás un listado y podrás enviar solicitudes separadas ante cada responsable del tratamiento.",
      },
      {
        question: "¿El proceso es seguro?",
        answer:
          "Sí. Validamos tu identidad por correo y registramos cada solicitud para auditoría.",
      },
    ],
  },
};
