import {
  CollectFormPermissions,
  CollectFormPermissionsRestrictions,
} from "@/types/collectFormResponse.types";

const RESTRICTION_LABELS = {
  cancellationInProgress: "Cancelación en trámite",
  blockAllCampaigns: "Oposición aprobada: todas las campañas",
  blockMarketingCampaigns: "Oposición aprobada: campañas de marketing",
  blockConsentCampaigns: "Oposición aprobada: campañas de consentimiento",
  blockThirdParty: "Oposición aprobada: compartir con terceros",
} as const;

function activeRestrictionKeys(
  restrictions?: CollectFormPermissionsRestrictions
): (keyof typeof RESTRICTION_LABELS)[] {
  if (!restrictions) return [];
  return (Object.keys(RESTRICTION_LABELS) as (keyof typeof RESTRICTION_LABELS)[]).filter(
    (key) => Boolean(restrictions[key])
  );
}

/** Motivos que explican por qué no puede recibir campañas de marketing. */
export function getMarketingRestrictionLabels(
  restrictions?: CollectFormPermissionsRestrictions
): string[] {
  const keys = activeRestrictionKeys(restrictions);
  return keys
    .filter(
      (k) =>
        k === "cancellationInProgress" ||
        k === "blockAllCampaigns" ||
        k === "blockMarketingCampaigns"
    )
    .map((k) => RESTRICTION_LABELS[k]);
}

/** Motivos que explican por qué no puede recibir campañas de consentimiento. */
export function getConsentCampaignRestrictionLabels(
  restrictions?: CollectFormPermissionsRestrictions
): string[] {
  const keys = activeRestrictionKeys(restrictions);
  return keys
    .filter(
      (k) =>
        k === "cancellationInProgress" ||
        k === "blockAllCampaigns" ||
        k === "blockConsentCampaigns"
    )
    .map((k) => RESTRICTION_LABELS[k]);
}

/** Motivos que explican por qué no puede compartirse con terceros. */
export function getThirdPartyRestrictionLabels(
  restrictions?: CollectFormPermissionsRestrictions
): string[] {
  const keys = activeRestrictionKeys(restrictions);
  return keys
    .filter((k) => k === "blockThirdParty" || k === "cancellationInProgress")
    .map((k) => RESTRICTION_LABELS[k]);
}

/** Resumen único para columna de detalle cuando hay algún bloqueo. */
export function getPermissionsBlockSummary(
  permissions?: CollectFormPermissions
): string {
  if (!permissions) return "";

  const parts: string[] = [];
  if (permissions.canReceiveMarketingCampaigns === false) {
    const labels = getMarketingRestrictionLabels(permissions.restrictions);
    if (labels.length) parts.push(...labels);
  }
  if (permissions.canReceiveConsentCampaigns === false) {
    const labels = getConsentCampaignRestrictionLabels(permissions.restrictions);
    labels.forEach((l) => {
      if (!parts.includes(l)) parts.push(l);
    });
  }
  if (permissions.canShareWithThirdParties === false) {
    const labels = getThirdPartyRestrictionLabels(permissions.restrictions);
    labels.forEach((l) => {
      if (!parts.includes(l)) parts.push(l);
    });
  }

  return [...new Set(parts)].join(" · ");
}

export function hasAnyPermissionBlock(permissions?: CollectFormPermissions): boolean {
  if (!permissions) return false;
  return (
    permissions.canReceiveMarketingCampaigns === false ||
    permissions.canReceiveConsentCampaigns === false ||
    permissions.canShareWithThirdParties === false
  );
}
