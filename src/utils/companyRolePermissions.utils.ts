import type { CompanyRolePermissions } from "@/types/companyRole.types";

export const ROLE_MODULE_ORDER: (keyof CompanyRolePermissions)[] = [
  "dashboard",
  "collect",
  "templates",
  "classification",
  "campaigns",
  "audit",
];

export const ROLE_MODULE_TITLES: Record<keyof CompanyRolePermissions, string> = {
  dashboard: "Inicio / Dashboard",
  collect: "Recolección",
  templates: "Plantillas",
  classification: "Clasificación",
  campaigns: "Campañas",
  audit: "Auditoría",
};

export const ACTION_SHORT_LABELS: Record<string, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  delete: "Eliminar",
  send: "Enviar",
};

export type ModulePermissionStat = {
  key: keyof CompanyRolePermissions;
  title: string;
  active: number;
  total: number;
  /** Todas las acciones del módulo activas */
  isComplete: boolean;
};

export function summarizeRolePermissions(
  permissions: CompanyRolePermissions
): {
  active: number;
  total: number;
  percent: number;
  modulesWithAccess: number;
  modules: ModulePermissionStat[];
} {
  let active = 0;
  let total = 0;
  const modules: ModulePermissionStat[] = [];

  for (const key of ROLE_MODULE_ORDER) {
    const block = permissions[key] as Record<string, boolean>;
    const keys = Object.keys(block);
    let a = 0;
    for (const k of keys) {
      total += 1;
      if (block[k]) a += 1;
    }
    active += a;
    const isComplete = keys.length > 0 && a === keys.length;
    modules.push({
      key,
      title: ROLE_MODULE_TITLES[key],
      active: a,
      total: keys.length,
      isComplete,
    });
  }

  const modulesWithAccess = modules.filter((m) => m.active > 0).length;
  const percent = total === 0 ? 0 : Math.round((active / total) * 100);

  return {
    active,
    total,
    percent,
    modulesWithAccess,
    modules,
  };
}

export function maxUpdatedAt(roles: { updatedAt: string }[]): string | null {
  if (!roles.length) return null;
  return roles.reduce((best, r) =>
    new Date(r.updatedAt) > new Date(best) ? r.updatedAt : best
  , roles[0].updatedAt);
}

export function formatRelativeEs(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  let diff = Date.now() - t;
  if (diff < 0) diff = 0;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Hace un momento";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Hace ${days} día${days === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30);
  return `Hace ${months} mes${months === 1 ? "" : "es"}`;
}
