import {
  SystemInventoryDeployment,
  SystemInventoryDpaStatus,
  SystemInventoryRiskLevel,
  SYSTEM_INVENTORY_DEPLOYMENT_LABELS,
  SYSTEM_INVENTORY_DPA_STATUS_LABELS,
  SYSTEM_INVENTORY_RISK_LEVEL_LABELS,
} from "@/types/systemInventory.types";
import { Icon } from "@iconify/react";
import clsx from "clsx";

const DEPLOYMENT_STYLE: Record<SystemInventoryDeployment, { className: string; icon: string }> = {
  LOCAL: { className: "bg-slate-100 text-slate-600 border-slate-200", icon: "tabler:building-warehouse" },
  CLOUD: { className: "bg-sky-50 text-sky-700 border-sky-200", icon: "tabler:cloud" },
};

const RISK_LEVEL_STYLE: Record<SystemInventoryRiskLevel, { className: string; icon: string }> = {
  NORMAL: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "tabler:shield-check" },
  ALTO: { className: "bg-rose-50 text-rose-700 border-rose-200", icon: "tabler:alert-triangle" },
};

const DPA_STATUS_STYLE: Record<SystemInventoryDpaStatus, { className: string; icon: string }> = {
  NOT_REQUIRED: { className: "bg-slate-100 text-slate-500 border-slate-200", icon: "tabler:minus" },
  PENDING: { className: "bg-amber-50 text-amber-700 border-amber-200", icon: "tabler:clock-hour-4" },
  SIGNED: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "tabler:file-check" },
};

function Badge({ className, icon, label }: { className: string; icon: string; label: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        className
      )}
    >
      <Icon icon={icon} className="text-sm" />
      {label}
    </span>
  );
}

export function DeploymentBadge({ deployment }: { deployment: SystemInventoryDeployment }) {
  const style = DEPLOYMENT_STYLE[deployment];
  return <Badge {...style} label={SYSTEM_INVENTORY_DEPLOYMENT_LABELS[deployment]} />;
}

export function RiskLevelBadge({ riskLevel }: { riskLevel: SystemInventoryRiskLevel }) {
  const style = RISK_LEVEL_STYLE[riskLevel];
  return <Badge {...style} label={SYSTEM_INVENTORY_RISK_LEVEL_LABELS[riskLevel]} />;
}

export function DpaStatusBadge({ dpaStatus }: { dpaStatus: SystemInventoryDpaStatus }) {
  const style = DPA_STATUS_STYLE[dpaStatus];
  return <Badge {...style} label={SYSTEM_INVENTORY_DPA_STATUS_LABELS[dpaStatus]} />;
}
