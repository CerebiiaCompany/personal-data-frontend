import type { CompanyRolePermissions } from "@/types/companyRole.types";
import { Icon } from "@iconify/react";

interface Props {
  permissions: CompanyRolePermissions;
  /**
   * - "compact": resumen legible por módulo (listados de roles)
   * - "full": detalle con badges por acción
   */
  mode?: "compact" | "full";
}

/** Nombres de módulo visibles para el usuario final (sin iconos ambiguos). */
const MODULE_NAMES: Record<keyof CompanyRolePermissions, string> = {
  dashboard: "Inicio / Dashboard",
  collect: "Recolección",
  templates: "Plantillas",
  classification: "Clasificación",
  campaigns: "Campañas",
  audit: "Auditoría",
};

/** Etiquetas cortas para listados en tabla (densidad sin perder sentido). */
const MODULE_SHORT: Record<keyof CompanyRolePermissions, string> = {
  dashboard: "Inicio",
  collect: "Recolección",
  templates: "Plantillas",
  classification: "Clasif.",
  campaigns: "Campañas",
  audit: "Auditoría",
};

const ACTION_LABELS: Record<string, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  delete: "Eliminar",
  send: "Enviar",
};

function countActive(modulePerms: Record<string, boolean>) {
  return Object.values(modulePerms).filter(Boolean).length;
}

function countTotal(modulePerms: Record<string, boolean>) {
  return Object.keys(modulePerms).length;
}

function activeActionLabels(modulePerms: Record<string, boolean>): string[] {
  return Object.entries(modulePerms)
    .filter(([, v]) => v === true)
    .map(([action]) => ACTION_LABELS[action] ?? action);
}

/**
 * Visualización de permisos de un rol: texto claro, sin depender de iconos.
 */
export default function PermissionsBadges({
  permissions,
  mode = "compact",
}: Props) {
  if (mode === "compact") {
    type ModuleKey = keyof CompanyRolePermissions;

    const rows: {
      module: ModuleKey;
      active: number;
      total: number;
      actionsText: string;
      longName: string;
      shortName: string;
    }[] = [];

    for (const moduleKey of Object.keys(permissions) as ModuleKey[]) {
      const modulePerms = permissions[moduleKey] as Record<string, boolean>;
      const active = countActive(modulePerms);
      const total = countTotal(modulePerms);
      if (active === 0) continue;

      rows.push({
        module: moduleKey,
        active,
        total,
        actionsText: activeActionLabels(modulePerms).join(", "),
        longName: MODULE_NAMES[moduleKey],
        shortName: MODULE_SHORT[moduleKey],
      });
    }

    const summaryTitle =
      rows.length > 0
        ? rows
            .map(
              (r) =>
                `${r.longName}: ${r.actionsText} (${r.active}/${r.total})`
            )
            .join(" · ")
        : "Sin permisos asignados";

    /** Máximo de módulos en el modelo; chips en línea con wrap (sin apilar bloques). */
    const maxVisible = 6;
    const visible = rows.slice(0, maxVisible);
    const hidden = rows.slice(maxVisible);
    const hiddenSummary = hidden
      .map((r) => `${r.longName}: ${r.actionsText}`)
      .join(" · ");

    return (
      <div
        className="flex flex-wrap items-center gap-1 text-left"
        title={summaryTitle}
      >
        {visible.map((r) => (
          <span
            key={r.module}
            className="inline-flex max-w-full shrink-0 items-baseline gap-0.5 rounded border border-slate-200/90 bg-white/70 px-1.5 py-0.5 text-[10px] leading-tight text-slate-700 sm:text-[11px]"
            title={`${r.longName}: ${r.actionsText} (${r.active} de ${r.total} en este módulo)`}
          >
            <span className="font-semibold text-slate-800">{r.shortName}</span>
            <span className="text-slate-400" aria-hidden>
              ·
            </span>
            <span className="font-normal text-slate-600">{r.actionsText}</span>
          </span>
        ))}
        {hidden.length > 0 ? (
          <span
            className="inline-flex shrink-0 rounded border border-dashed border-slate-300 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 sm:text-[11px]"
            title={hiddenSummary}
          >
            +{hidden.length}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {(Object.keys(permissions) as (keyof CompanyRolePermissions)[]).map(
        (moduleKey) => {
          const modulePerms = permissions[moduleKey] as Record<
            string,
            boolean
          >;
          const activePerms = Object.entries(modulePerms)
            .filter(([, value]) => value === true)
            .map(([action]) => action);

          if (activePerms.length === 0) return null;

          return (
            <div key={moduleKey} className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-[#1A2B5B]">
                {MODULE_NAMES[moduleKey]}
              </p>
              <div className="flex flex-wrap gap-1">
                {activePerms.map((action) => (
                  <span
                    key={action}
                    className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900"
                  >
                    <Icon
                      icon="heroicons:check-circle-solid"
                      className="text-xs text-emerald-600"
                    />
                    {ACTION_LABELS[action] ?? action}
                  </span>
                ))}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}
