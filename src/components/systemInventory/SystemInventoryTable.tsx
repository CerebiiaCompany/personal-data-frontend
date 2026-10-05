import { DeploymentBadge, DpaStatusBadge, RiskLevelBadge } from "./SystemInventoryBadges";
import { SystemInventory } from "@/types/systemInventory.types";
import { formatInventoryCountry, isUnknownInventoryCountry } from "@/utils/systemInventoryCountry";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface Props {
  items: SystemInventory[] | null;
  loading: boolean;
  error: string | null;
}

const SystemInventoryTable = ({ items, loading, error }: Props) => {
  if (loading && !items) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-[#F1F5FB]" />
        ))}
      </div>
    );
  }

  if (error && !items) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
        <Icon icon="tabler:alert-triangle" className="text-3xl text-rose-400" />
        <p className="text-sm text-[#64748B]">{error}</p>
      </div>
    );
  }

  if (items && items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3FF] text-[#3357A5]">
          <Icon icon="tabler:server-2" className="text-2xl" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#1A2B5B]">Aún no hay sistemas registrados</p>
          <p className="mt-1 text-sm text-[#64748B]">
            Registra los sistemas que almacenan o procesan datos personales de la empresa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#EEF2F8] text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
            <th className="px-4 py-3">Sistema</th>
            <th className="px-4 py-3">Despliegue</th>
            <th className="px-4 py-3">País</th>
            <th className="px-4 py-3">Riesgo</th>
            <th className="px-4 py-3">DPA</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {items?.map((system) => (
            <tr
              key={system.id}
              className="border-b border-[#F1F5FB] transition-colors hover:bg-[#F8FAFC]"
            >
              <td className="max-w-[260px] px-4 py-3">
                <Link
                  href={`/admin/inventario-sistemas/${system.id}`}
                  className="block truncate font-semibold text-[#1A2B5B] hover:underline"
                  title={system.name}
                >
                  {system.name}
                </Link>
                <p className="mt-0.5 truncate text-xs text-[#94A3B8]">
                  {system.category}
                  {system.provider ? ` · ${system.provider}` : ""}
                </p>
              </td>
              <td className="px-4 py-3">
                <DeploymentBadge deployment={system.deployment} />
              </td>
              <td className="px-4 py-3 text-sm text-[#475569]">
                {isUnknownInventoryCountry(system.country) ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                    {formatInventoryCountry(system.country)}
                  </span>
                ) : (
                  system.country
                )}
                {system.hasExternalAccess && system.dpaStatus !== "NOT_REQUIRED" && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                    <Icon icon="tabler:world" className="text-xs" />
                    Acceso externo
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <RiskLevelBadge riskLevel={system.riskLevel} />
              </td>
              <td className="px-4 py-3">
                <DpaStatusBadge dpaStatus={system.dpaStatus} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/inventario-sistemas/${system.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-900 hover:underline"
                >
                  Ver
                  <Icon icon="tabler:chevron-right" className="text-base" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SystemInventoryTable;
