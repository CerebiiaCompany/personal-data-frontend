import { APIResponse } from "@/types/api.types";
import {
  ArchiveTreatmentPayload,
  CreateTreatmentPayload,
  Treatment,
  TreatmentInput,
  TreatmentPurpose,
  TreatmentVersionEntry,
} from "@/types/treatment.types";
import { customFetch } from "@/utils/customFetch";

/**
 * Capa de acceso al módulo RAT (Registro de Actividades de Tratamiento).
 *
 * Rutas verificadas contra el backend:
 *   /api/v1/companies/:companyId/treatments               (GET lista / POST)
 *   /api/v1/companies/:companyId/treatments/:id           (GET detalle / PATCH)
 *   /api/v1/companies/:companyId/treatments/:id/activate  (PATCH)
 *   /api/v1/companies/:companyId/treatments/:id/archive   (PATCH)
 *   /api/v1/companies/:companyId/treatment-purposes       (GET catálogo)
 *
 * `customFetch` ya antepone /api/v1, maneja 401/sesión y errores de red.
 */

interface FetchTreatmentsParams {
  page?: number;
  pageSize?: number;
}

export async function fetchTreatments(
  companyId: string,
  params: FetchTreatmentsParams = {}
): Promise<APIResponse<Treatment[]>> {
  return customFetch<Treatment[]>(
    `/companies/${companyId}/treatments`,
    {},
    { page: params.page, pageSize: params.pageSize }
  );
}

export async function fetchTreatment(
  companyId: string,
  treatmentId: string
): Promise<APIResponse<Treatment>> {
  return customFetch<Treatment>(
    `/companies/${companyId}/treatments/${treatmentId}`
  );
}

export async function createTreatment(
  companyId: string,
  payload: CreateTreatmentPayload
): Promise<APIResponse<Treatment>> {
  return customFetch<Treatment>(`/companies/${companyId}/treatments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTreatment(
  companyId: string,
  treatmentId: string,
  payload: TreatmentInput
): Promise<APIResponse<Treatment>> {
  return customFetch<Treatment>(
    `/companies/${companyId}/treatments/${treatmentId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

/** DRAFT → ACTIVE. Sin body. Puede devolver 400 con `missingFields`. */
export async function activateTreatment(
  companyId: string,
  treatmentId: string
): Promise<APIResponse<Treatment>> {
  return customFetch<Treatment>(
    `/companies/${companyId}/treatments/${treatmentId}/activate`,
    { method: "PATCH" }
  );
}

/** Archiva (irreversible). Requiere `archivedReason`. */
export async function archiveTreatment(
  companyId: string,
  treatmentId: string,
  payload: ArchiveTreatmentPayload
): Promise<APIResponse<Treatment>> {
  return customFetch<Treatment>(
    `/companies/${companyId}/treatments/${treatmentId}/archive`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchTreatmentPurposes(
  companyId: string
): Promise<APIResponse<TreatmentPurpose[]>> {
  return customFetch<TreatmentPurpose[]>(
    `/companies/${companyId}/treatment-purposes`
  );
}

/** Historial de versiones (diff before/after ya calculado, más reciente primero). */
export async function fetchTreatmentVersions(
  companyId: string,
  treatmentId: string
): Promise<APIResponse<TreatmentVersionEntry[]>> {
  return customFetch<TreatmentVersionEntry[]>(
    `/companies/${companyId}/treatments/${treatmentId}/versions`
  );
}
