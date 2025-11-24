"use client";

import React, { useMemo } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { CompanyRolePermissions } from "@/types/companyRole.types";

interface CheckPermissionProps {
  /**
   * Grupo de permisos a verificar (ej: 'campaigns', 'collect', 'dashboard')
   */
  group: keyof CompanyRolePermissions;
  /**
   * Permiso específico a verificar (ej: 'create', 'view', 'edit', 'send')
   */
  permission: string;
  /**
   * Contenido a mostrar si el usuario tiene el permiso
   */
  children: React.ReactNode;
  /**
   * Contenido a mostrar si el usuario NO tiene el permiso (opcional)
   */
  fallback?: React.ReactNode;
  /**
   * Si es true, requiere que el usuario tenga todos los permisos especificados
   * Si es false (default), requiere que tenga al menos uno
   */
  requireAll?: boolean;
  /**
   * Lista adicional de permisos a verificar (para verificar múltiples permisos)
   */
  additionalPermissions?: string[];
}

/**
 * Componente que renderiza contenido condicionalmente basado en permisos del usuario
 * 
 * @example
 * ```tsx
 * // Verificar un solo permiso
 * <CheckPermission group="campaigns" permission="create">
 *   <Button>Crear Campaña</Button>
 * </CheckPermission>
 * 
 * // Con fallback
 * <CheckPermission 
 *   group="campaigns" 
 *   permission="create"
 *   fallback={<p>No tienes permiso para crear campañas</p>}
 * >
 *   <Button>Crear Campaña</Button>
 * </CheckPermission>
 * 
 * // Verificar múltiples permisos (al menos uno)
 * <CheckPermission 
 *   group="collect" 
 *   permission="create"
 *   additionalPermissions={["edit"]}
 * >
 *   <Button>Crear o Editar</Button>
 * </CheckPermission>
 * 
 * // Verificar múltiples permisos (todos requeridos)
 * <CheckPermission 
 *   group="campaigns" 
 *   permission="view"
 *   additionalPermissions={["send"]}
 *   requireAll={true}
 * >
 *   <Button>Ver y Enviar</Button>
 * </CheckPermission>
 * ```
 */
const CheckPermission: React.FC<CheckPermissionProps> = ({
  group,
  permission,
  children,
  fallback = null,
  requireAll = false,
  additionalPermissions = [],
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Memoizar el resultado de la verificación de permisos
  const hasAccess = useMemo(() => {
    if (additionalPermissions.length > 0) {
      // Verificar múltiples permisos
      const allPermissions = [permission, ...additionalPermissions];
      return requireAll
        ? hasAllPermissions(group, allPermissions)
        : hasAnyPermission(group, allPermissions);
    } else {
      // Verificar un solo permiso
      return hasPermission(group, permission);
    }
  }, [
    group,
    permission,
    requireAll,
    additionalPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  ]);

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

// Memoizar el componente para evitar re-renders innecesarios
export default React.memo(CheckPermission);


