import { CompanyArea } from "./companyArea.types";
import { CompanyRole, CompanyRolePermissions } from "./companyRole.types";
import { CustomSelectOption } from "./forms.types";

export type UserRole = "USER" | "COMPANY_ADMIN" | "SUPERADMIN";

/**
 * Respuesta del endpoint /api/v1/auth/permissions
 */
export interface UserPermissionsResponse {
  role: UserRole;
  isSuperAdmin: boolean;
  companyRoleId?: string;
  companyRoleName?: string;
  permissions: CompanyRolePermissions;
}
export const userRoleOptions: CustomSelectOption<UserRole>[] = [
  {
    value: "USER",
    title: "Usuario",
  },
  {
    value: "COMPANY_ADMIN",
    title: "Administrador de empresa",
  },
  {
    value: "SUPERADMIN",
    title: "Superadministrador",
  },
];
export const parseUserRoleToString = (role: UserRole): string =>
  userRoleOptions.find((e) => e.value === role)?.title || "Rol inválido";

export type DocType = "CC" | "TI" | "NIT" | "OTHER" | "RUT" | "CI" | "PASSPORT" | "CIE";

/**
 * Opciones de documento para persona natural (formularios públicos de
 * consentimiento). No incluye NIT: ese caso se maneja como persona jurídica.
 *
 * Se mantiene sin cambios (CC/TI/Otro) por compatibilidad — lo usan varios
 * formularios internos (CreateAdminForm, CreateCompanyForm, etc.) que no
 * pasaron por este bug de cara al titular. Para formularios públicos nuevos
 * o que sí necesiten variar por país, usar getDocTypeOptionsByCountry().
 */
export const docTypesOptions: CustomSelectOption<DocType>[] = [
  {
    value: "CC",
    title: "C.C.",
  },
  {
    value: "TI",
    title: "T.I.",
  },
  {
    value: "OTHER",
    title: "Otro",
  },
];

/**
 * Opciones de documento de persona natural para CO en formularios públicos
 * (a diferencia de docTypesOptions, que no incluye NIT y no debe tocarse por
 * los formularios internos que ya la usan).
 */
const publicNaturalDocTypeOptionsCO: CustomSelectOption<DocType>[] = [
  { value: "CC", title: "C.C." },
  { value: "TI", title: "T.I." },
  { value: "NIT", title: "NIT" },
  { value: "OTHER", title: "Otro" },
];

/**
 * Tipos de documento de PERSONA NATURAL para formularios públicos de cara al
 * titular, según el país de la empresa (company.countryCode). CL: solo RUT
 * (en Chile el identificador civil/tributario es el RUT). Cualquier país no
 * reconocido (incluyendo undefined/null) cae a CO — mismo patrón que
 * getDataProtectionLegalNotice y getInternationalTransferNotice.
 */
export function getDocTypeOptionsByCountry(countryCode?: string | null): {
  options: CustomSelectOption<DocType>[];
  defaultValue: DocType;
} {
  if (countryCode === "CL") {
    return {
      options: [{ value: "RUT", title: "RUT" }],
      defaultValue: "RUT",
    };
  }
  // CO y cualquier país no reconocido — default a CO.
  return { options: publicNaturalDocTypeOptionsCO, defaultValue: "CC" };
}

/**
 * Tipo de documento de PERSONA JURÍDICA (empresa) según el país de la
 * empresa. CL: una empresa chilena se identifica con RUT, no NIT. Cualquier
 * país no reconocido cae a NIT (comportamiento histórico).
 */
export function getJuridicaDocType(countryCode?: string | null): "RUT" | "NIT" {
  return countryCode === "CL" ? "RUT" : "NIT";
}

/**
 * Opciones de documento para usuarios de empresa (módulo de administración).
 * Incluye NIT, admitido por el contrato del backend.
 */
export const companyUserDocTypeOptions: CustomSelectOption<DocType>[] = [
  {
    value: "CC",
    title: "C.C.",
  },
  {
    value: "TI",
    title: "T.I.",
  },
  {
    value: "NIT",
    title: "NIT",
  },
  {
    value: "OTHER",
    title: "Otro",
  },
];

const chileAdminDocTypeOptions: CustomSelectOption<DocType>[] = [
  { value: "RUT", title: "RUT" },
  { value: "PASSPORT", title: "Pasaporte" },
  { value: "CIE", title: "Cédula de Identidad Extranjera" },
  { value: "OTHER", title: "Otro" },
];

/**
 * Tipos de documento para formularios internos de administración
 * (crear empresa, admin, usuarios) según el país de la empresa.
 * CL: RUT por defecto. CO: opciones históricas (CC/TI[/NIT]/Otro).
 */
export function getAdminDocTypeOptionsByCountry(
  countryCode?: string | null,
  options: { includeNit?: boolean } = {}
): {
  options: CustomSelectOption<DocType>[];
  defaultValue: DocType;
} {
  if (countryCode === "CL") {
    return { options: chileAdminDocTypeOptions, defaultValue: "RUT" };
  }
  return {
    options: options.includeNit ? companyUserDocTypeOptions : docTypesOptions,
    defaultValue: "CC",
  };
}

// Item BUG-STAGING-4 (reporte SMG, 27 ago 2026): antes buscaba el label en
// companyUserDocTypeOptions ∪ chileAdminDocTypeOptions (7 valores) — "CI"
// (Cédula de identidad) es un valor válido del enum DocType del backend
// (prisma/schema.prisma) que no aparece en NINGUNA de las dos listas de UI,
// así que cualquier usuario con docType="CI" mostraba "Tipo de documento
// inválido" en Mi Perfil aunque su dato en BD fuera perfectamente válido.
// Record<DocType,string> fuerza en compilación que los 8 valores del enum
// tengan label — mismo patrón que COUNTRIES_DICT (country.utils.ts).
const DOC_TYPE_LABELS: Record<DocType, string> = {
  CC: "C.C.",
  TI: "T.I.",
  NIT: "NIT",
  OTHER: "Otro",
  RUT: "RUT",
  CI: "Cédula de identidad",
  PASSPORT: "Pasaporte",
  CIE: "Cédula de Identidad Extranjera",
};

export const parseDocTypeToString = (type: DocType): string =>
  DOC_TYPE_LABELS[type] ?? "Tipo de documento inválido";

export interface CreateUser {
  name: string;
  lastName: string;
  username: string;
  role: UserRole;
  /** Item CHK-051: opcional — si se omite, el servidor genera una temporal. */
  password?: string;
  companyUserData: {
    position: string;
    phone: string;
    personalEmail: string;
    companyAreaId?: string;
    companyRoleId?: string;
    note?: string;
    docNumber: string | number;
    docType: DocType;
  };
}

export interface UpdateUser {
  name: string;
  lastName: string;
  username?: string;
  role: UserRole;
  password?: string;
  companyUserData: {
    position: string;
    phone: string;
    personalEmail: string;
    companyAreaId?: string;
    companyRoleId?: string;
    note?: string;
    docNumber: string | number;
    docType: DocType;
  };
}

/**
 * Resultado de la importación masiva de usuarios desde Excel
 * (POST /companies/:companyId/users/import).
 */
export interface ImportUsersResult {
  summary: {
    total: number;
    createdCount: number;
    errorCount: number;
  };
  created: {
    row: number;
    username: string;
    id: string;
  }[];
  errors: {
    row: number;
    username?: string;
    error: string;
  }[];
}

export interface SessionUser {
  _id: string;
  name: string;
  lastName: string;
  username: string;
  role: UserRole;
  company?: {
    _id: string;
    name: string;
    nit: string;
    email: string;
    phone: string;
    planId: string;
    plan?: {
      _id: string;
      name: string;
      description?: string;
      monthlyCredits: number;
    };
  };
  companyUserData?: {
    companyId: string;
    position: string;
    phone: string;
    personalEmail: string;
    companyArea: Pick<CompanyArea, "_id" | "name">;
    companyRole: Pick<CompanyRole, "_id" | "position" | "permissions">;
    note?: string;
    docNumber: string | number;
    docType: DocType;
  };
  createdAt: Date;
  updatedAt: Date;
}
