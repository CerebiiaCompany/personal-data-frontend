"use client";

import { CollectFormPermissions } from "@/types/collectFormResponse.types";
import {
  getConsentCampaignRestrictionLabels,
  getMarketingRestrictionLabels,
  getThirdPartyRestrictionLabels,
} from "@/utils/collectFormPermissions.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";

export type ResponsePermissionColumn =
  | "marketing"
  | "consentCampaigns"
  | "thirdParty";

interface Props {
  permissions?: CollectFormPermissions;
  column: ResponsePermissionColumn;
  /**
   * true si la persona realmente dio consentimiento (dataProcessing === true o
   * consentStatus === "ACTIVE"). Sin esto, "no bloqueado" (el default para un
   * registro recién importado o nunca contactado) se confundía visualmente con
   * "aceptó" — un registro pendiente debe verse como pendiente, no como aceptado.
   */
  hasConsented: boolean;
}

const COLUMN_CONFIG: Record<
  ResponsePermissionColumn,
  {
    label: string;
    icon: string;
    canReceiveKey:
      | "canReceiveMarketingCampaigns"
      | "canReceiveConsentCampaigns"
      | "canShareWithThirdParties";
  }
> = {
  marketing: {
    label: "Marketing",
    icon: "tabler:speakerphone",
    canReceiveKey: "canReceiveMarketingCampaigns",
  },
  consentCampaigns: {
    label: "Consentimiento",
    icon: "tabler:file-certificate",
    canReceiveKey: "canReceiveConsentCampaigns",
  },
  thirdParty: {
    label: "Terceros",
    icon: "tabler:share-3",
    canReceiveKey: "canShareWithThirdParties",
  },
};

function getReasons(
  column: ResponsePermissionColumn,
  permissions: CollectFormPermissions
): string[] {
  const r = permissions.restrictions;
  if (column === "marketing") return getMarketingRestrictionLabels(r);
  if (column === "consentCampaigns") return getConsentCampaignRestrictionLabels(r);
  return getThirdPartyRestrictionLabels(r);
}

const ResponsePermissionsCell = ({ permissions, column, hasConsented }: Props) => {
  const config = COLUMN_CONFIG[column];

  if (!permissions) {
    return <span className="text-[#9AA8C2]">—</span>;
  }

  const blocked = permissions[config.canReceiveKey] === false;
  // "Sí" (aceptó) requiere consentimiento real, no solo ausencia de bloqueo — un
  // registro que nunca pasó por el flujo de consentimiento (recién importado,
  // nunca contactado) está "pendiente", no "aceptó".
  const allowed = !blocked && hasConsented;
  const pending = !blocked && !hasConsented;
  const reasons = blocked ? getReasons(column, permissions) : [];
  const reasonText = reasons.join(" · ");

  const label = allowed ? "Sí" : pending ? "Pendiente" : "No";
  const title = allowed
    ? `${config.label}: aceptado`
    : pending
      ? `${config.label}: aún sin consentimiento (no bloqueado, pero tampoco aceptado)`
      : `${config.label}: bloqueado${reasonText ? ` — ${reasonText}` : ""}`;

  return (
    <div className="flex min-w-[100px] max-w-[160px] flex-col gap-1">
      <span
        title={title}
        className={clsx(
          "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
          allowed
            ? "bg-[#E8F8EE] text-[#1E8A52]"
            : pending
              ? "bg-[#FDF4E6] text-[#A97711]"
              : "bg-[#FDECEC] text-[#D84C4C]"
        )}
      >
        <Icon icon={config.icon} className="text-[12px] shrink-0" />
        <Icon
          icon={allowed ? "tabler:check" : pending ? "tabler:clock" : "tabler:x"}
          className="text-[11px] shrink-0"
        />
        {label}
      </span>
      {blocked && reasonText ? (
        <p
          className="text-[9px] leading-snug text-[#5C6D91] line-clamp-2"
          title={reasonText}
        >
          {reasonText}
        </p>
      ) : null}
    </div>
  );
};

export default ResponsePermissionsCell;
