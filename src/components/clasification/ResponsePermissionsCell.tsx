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

const ResponsePermissionsCell = ({ permissions, column }: Props) => {
  const config = COLUMN_CONFIG[column];

  if (!permissions) {
    return <span className="text-[#9AA8C2]">—</span>;
  }

  const allowed = permissions[config.canReceiveKey] !== false;
  const reasons = allowed ? [] : getReasons(column, permissions);
  const reasonText = reasons.join(" · ");

  return (
    <div className="flex min-w-[100px] max-w-[160px] flex-col gap-1">
      <span
        title={
          allowed
            ? `${config.label}: permitido`
            : `${config.label}: bloqueado${reasonText ? ` — ${reasonText}` : ""}`
        }
        className={clsx(
          "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
          allowed
            ? "bg-[#E8F8EE] text-[#1E8A52]"
            : "bg-[#FDECEC] text-[#D84C4C]"
        )}
      >
        <Icon icon={config.icon} className="text-[12px] shrink-0" />
        <Icon
          icon={allowed ? "tabler:check" : "tabler:x"}
          className="text-[11px] shrink-0"
        />
        {allowed ? "Sí" : "No"}
      </span>
      {!allowed && reasonText ? (
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
