import { CompanyRolePermissions } from "@/types/companyRole.types";
import { SessionUser, UserPermissionsResponse } from "@/types/user.types";

/**
 * Verifica si un usuario tiene un permiso específico usando el formato 'modulo.accion'
 * 
 * @param permissions - Objeto de permisos del usuario (desde el store)
 * @param permissionPath - Ruta del permiso en formato 'modulo.accion' (ej: 'campaigns.create', 'collect.edit')
 * @returns true si el usuario tiene el permiso, false en caso contrario
 * 
 * @example
 * ```tsx
 * const permissions = useSessionStore((store) => store.permissions);
 * if (hasPermission(permissions, 'campaigns.create')) {
 *   // Usuario puede crear campañas
 * }
 * ```
 */
export function hasPermissionByPath(
  permissions: UserPermissionsResponse | undefined,
  permissionPath: string
): boolean {
  if (!permissions) return false;
  
  // Si es superadmin, tiene todos los permisos
  if (permissions.isSuperAdmin) return true;
  
  const [module, action] = permissionPath.split('.');
  
  if (!module || !action) return false;
  
  const modulePermissions = permissions.permissions[module as keyof CompanyRolePermissions];
  if (!modulePermissions) return false;
  
  return (modulePermissions as Record<string, boolean>)[action] === true;
}

/**
 * Verifica si un usuario tiene un permiso específico
 * 
 * @param user - Usuario de la sesión
 * @param group - Grupo de permisos (ej: 'campaigns', 'collect', 'dashboard')
 * @param permission - Nombre del permiso (ej: 'create', 'view', 'edit', 'send')
 * @returns true si el usuario tiene el permiso, false en caso contrario
 * 
 * @example
 * ```tsx
 * const user = useSessionStore((store) => store.user);
 * if (hasPermission(user, 'campaigns', 'create')) {
 *   // Usuario puede crear campañas
 * }
 * ```
 */
export function hasPermission(
  user: SessionUser | undefined,
  group: keyof CompanyRolePermissions,
  permission: string
): boolean {
  if (!user) return false;

  // Los COMPANY_ADMIN y SUPERADMIN tienen todos los permisos por defecto
  if (user.role === "COMPANY_ADMIN" || user.role === "SUPERADMIN") {
    return true;
  }

  // Si el usuario no tiene companyUserData o companyRole, no tiene permisos
  if (!user.companyUserData?.companyRole?.permissions) {
    return false;
  }

  const permissions = user.companyUserData.companyRole.permissions;
  const groupPermissions = permissions[group];

  if (!groupPermissions) return false;

  // Verificar el permiso específico
  return (groupPermissions as Record<string, boolean>)[permission] === true;
}

/**
 * Verifica si un usuario puede ver un recurso
 */
export function canView(
  user: SessionUser | undefined,
  group: keyof CompanyRolePermissions
): boolean {
  return hasPermission(user, group, "view");
}

/**
 * Verifica si un usuario puede crear un recurso
 */
export function canCreate(
  user: SessionUser | undefined,
  group: keyof CompanyRolePermissions
): boolean {
  return hasPermission(user, group, "create");
}

/**
 * Verifica si un usuario puede editar un recurso
 */
export function canEdit(
  user: SessionUser | undefined,
  group: keyof CompanyRolePermissions
): boolean {
  return hasPermission(user, group, "edit");
}

/**
 * Verifica si un usuario puede enviar/enviar campañas
 */
export function canSend(
  user: SessionUser | undefined,
  group: keyof CompanyRolePermissions
): boolean {
  return hasPermission(user, group, "send");
}

/**
 * Obtiene los permisos del usuario
 */
export function getUserPermissions(
  user: SessionUser | undefined
): CompanyRolePermissions | null {
  return user?.companyUserData?.companyRole?.permissions || null;
}


