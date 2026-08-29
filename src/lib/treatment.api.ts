import { APIResponse } from "@/types/api.types";
import {
  ArchiveTreatmentPayload,
  CreateTreatmentPayload,
  LegalBasis,
  Treatment,
  TreatmentInput,
  TreatmentPurpose,
  TreatmentStatus,
  TreatmentSystem,
  TreatmentSystemInput,
  TreatmentVersionEntry,
} from "@/types/treatment.types";
import { customFetch } from "@/utils/customFetch";
import { API_BASE_URL } from "@/utils/env.utils";
import { filenameFromContentDisposition, triggerBrowserDownload } from "@/utils/downloadFile";

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
  /** Filtros del listado (item B7). */
  status?: TreatmentStatus;
  legalBasis?: LegalBasis;
  containsSensitiveData?: boolean;
  /** Substring case-insensitive sobre el nombre del tratamiento. */
  search?: string;
}

// Query string armada a mano (no vía el 3er argumento QueryParams de
// customFetch): QueryParams es un tipo compartido entre todo el API layer y
// ya reserva `status` para otro significado (status HTTP), así que
// legalBasis/status/containsSensitiveData de este endpoint se arman aparte —
// mismo patrón que arcoAdmin.api.ts usa para sus propios filtros.
function buildTreatmentsQuery(params: FetchTreatmentsParams): string {
  const parts: string[] = [];
  if (params.status) parts.push(`status=${encodeURIComponent(params.status)}`);
  if (params.legalBasis) parts.push(`legalBasis=${encodeURIComponent(params.legalBasis)}`);
  if (params.containsSensitiveData !== undefined) {
    parts.push(`containsSensitiveData=${params.containsSensitiveData}`);
  }
  if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
  if (params.page !== undefined) parts.push(`page=${params.page}`);
  if (params.pageSize !== undefined) parts.push(`pageSize=${params.pageSize}`);
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

export async function fetchTreatments(
  companyId: string,
  params: FetchTreatmentsParams = {}
): Promise<APIResponse<Treatment[]>> {
  return customFetch<Treatment[]>(
    `/companies/${companyId}/treatments${buildTreatmentsQuery(params)}`
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

/**
 * DRAFT → PENDING_APPROVAL → ACTIVE (item B, RF-03). Sin body — el mismo
 * endpoint hace doble función según el status actual del tratamiento: desde
 * DRAFT solicita la activación (requiere DPO designado); desde
 * PENDING_APPROVAL, aprueba (solo puede llamarlo el DPO designado). Puede
 * devolver 400 con `missingFields` o `missingDataOfficer`, o 403 si quien
 * llama no es el DPO.
 */
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
  companyId: string,
  // Item CHK-011/017: country opcional — si se omite, el backend lo deriva
  // de company.jurisdictionCountry (mismo criterio que
  // jurisdiction.controller.ts). Se pasa explícito desde TreatmentForm.tsx
  // para no depender de una consulta extra en el servidor.
  options: { includeInactive?: boolean; country?: string } = {}
): Promise<APIResponse<TreatmentPurpose[]>> {
  const params = new URLSearchParams();
  if (options.includeInactive) params.set("includeInactive", "true");
  if (options.country) params.set("country", options.country);
  const qs = params.toString();
  return customFetch<TreatmentPurpose[]>(
    `/companies/${companyId}/treatment-purposes${qs ? `?${qs}` : ""}`
  );
}

// ABM de finalidades scoped a empresa (item B26). Las globales (companyId:
// null) no se pueden crear/editar/desactivar desde acá — ver
// treatmentPurpose.controller.ts, queda para otra tanda.
export async function createTreatmentPurpose(
  companyId: string,
  data: { code: string; label: string }
): Promise<APIResponse<TreatmentPurpose>> {
  return customFetch<TreatmentPurpose>(
    `/companies/${companyId}/treatment-purposes`,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function updateTreatmentPurpose(
  companyId: string,
  purposeId: string,
  data: { label?: string; isActive?: boolean }
): Promise<APIResponse<TreatmentPurpose>> {
  return customFetch<TreatmentPurpose>(
    `/companies/${companyId}/treatment-purposes/${purposeId}`,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export async function deleteTreatmentPurpose(
  companyId: string,
  purposeId: string
): Promise<APIResponse<TreatmentPurpose>> {
  return customFetch<TreatmentPurpose>(
    `/companies/${companyId}/treatment-purposes/${purposeId}`,
    { method: "DELETE" }
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

// --- Inventario de Sistemas (item A, "Paso 3.5" del formulario) ---

export async function fetchTreatmentSystems(
  companyId: string,
  treatmentId: string
): Promise<APIResponse<TreatmentSystem[]>> {
  return customFetch<TreatmentSystem[]>(
    `/companies/${companyId}/treatments/${treatmentId}/systems`
  );
}

export async function createTreatmentSystem(
  companyId: string,
  treatmentId: string,
  payload: TreatmentSystemInput
): Promise<APIResponse<TreatmentSystem>> {
  return customFetch<TreatmentSystem>(
    `/companies/${companyId}/treatments/${treatmentId}/systems`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function deleteTreatmentSystem(
  companyId: string,
  treatmentId: string,
  systemId: string
): Promise<APIResponse<TreatmentSystem>> {
  return customFetch<TreatmentSystem>(
    `/companies/${companyId}/treatments/${treatmentId}/systems/${systemId}`,
    { method: "DELETE" }
  );
}

/**
 * Item RAT-009 (Art. 14) — exporta TODOS los tratamientos ACTIVE de la
 * empresa a PDF o XLSX. Mismo patrón fetch+blob que
 * downloadGeneratedPolicyPreviewPdf/downloadArcoPortabilityExport.
 */
export async function downloadTreatmentsExport(
  companyId: string,
  format: "pdf" | "xlsx"
): Promise<APIResponse<void>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/companies/${companyId}/treatments/export?format=${format}`,
      { method: "GET", credentials: "include", cache: "no-store" }
    );

    if (!response.ok) {
      let body: APIResponse<void> | null = null;
      try {
        body = (await response.json()) as APIResponse<void>;
      } catch {}
      return {
        error: body?.error
          ? { ...body.error, status: response.status }
          : {
              code: "http/unknown-error",
              message: "No se pudo exportar el RAT.",
              status: response.status,
            },
      };
    }

    const blob = await response.blob();
    const filename =
      filenameFromContentDisposition(response.headers.get("content-disposition")) ??
      `rat-export.${format}`;
    triggerBrowserDownload(blob, filename);
    return {};
  } catch (error) {
    const message = (error as Error).message;
    if (message.includes("Failed to fetch")) {
      return {
        error: { code: "http/network-error", message: "Error de conexión. Verifica tu red e intenta de nuevo." },
      };
    }
    return {
      error: { code: "http/unknown-error", message: "Error inesperado al exportar el RAT." },
    };
  }
}
