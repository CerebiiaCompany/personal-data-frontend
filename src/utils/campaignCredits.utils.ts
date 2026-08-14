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

/**
 * Costo unitario por mensaje en la moneda de la empresa.
 * Los precios deben venir ya convertidos (API /credits/pricing):
 * COP para Colombia, USD para internacional — no se multiplica TRM aquí.
 */
export function getCreditsPerMessage(params: {
  deliveryChannel?: CampaignDeliveryChannel;
  smsCampaignPricePerMessage?: number;
  emailCampaignPricePerMessage?: number;
  whatsappCampaignPricePerMessage?: number;
  /** @deprecated Usar precios ya en moneda de display; se ignora. */
  trmCop?: number;
}): number | undefined {
  const {
    deliveryChannel,
    smsCampaignPricePerMessage,
    emailCampaignPricePerMessage,
    whatsappCampaignPricePerMessage,
  } = params;

  if (!deliveryChannel) return undefined;

  const price =
    deliveryChannel === "EMAIL"
      ? emailCampaignPricePerMessage
      : deliveryChannel === "WHATSAPP"
        ? whatsappCampaignPricePerMessage
        : smsCampaignPricePerMessage;

  if (!Number.isFinite(price)) return undefined;

  return price as number;
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

  return (
    (audienceCount as number) *
    (deliveriesCount as number) *
    (creditsPerMessage as number)
  );
}

/** Créditos estimados de una campaña (misma lógica que el listado). */
export function getCampaignInstanceCredits(params: {
  item: Campaign;
  smsCampaignPricePerMessage?: number;
  emailCampaignPricePerMessage?: number;
  whatsappCampaignPricePerMessage?: number;
  /** @deprecated */
  trmCop?: number;
}): number | undefined {
  const {
    item,
    smsCampaignPricePerMessage,
    emailCampaignPricePerMessage,
    whatsappCampaignPricePerMessage,
  } = params;
  const creditsPerMessage = getCreditsPerMessage({
    deliveryChannel: item.deliveryChannel,
    smsCampaignPricePerMessage,
    emailCampaignPricePerMessage,
    whatsappCampaignPricePerMessage,
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

export function formatBillingCurrencyLabel(
  currency?: "COP" | "USD" | null
): string {
  if (currency === "USD") return "USD";
  return "COP";
}
