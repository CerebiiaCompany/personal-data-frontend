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
  return (code && WHATSAPP_ERROR_HINTS[code]) || message || code || null;
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
