import type { UserRole } from "./user.types";

export type CompanyRolePermissions = {
  dashboard: {
    view: boolean;
  };
  collect: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
  templates: {
    create: boolean;
    view: boolean;
    delete: boolean;
  };
  classification: {
    create: boolean;
    view: boolean;
    edit: boolean;
  };
  campaigns: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
    send: boolean;
  };
  audit: {
    view: boolean;
  };
  arcoRequests: {
    view: boolean;
    respond: boolean;
  };
};

export interface CreateCompanyRole {
  position: string;
  description: string;
  permissions: CompanyRolePermissions;
}

/**
 * Usuario asignado a un rol, tal como lo embebe el endpoint de roles.
 * Es una forma "plana" (no anidada en companyUserData) y sin password.
 */
export interface RoleAssignedUser {
  _id: string;
  /** Alias de `_id`; el backend envía ambos. */
  id?: string;
  name: string;
  lastName: string;
  username: string;
  role: UserRole;
  position?: string;
  phone?: string;
  personalEmail?: string;
  companyAreaId?: string | null;
  companyArea?: { _id?: string; id?: string; name: string } | null;
}

export interface CompanyRole extends CreateCompanyRole {
  _id: string;
  /** Alias de `_id`; el backend envía ambos. */
  id?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  /** Usuarios asignados a este rol (incluido por el endpoint de roles). */
  users?: RoleAssignedUser[];
}
