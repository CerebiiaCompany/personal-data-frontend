"use client";

import {
  CAMPAIGN_DELIVERY_STATUS_COLORS,
  CAMPAIGN_DELIVERY_STATUS_LABELS,
} from "@/utils/campaignDelivery.utils";
import { CampaignDeliveryStatus } from "@/types/campaignDelivery.types";
import clsx from "clsx";

interface Props {
  status: CampaignDeliveryStatus;
  className?: string;
}

export default function CampaignDeliveryStatusBadge({ status, className }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        CAMPAIGN_DELIVERY_STATUS_COLORS[status],
        className
      )}
    >
      {CAMPAIGN_DELIVERY_STATUS_LABELS[status] ?? status}
    </span>
  );
}
