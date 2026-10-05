import { CustomSelectOption } from "./forms.types";
import { Treatment } from "./treatment.types";

/**
 * Contrato del módulo Inventario de Sistemas (Documento 5).
 *
 * Alineado 1:1 con `prisma/schema.prisma` (modelos SystemInventory,
 * SystemCatalog, SystemTreatment) y `systemInventory.controller.ts` /
 * `systemInventory.service.ts` del backend. Distinto de `TreatmentSystem`
 * (ver treatment.types.ts): ese es un listado simple por tratamiento
 * ("Paso 3.5" del formulario); este es el inventario a nivel de empresa,
 * con catálogo, validación de país ISO y riskLevel/dpaStatus derivados.
 */

export type SystemInventoryDeployment = "LOCAL" | "CLOUD";
export type SystemInventoryRiskLevel = "NORMAL" | "ALTO";
export type SystemInventoryDpaStatus = "NOT_REQUIRED" | "PENDING" | "SIGNED";
export type SystemTreatmentRelationshipType = "ALMACENA" | "PROCESA" | "ORIGEN";
export type SystemCatalogScope = "GLOBAL" | "CL";

export interface SystemTreatmentLink {
  id: string;
  systemId: string;
  treatmentId: string;
  relationshipType: SystemTreatmentRelationshipType;
  createdAt: string;
  /** Solo viene incluido en el detalle (GET .../:systemId). */
  treatment?: Treatment;
}

export interface SystemInventory {
  id: string;
  companyId: string;
  name: string;
  category: string;
  provider: string | null;
  deployment: SystemInventoryDeployment;
  country: string;
  hasExternalAccess: boolean;
  // Derivados por SystemInventoryService — nunca de escritura libre del
  // cliente (ver comentario del servicio backend).
  riskLevel: SystemInventoryRiskLevel;
  dpaStatus: SystemInventoryDpaStatus;
  catalogId: string | null;
  createdAt: string;
  updatedAt: string;
  /** Solo viene incluido en el detalle (GET .../:systemId). */
  treatments?: SystemTreatmentLink[];
}

export interface SystemCatalogEntry {
  id: string;
  name: string;
  category: string;
  defaultProvider: string | null;
  defaultDeployment: SystemInventoryDeployment | null;
  defaultCountry: string | null;
  scope: SystemCatalogScope;
  companyId: string | null;
  active: boolean;
}

export interface IsoCountry {
  code: string;
  name: string;
}

/**
 * Payload de creación. `catalogId` es solo trazabilidad (ver comentario del
 * campo en el schema): nunca se re-valida contra los demás campos.
 */
export interface CreateSystemInventoryPayload {
  name: string;
  category: string;
  provider?: string | null;
  deployment: SystemInventoryDeployment;
  country: string;
  hasExternalAccess: boolean;
  catalogId?: string | null;
  links?: { treatmentId: string; relationshipType: SystemTreatmentRelationshipType }[];
}

export type UpdateSystemInventoryPayload = Partial<
  Omit<CreateSystemInventoryPayload, "links">
>;

export interface LinkSystemTreatmentPayload {
  treatmentId: string;
  relationshipType: SystemTreatmentRelationshipType;
}

// --- Opciones y etiquetas para los formularios ---

export const SYSTEM_INVENTORY_DEPLOYMENT_OPTIONS: CustomSelectOption<SystemInventoryDeployment>[] = [
  { value: "LOCAL", title: "Local / on-premise" },
  { value: "CLOUD", title: "Nube" },
];

export const SYSTEM_INVENTORY_DEPLOYMENT_LABELS: Record<SystemInventoryDeployment, string> = {
  LOCAL: "Local / on-premise",
  CLOUD: "Nube",
};

export const SYSTEM_INVENTORY_RISK_LEVEL_LABELS: Record<SystemInventoryRiskLevel, string> = {
  NORMAL: "Normal",
  ALTO: "Alto",
};

export const SYSTEM_INVENTORY_DPA_STATUS_LABELS: Record<SystemInventoryDpaStatus, string> = {
  NOT_REQUIRED: "No requiere DPA",
  PENDING: "DPA pendiente",
  SIGNED: "DPA firmado",
};

export const SYSTEM_TREATMENT_RELATIONSHIP_OPTIONS: CustomSelectOption<SystemTreatmentRelationshipType>[] = [
  { value: "ALMACENA", title: "Almacena los datos" },
  { value: "PROCESA", title: "Procesa los datos" },
  { value: "ORIGEN", title: "Es el origen de los datos" },
];

export const SYSTEM_TREATMENT_RELATIONSHIP_LABELS: Record<SystemTreatmentRelationshipType, string> = {
  ALMACENA: "Almacena",
  PROCESA: "Procesa",
  ORIGEN: "Origen",
};

// Complemento — Catálogo de Sistemas Predefinidos (Sección 4): lista
// propuesta de categorías, consistente con las que usa el catálogo semilla
// (ver ensureSystemCatalogSeeded en config/db.ts del backend). `category`
// sigue siendo string libre en el schema — este selector solo estandariza
// la UI; ver CATEGORY_OTHER_FALLBACK en SystemInventoryForm.tsx para el caso
// de una fila existente con un valor que no está en esta lista.
export const SYSTEM_INVENTORY_CATEGORIES = [
  "Ofimática y Nube",
  "Contabilidad y Facturación",
  "Punto de Venta y Pagos",
  "CRM y Ventas",
  "Recursos Humanos y Remuneraciones",
  "Comunicación y Mensajería",
  "Marketing",
  "Cumplimiento y Protección de Datos",
  "Sistema Propio / a Medida",
  "Otro",
] as const;

export const SYSTEM_INVENTORY_CATEGORY_OPTIONS: CustomSelectOption<string>[] = SYSTEM_INVENTORY_CATEGORIES.map(
  (value) => ({ value, title: value })
);
