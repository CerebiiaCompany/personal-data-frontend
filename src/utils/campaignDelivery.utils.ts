import { deliveryChannelLabels } from "@/types/campaign.types";
import {
  CampaignDelivery,
  CampaignDeliveryStatus,
  CampaignDeliveryUser,
} from "@/types/campaignDelivery.types";
import { formatDateToString } from "@/utils/date.utils";

export function deliveryChannelIcon(channel?: string): string {
  if (channel === "SMS") return "tabler:device-mobile-message";
  if (channel === "WHATSAPP") return "tabler:brand-whatsapp";
  return "tabler:mail";
}

export const CAMPAIGN_DELIVERY_STATUS_LABELS: Record<CampaignDeliveryStatus, string> = {
  SUCCESS: "Enviado",
  FAILED: "Fallido",
  PENDING: "Pendiente",
};

export const CAMPAIGN_DELIVERY_STATUS_COLORS: Record<CampaignDeliveryStatus, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-800 border-emerald-200",
  FAILED: "bg-red-50 text-red-800 border-red-200",
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
};

/** Estado real del mensaje en WhatsApp (lo reporta YCloud tras el envío). */
export const PROVIDER_STATUS_LABELS: Record<string, string> = {
  ACCEPTED: "Aceptado por WhatsApp",
  SENT: "En camino",
  DELIVERED: "Entregado",
  READ: "Leído",
  FAILED: "No entregado",
};

export const PROVIDER_STATUS_COLORS: Record<string, string> = {
  ACCEPTED: "text-[#64748B]",
  SENT: "text-[#B45309]",
  DELIVERED: "text-emerald-700",
  READ: "text-emerald-800",
  FAILED: "text-red-700",
};

/** Errores de Meta más comunes, en lenguaje claro. */
const WHATSAPP_ERROR_HINTS: Record<string, string> = {
  "131049":
    "Meta limitó los mensajes de marketing a esta persona (recibió muchos de empresas recientemente). Reintenta en 24 h o más.",
  "131026": "El número no tiene WhatsApp o no puede recibir el mensaje.",
  "131050": "La persona dejó de aceptar mensajes de marketing de esta empresa.",
  "131053": "No se pudo descargar la imagen del mensaje (revisa que la URL sea pública).",
  "132001": "La plantilla no existe o no está aprobada en ese idioma.",
  "132015": "La plantilla está pausada por baja calidad.",
  "132016": "La plantilla fue deshabilitada.",
  "130472": "El número forma parte de un experimento de Meta y no recibió el mensaje de marketing.",
  OPTED_OUT: "La persona pidió no recibir más mensajes (lista de bajas).",
};

export function describeProviderError(code?: string | null, message?: string | null): string | null {
  if (!code && !message) return null;
  return (code && (WHATSAPP_ERROR_HINTS[code] ?? emailErrorHint(code))) || message || code || null;
}

const GENDER_LABELS: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
  OTHER: "Otro",
  ALL: "Todos",
};

export function formatDeliveryDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const date = formatDateToString({ date: d });
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${date} ${hours}:${minutes}`;
}

export function formatDeliveryUserName(user: CampaignDeliveryUser | null): string {
  if (!user) return "Usuario no disponible";
  const parts = [user.name, user.lastName].filter(Boolean);
  return parts.length ? parts.join(" ") : "Usuario no disponible";
}

export function formatDeliveryDocument(user: CampaignDeliveryUser | null): string {
  if (!user) return "—";
  return `${user.docType} ${user.docNumber}`;
}

export function formatDeliveryGender(gender?: string): string {
  if (!gender) return "—";
  return GENDER_LABELS[gender] ?? gender;
}

export function formatDeliveryChannel(channel: string): string {
  return deliveryChannelLabels[channel as keyof typeof deliveryChannelLabels] ?? channel;
}

export function getDeliveryRowKey(item: CampaignDelivery, index: number): string {
  if (item._id) return item._id;
  if (item.formResponseId && item.createdAt) {
    return `${item.formResponseId}-${item.recipient}-${item.createdAt}`;
  }
  return String(index);
}

// ─── Email: estados y motivos en lenguaje claro ─────────────────────────────

/** Estados que el backend registra para cada correo de campaña. */
export const EMAIL_PROVIDER_STATUS_LABELS: Record<string, string> = {
  ACCEPTED: "Aceptado por el servidor de correo",
  FAILED: "Rechazado",
  DEFERRED: "Reprogramado",
  RETRY_QUEUED: "Reintento en cola",
};

const EXTRA_STATUS_COLORS: Record<string, string> = {
  DEFERRED: "text-[#B45309]",
  RETRY_QUEUED: "text-[#1D4ED8]",
};

/** Etiqueta del estado del proveedor según el canal (WhatsApp y Email usan códigos distintos). */
export function providerStatusLabel(channel: string | undefined, status: string): string {
  if (channel === "EMAIL") return EMAIL_PROVIDER_STATUS_LABELS[status] ?? status;
  return PROVIDER_STATUS_LABELS[status] ?? EMAIL_PROVIDER_STATUS_LABELS[status] ?? status;
}

export function providerStatusColor(status: string): string {
  return PROVIDER_STATUS_COLORS[status] ?? EXTRA_STATUS_COLORS[status] ?? "text-[#64748B]";
}

export function providerChannelName(channel: string | undefined): string {
  if (channel === "EMAIL") return "Correo";
  if (channel === "SMS") return "SMS";
  return "WhatsApp";
}

/** Motivos de fallo / reprogramación de correos, en lenguaje claro. */
export function emailErrorHint(code: string): string | null {
  const exact: Record<string, string> = {
    DAILY_QUOTA: "Se alcanzó el cupo diario de correos de campaña. Sale automáticamente cuando se reinicie el cupo.",
    PROVIDER_QUOTA:
      "El proveedor de correo (Brevo) rechazó por cupo agotado — puede que aún no haya reiniciado su contador. Se reintenta automáticamente cada hora.",
    RATE_LIMIT: "El proveedor pidió bajar la velocidad de envío. Se reintenta en unos minutos.",
    PROVIDER_ERROR: "El proveedor falló varias veces seguidas; el envío se pausó y se reintenta en 30 minutos.",
    NETWORK: "No hubo conexión con el proveedor de correo (red o servicio caído).",
    UNKNOWN: "Error desconocido del proveedor.",
  };
  if (exact[code]) return exact[code];
  const http = code.match(/^HTTP_(\d{3})/);
  if (http) {
    const s = Number(http[1]);
    if (s === 400) return "El proveedor rechazó el correo (dirección inválida o datos del mensaje incorrectos).";
    if (s === 401 || s === 403) return "El proveedor rechazó la autenticación (revisa la API key o las IPs autorizadas en Brevo).";
    if (s === 402) return "Sin créditos o cupo en el proveedor de correo.";
    if (s >= 500) return "Error interno del proveedor de correo.";
  }
  return null;
}
