import { APIResponse } from "@/types/api.types";
import {
  CreateSystemInventoryPayload,
  IsoCountry,
  LinkSystemTreatmentPayload,
  SystemCatalogEntry,
  SystemInventory,
  SystemInventoryDeployment,
  SystemInventoryDpaStatus,
  SystemInventoryRiskLevel,
  SystemTreatmentLink,
  UpdateSystemInventoryPayload,
} from "@/types/systemInventory.types";
import { customFetch } from "@/utils/customFetch";

/**
 * Capa de acceso al módulo Inventario de Sistemas (Documento 5).
 *
 * Rutas verificadas contra el backend (systemInventory.routes.ts):
 *   /api/v1/companies/:companyId/systems-inventory            (GET lista / POST)
 *   /api/v1/companies/:companyId/systems-inventory/:id        (GET detalle / PUT / DELETE)
 *   /api/v1/companies/:companyId/systems-inventory/catalog    (GET)
 *   /api/v1/companies/:companyId/systems-inventory/countries  (GET)
 *   /api/v1/companies/:companyId/systems-inventory/:id/link              (POST)
 *   /api/v1/companies/:companyId/systems-inventory/:id/link/:treatmentId (DELETE)
 */

interface FetchSystemsInventoryParams {
  page?: number;
  pageSize?: number;
  category?: string;
  country?: string;
  deployment?: SystemInventoryDeployment;
  riskLevel?: SystemInventoryRiskLevel;
  dpaStatus?: SystemInventoryDpaStatus;
  hasExternalAccess?: boolean;
  search?: string;
}

// Query string armada a mano, mismo criterio que buildTreatmentsQuery en
// treatment.api.ts (customFetch reserva `status` con otro significado).
function buildSystemsInventoryQuery(params: FetchSystemsInventoryParams): string {
  const parts: string[] = [];
  if (params.category) parts.push(`category=${encodeURIComponent(params.category)}`);
  if (params.country) parts.push(`country=${encodeURIComponent(params.country)}`);
  if (params.deployment) parts.push(`deployment=${encodeURIComponent(params.deployment)}`);
  if (params.riskLevel) parts.push(`riskLevel=${encodeURIComponent(params.riskLevel)}`);
  if (params.dpaStatus) parts.push(`dpaStatus=${encodeURIComponent(params.dpaStatus)}`);
  if (params.hasExternalAccess !== undefined) {
    parts.push(`hasExternalAccess=${params.hasExternalAccess}`);
  }
  if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
  if (params.page !== undefined) parts.push(`page=${params.page}`);
  if (params.pageSize !== undefined) parts.push(`pageSize=${params.pageSize}`);
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

export async function fetchSystemsInventory(
  companyId: string,
  params: FetchSystemsInventoryParams = {}
): Promise<APIResponse<SystemInventory[]>> {
  return customFetch<SystemInventory[]>(
    `/companies/${companyId}/systems-inventory${buildSystemsInventoryQuery(params)}`
  );
}

export async function fetchSystemInventory(
  companyId: string,
  systemId: string
): Promise<APIResponse<SystemInventory>> {
  return customFetch<SystemInventory>(
    `/companies/${companyId}/systems-inventory/${systemId}`
  );
}

export async function createSystemInventory(
  companyId: string,
  payload: CreateSystemInventoryPayload
): Promise<APIResponse<SystemInventory>> {
  return customFetch<SystemInventory>(`/companies/${companyId}/systems-inventory`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSystemInventory(
  companyId: string,
  systemId: string,
  payload: UpdateSystemInventoryPayload
): Promise<APIResponse<SystemInventory>> {
  return customFetch<SystemInventory>(
    `/companies/${companyId}/systems-inventory/${systemId}`,
    { method: "PUT", body: JSON.stringify(payload) }
  );
}

export async function markSystemDpaSigned(
  companyId: string,
  systemId: string
): Promise<APIResponse<SystemInventory>> {
  return customFetch<SystemInventory>(
    `/companies/${companyId}/systems-inventory/${systemId}/dpa-signed`,
    { method: "POST" }
  );
}

export async function revertSystemDpaToPending(
  companyId: string,
  systemId: string
): Promise<APIResponse<SystemInventory>> {
  return customFetch<SystemInventory>(
    `/companies/${companyId}/systems-inventory/${systemId}/dpa-pending`,
    { method: "POST" }
  );
}

/** Soft delete. El backend devuelve 400 si el sistema tiene tratamientos vinculados. */
export async function deleteSystemInventory(
  companyId: string,
  systemId: string
): Promise<APIResponse<{ deleted: boolean }>> {
  return customFetch<{ deleted: boolean }>(
    `/companies/${companyId}/systems-inventory/${systemId}`,
    { method: "DELETE" }
  );
}

export async function linkSystemTreatment(
  companyId: string,
  systemId: string,
  payload: LinkSystemTreatmentPayload
): Promise<APIResponse<SystemInventory & { treatments: SystemTreatmentLink[] }>> {
  return customFetch(`/companies/${companyId}/systems-inventory/${systemId}/link`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function unlinkSystemTreatment(
  companyId: string,
  systemId: string,
  treatmentId: string
): Promise<APIResponse<SystemInventory & { treatments: SystemTreatmentLink[] }>> {
  return customFetch(
    `/companies/${companyId}/systems-inventory/${systemId}/link/${treatmentId}`,
    { method: "DELETE" }
  );
}

// Antes de "/:systemId" en el router del backend — ver comentario ahí.
export async function fetchSystemCatalog(
  companyId: string
): Promise<APIResponse<SystemCatalogEntry[]>> {
  return customFetch<SystemCatalogEntry[]>(
    `/companies/${companyId}/systems-inventory/catalog`
  );
}

export async function fetchSystemInventoryCountries(
  companyId: string
): Promise<APIResponse<IsoCountry[]>> {
  return customFetch<IsoCountry[]>(
    `/companies/${companyId}/systems-inventory/countries`
  );
}
