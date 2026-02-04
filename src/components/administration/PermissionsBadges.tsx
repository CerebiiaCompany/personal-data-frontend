import { CompanyRolePermissions } from "@/types/companyRole.types";
import { Icon } from "@iconify/react";

interface Props {
  permissions: CompanyRolePermissions;
  /**
   * Modo de visualización:
   * - "compact": Muestra solo contadores por módulo
   * - "full": Muestra todos los permisos con badges
   */
  mode?: "compact" | "full";
}

const permissionLabels: Record<string, string> = {
  dashboard: "📊 Dashboard",
  collect: "📋 Recolección",
  templates: "📄 Plantillas",
  classification: "🗂️ Clasificación",
  campaigns: "📧 Campañas",
};

const actionLabels: Record<string, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  send: "Enviar",
};

/**
 * Componente para visualizar permisos de un rol de forma visual
 */
export default function PermissionsBadges({ permissions, mode = "compact" }: Props) {
  // Contar permisos activos por módulo
  const getActivePermissionsCount = (modulePerms: Record<string, boolean>) => {
    return Object.values(modulePerms).filter(Boolean).length;
  };

  const getTotalPermissionsCount = (modulePerms: Record<string, boolean>) => {
    return Object.keys(modulePerms).length;
  };

  if (mode === "compact") {
    return (
      <div className="flex flex-wrap gap-1.5 justify-center items-center">
        {Object.entries(permissions).map(([module, modulePerms]) => {
          const active = getActivePermissionsCount(modulePerms);
          const total = getTotalPermissionsCount(modulePerms);
          const hasAnyPermission = active > 0;

          if (!hasAnyPermission) return null;

          return (
            <div
              key={module}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-100 text-primary-900 text-xs font-medium"
              title={`${permissionLabels[module]}: ${active}/${total} permisos`}
            >
              <span>{permissionLabels[module]?.split(" ")[0]}</span>
              <span className="text-[10px] opacity-70">
                {active}/{total}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Modo "full" - muestra todos los permisos
  return (
    <div className="flex flex-col gap-2">
      {Object.entries(permissions).map(([module, modulePerms]) => {
        const activePerms = Object.entries(modulePerms)
          .filter(([_, value]) => value === true)
          .map(([action]) => action);

        if (activePerms.length === 0) return null;

        return (
          <div key={module} className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-stone-700">
              {permissionLabels[module]}
            </p>
            <div className="flex flex-wrap gap-1">
              {activePerms.map((action) => (
                <span
                  key={action}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 text-green-800 text-xs"
                >
                  <Icon icon="heroicons:check-circle-solid" className="text-xs" />
                  {actionLabels[action]}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
