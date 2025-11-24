import { useSessionStore } from "@/store/useSessionStore";
import { CompanyRolePermissions } from "@/types/companyRole.types";
import { useCallback, useMemo } from "react";

/**
 * Hook para acceder y verificar los permisos del usuario actual
 * 
 * @returns Objeto con los permisos del usuario y funciones de verificación
 * 
 * @example
 * ```tsx
 * const { permissions, hasPermission, canView, canCreate, canEdit, canSend } = usePermissions();
 * 
 * // Verificar un permiso específico
 * if (hasPermission('campaigns', 'create')) {
 *   // Mostrar botón de crear campaña
 * }
 * 
 * // Usar helpers específicos
 * if (canCreate('campaigns')) {
 *   // Mostrar botón de crear
 * }
 * ```
 */
export function usePermissions() {
  const user = useSessionStore((store) => store.user);

  // Obtener permisos del usuario (memoizado)
  const permissions: CompanyRolePermissions | null = useMemo(
    () => user?.companyUserData?.companyRole?.permissions || null,
    [user?.companyUserData?.companyRole?.permissions]
  );

  // Memoizar el estado de admin
  const isAdmin = useMemo(
    () => user?.role === "COMPANY_ADMIN" || user?.role === "SUPERADMIN",
    [user?.role]
  );

  /**
   * Verifica si el usuario tiene un permiso específico
   * 
   * @param group - Grupo de permisos (ej: 'campaigns', 'collect', 'dashboard')
   * @param permission - Nombre del permiso (ej: 'create', 'view', 'edit', 'send')
   * @returns true si el usuario tiene el permiso, false en caso contrario
   * 
   * @example
   * hasPermission('campaigns', 'create')
   * hasPermission('collect', 'edit')
   */
  const hasPermission = useCallback(
    (
      group: keyof CompanyRolePermissions,
      permission: string
    ): boolean => {
      // Si no hay permisos definidos, verificar por rol
      if (!permissions) {
        // Los COMPANY_ADMIN y SUPERADMIN tienen todos los permisos por defecto
        return isAdmin;
      }

      const groupPermissions = permissions[group];
      if (!groupPermissions) return false;

      // Verificar el permiso específico
      return (groupPermissions as Record<string, boolean>)[permission] === true;
    },
    [permissions, isAdmin]
  );

  /**
   * Verifica si el usuario puede ver un recurso
   */
  const canView = useCallback(
    (group: keyof CompanyRolePermissions): boolean => {
      return hasPermission(group, "view");
    },
    [hasPermission]
  );

  /**
   * Verifica si el usuario puede crear un recurso
   */
  const canCreate = useCallback(
    (group: keyof CompanyRolePermissions): boolean => {
      return hasPermission(group, "create");
    },
    [hasPermission]
  );

  /**
   * Verifica si el usuario puede editar un recurso
   */
  const canEdit = useCallback(
    (group: keyof CompanyRolePermissions): boolean => {
      return hasPermission(group, "edit");
    },
    [hasPermission]
  );

  /**
   * Verifica si el usuario puede enviar/enviar campañas
   */
  const canSend = useCallback(
    (group: keyof CompanyRolePermissions): boolean => {
      return hasPermission(group, "send");
    },
    [hasPermission]
  );

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   * 
   * @param group - Grupo de permisos
   * @param permissionList - Lista de permisos a verificar
   * @returns true si tiene al menos uno de los permisos
   */
  const hasAnyPermission = useCallback(
    (
      group: keyof CompanyRolePermissions,
      permissionList: string[]
    ): boolean => {
      return permissionList.some((permission) => hasPermission(group, permission));
    },
    [hasPermission]
  );

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * 
   * @param group - Grupo de permisos
   * @param permissionList - Lista de permisos a verificar
   * @returns true si tiene todos los permisos
   */
  const hasAllPermissions = useCallback(
    (
      group: keyof CompanyRolePermissions,
      permissionList: string[]
    ): boolean => {
      return permissionList.every((permission) => hasPermission(group, permission));
    },
    [hasPermission]
  );

  return {
    permissions,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canSend,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
  };
}


