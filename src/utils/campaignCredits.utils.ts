import { Campaign, CampaignDeliveryChannel } from "@/types/campaign.types";

export function asFiniteNumber(value: unknown): number | undefined {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : undefined;

  return Number.isFinite(n) ? (n as number) : undefined;
}

export function getCreditsPerMessage(params: {
  deliveryChannel?: CampaignDeliveryChannel;
  trmCop?: number;
  smsCampaignPricePerMessage?: number;
  emailCampaignPricePerMessage?: number;
}): number | undefined {
  const { deliveryChannel, trmCop, smsCampaignPricePerMessage, emailCampaignPricePerMessage } =
    params;

  if (!deliveryChannel) return undefined;
  if (!Number.isFinite(trmCop)) return undefined;

  const price =
    deliveryChannel === "EMAIL"
      ? emailCampaignPricePerMessage
      : smsCampaignPricePerMessage;

  if (!Number.isFinite(price)) return undefined;

  return (trmCop as number) * (price as number);
}

export function getTotalCampaignCredits(params: {
  audienceCount?: number;
  deliveriesCount?: number; // ocurrences; 1 for campañas de envío único
  creditsPerMessage?: number;
}): number | undefined {
  const { audienceCount, deliveriesCount = 1, creditsPerMessage } = params;

  if (!Number.isFinite(audienceCount)) return undefined;
  if (!Number.isFinite(deliveriesCount)) return undefined;
  if (!Number.isFinite(creditsPerMessage)) return undefined;

  return (audienceCount as number) * (deliveriesCount as number) * (creditsPerMessage as number);
}

/** Créditos estimados de una campaña (misma lógica que el listado). */
export function getCampaignInstanceCredits(params: {
  item: Campaign;
  trmCop?: number;
  smsCampaignPricePerMessage?: number;
  emailCampaignPricePerMessage?: number;
}): number | undefined {
  const { item, trmCop, smsCampaignPricePerMessage, emailCampaignPricePerMessage } =
    params;
  const creditsPerMessage = getCreditsPerMessage({
    deliveryChannel: item.deliveryChannel,
    trmCop,
    smsCampaignPricePerMessage,
    emailCampaignPricePerMessage,
  });
  const audienceTotal = item.audience.total ?? item.audience.count ?? 0;
  const deliveriesCount =
    item.scheduling?.scheduledDateTime || item.scheduledFor
      ? 1
      : item.scheduling?.ocurrences ?? 1;
  return getTotalCampaignCredits({
    audienceCount: audienceTotal,
    deliveriesCount,
    creditsPerMessage,
  });
}

