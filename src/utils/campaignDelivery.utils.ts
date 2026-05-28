import { deliveryChannelLabels } from "@/types/campaign.types";
import {
  CampaignDelivery,
  CampaignDeliveryStatus,
  CampaignDeliveryUser,
} from "@/types/campaignDelivery.types";
import { formatDateToString } from "@/utils/date.utils";

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
