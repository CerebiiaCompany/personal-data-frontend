import { useSessionStore } from "@/store/useSessionStore";
import { useCallback, useMemo } from "react";

/**
 * Hook para verificar permisos antes de hacer requests al backend
 * 
 * @example
 * ```tsx
 * const { can, shouldFetch } = usePermissionCheck();
 * 
 * // Verificar si puede ver campañas
 * if (can('campaigns.view')) {
 *   // Hacer algo
 * }
 * 
 * // Usar en useEffect o queries
 * useEffect(() => {
 *   if (shouldFetch('campaigns.view')) {
 *     loadCampaigns();
 *   }
 * }, [shouldFetch]);
 * ```
 */
export function usePermissionCheck() {
  const permissions = useSessionStore((store) => store.permissions);
  const user = useSessionStore((store) => store.user);

  // Verificar si es superadmin
  const isSuperAdmin = useMemo(
    () => permissions?.isSuperAdmin || user?.role === "SUPERADMIN",
    [permissions?.isSuperAdmin, user?.role]
  );

  // Verificar si es admin de empresa
  const isCompanyAdmin = useMemo(
    () => user?.role === "COMPANY_ADMIN" || isSuperAdmin,
    [user?.role, isSuperAdmin]
  );

  // Permisos efectivos: priorizar los del store (getPermissions) y, si no se
  // cargaron (p. ej. el endpoint falló o aún no respondió), usar los del rol
  // embebido en la sesión. Alinea este hook con usePermissions y evita bloquear
  // peticiones cuando los permisos granulares no están disponibles.
  const effectivePermissions = useMemo(
    () =>
      permissions?.permissions ||
      user?.companyUserData?.companyRole?.permissions ||
      null,
    [permissions?.permissions, user?.companyUserData?.companyRole?.permissions]
  );

  /**
   * Verifica si el usuario tiene un permiso específico
   * 
   * @param permission - Permiso en formato 'modulo.accion' (ej: 'campaigns.view')
   * @returns true si tiene el permiso, false si no
   */
  const can = useCallback(
    (permission: string): boolean => {
      // Los admins/superadmins tienen acceso completo, incluso si los permisos
      // granulares aún no se cargaron. Este chequeo DEBE ir antes del guard de
      // `effectivePermissions` para no bloquear sus peticiones.
      if (isSuperAdmin || isCompanyAdmin) return true;

      if (!effectivePermissions) return false;

      const [module, action] = permission.split(".");
      if (!module || !action) return false;

      const modulePerms =
        effectivePermissions[module as keyof typeof effectivePermissions];
      if (!modulePerms) return false;

      return (modulePerms as Record<string, boolean>)[action] === true;
    },
    [effectivePermissions, isSuperAdmin, isCompanyAdmin]
  );

  /**
   * Helper para saber si debe hacer un fetch al backend
   * Retorna true si tiene permisos, false si no
   * 
   * @param permission - Permiso en formato 'modulo.accion'
   * @returns true si debe hacer el fetch, false si no
   */
  const shouldFetch = useCallback(
    (permission: string): boolean => {
      return can(permission);
    },
    [can]
  );

  /**
   * Verifica si puede hacer requests de SUPERADMIN
   */
  const canAccessSuperAdmin = useMemo(
    () => isSuperAdmin,
    [isSuperAdmin]
  );

  return {
    can,
    shouldFetch,
    isSuperAdmin,
    isCompanyAdmin,
    canAccessSuperAdmin,
    permissionsLoaded: permissions !== undefined,
  };
}
