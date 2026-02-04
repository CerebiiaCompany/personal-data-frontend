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
  const userPermissions = useSessionStore((store) => store.permissions);

  // Obtener permisos del usuario (memoizado)
  // Prioridad: permisos del store > permisos del usuario > null
  const permissions: CompanyRolePermissions | null = useMemo(
    () => 
      userPermissions?.permissions || 
      user?.companyUserData?.companyRole?.permissions || 
      null,
    [userPermissions?.permissions, user?.companyUserData?.companyRole?.permissions]
  );

  // Verificar si es superadmin desde los permisos del store o desde el rol del usuario
  const isSuperAdmin = useMemo(
    () => userPermissions?.isSuperAdmin || user?.role === "SUPERADMIN",
    [userPermissions?.isSuperAdmin, user?.role]
  );

  // Memoizar el estado de admin (COMPANY_ADMIN también tiene todos los permisos)
  const isAdmin = useMemo(
    () => user?.role === "COMPANY_ADMIN" || isSuperAdmin,
    [user?.role, isSuperAdmin]
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
      // Si es superadmin, tiene todos los permisos
      if (isSuperAdmin) return true;

      // Si no hay permisos definidos, verificar por rol
      if (!permissions) {
        // Los COMPANY_ADMIN tienen todos los permisos por defecto
        return isAdmin;
      }

      const groupPermissions = permissions[group];
      if (!groupPermissions) return false;

      // Verificar el permiso específico
      return (groupPermissions as Record<string, boolean>)[permission] === true;
    },
    [permissions, isAdmin, isSuperAdmin]
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
    userPermissions, // Objeto completo con role, isSuperAdmin, etc.
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canSend,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isSuperAdmin,
  };
}


