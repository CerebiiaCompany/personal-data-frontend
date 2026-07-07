import { APIResponse } from "@/types/api.types";
import {
  ArcoAdminRequestDetail,
  ArcoAdminRequestListItem,
  ArcoAccessReportDraftResponse,
  ArcoAuditQuery,
  ArcoCompanyAuditEntry,
  ArcoExtendDeadlinePayload,
  ArcoExtendDeadlineResult,
  ArcoMyAccess,
  ArcoOfficersResult,
  ArcoPortabilityExportPreview,
  ArcoRequestAuditResponse,
  ArcoRequestsQuery,
  ArcoRespondPayload,
  ArcoSummary,
  ArcoUpdateOfficersPayload,
  ArcoUpdateStatusPayload,
} from "@/types/arco.admin.types";
import { ArcoRequestStatus, PortabilityExportFormat } from "@/types/arco.types";
import { customFetch } from "@/utils/customFetch";
import {
  filenameFromContentDisposition,
  triggerBrowserDownload,
} from "@/utils/downloadFile";
import { API_BASE_URL } from "@/utils/env.utils";

function arcoCompanyPath(companyId: string) {
  return `/companies/${companyId}/arco`;
}

function buildArcoRequestsQuery(
  params: Omit<ArcoRequestsQuery, "companyId">
): string {
  const parts: string[] = [];
  if (params.status) {
    parts.push(`status=${encodeURIComponent(params.status)}`);
  }
  if (params.requestType) {
    parts.push(`requestType=${encodeURIComponent(params.requestType)}`);
  }
  if (params.docNumber) {
    parts.push(`docNumber=${encodeURIComponent(params.docNumber)}`);
  }
  if (params.assignedToId) {
    parts.push(`assignedToId=${encodeURIComponent(params.assignedToId)}`);
  }
  if (params.overdue === true) {
    parts.push("overdue=true");
  }
  if (params.dateFrom) {
    parts.push(`dateFrom=${encodeURIComponent(params.dateFrom)}`);
  }
  if (params.dateTo) {
    parts.push(`dateTo=${encodeURIComponent(params.dateTo)}`);
  }
  if (params.page !== undefined) {
    parts.push(`page=${encodeURIComponent(String(params.page))}`);
  }
  if (params.pageSize !== undefined) {
    parts.push(`pageSize=${encodeURIComponent(String(params.pageSize))}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

function buildArcoAuditQuery(params: Omit<ArcoAuditQuery, "companyId">): string {
  const parts: string[] = [];
  if (params.eventType) {
    parts.push(`eventType=${encodeURIComponent(params.eventType)}`);
  }
  if (params.requestType) {
    parts.push(`requestType=${encodeURIComponent(params.requestType)}`);
  }
  if (params.dateFrom) {
    parts.push(`dateFrom=${encodeURIComponent(params.dateFrom)}`);
  }
  if (params.dateTo) {
    parts.push(`dateTo=${encodeURIComponent(params.dateTo)}`);
  }
  if (params.page !== undefined) {
    parts.push(`page=${encodeURIComponent(String(params.page))}`);
  }
  if (params.pageSize !== undefined) {
    parts.push(`pageSize=${encodeURIComponent(String(params.pageSize))}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

export function fetchArcoMyAccess(companyId: string) {
  return customFetch<ArcoMyAccess>(`${arcoCompanyPath(companyId)}/my-access`);
}

export function fetchArcoSummary(companyId: string) {
  return customFetch<ArcoSummary>(`${arcoCompanyPath(companyId)}/summary`);
}

export function fetchArcoRequests(params: ArcoRequestsQuery) {
  const { companyId, ...query } = params;
  return customFetch<ArcoAdminRequestListItem[]>(
    `${arcoCompanyPath(companyId)}/requests${buildArcoRequestsQuery(query)}`
  );
}

export function fetchArcoRequestDetail(companyId: string, requestId: string) {
  return customFetch<ArcoAdminRequestDetail>(
    `${arcoCompanyPath(companyId)}/requests/${requestId}`
  );
}

export function fetchArcoRequestAudit(companyId: string, requestId: string) {
  return customFetch<ArcoRequestAuditResponse>(
    `${arcoCompanyPath(companyId)}/requests/${requestId}/audit`
  );
}

export function fetchArcoAudit(params: ArcoAuditQuery) {
  const { companyId, ...query } = params;
  return customFetch<ArcoCompanyAuditEntry[]>(
    `${arcoCompanyPath(companyId)}/audit${buildArcoAuditQuery(query)}`
  );
}

export function fetchArcoAccessReport(companyId: string, requestId: string) {
  return customFetch<ArcoAccessReportDraftResponse>(
    `${arcoCompanyPath(companyId)}/requests/${requestId}/access-report`
  );
}

export function patchArcoRequestStatus(
  companyId: string,
  requestId: string,
  payload: ArcoUpdateStatusPayload
) {
  return customFetch<{ status: ArcoRequestStatus; assignedToId?: string }>(
    `${arcoCompanyPath(companyId)}/requests/${requestId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export function respondArcoRequest(
  companyId: string,
  requestId: string,
  payload: ArcoRespondPayload
) {
  return customFetch<{
    requestId: string;
    status: ArcoRequestStatus;
    resolvedAt: string;
    response: ArcoAdminRequestDetail["response"];
  }>(`${arcoCompanyPath(companyId)}/requests/${requestId}/respond`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Extiende el plazo legal de una solicitud (solo PENDING/IN_PROGRESS).
 * Requiere permiso arcoRequests.respond + ser oficial designado o admin.
 */
export function extendArcoRequestDeadline(
  companyId: string,
  requestId: string,
  payload: ArcoExtendDeadlinePayload
) {
  return customFetch<ArcoExtendDeadlineResult>(
    `${arcoCompanyPath(companyId)}/requests/${requestId}/extend-deadline`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Preview del export de portabilidad para el oficial (sin `format`, JSON).
 *
 * - Si la solicitud aún no fue resuelta, el backend genera el export al vuelo
 *   (`alreadyResolved: false`) sin persistirlo.
 * - Si ya fue resuelta, devuelve el snapshot guardado (`alreadyResolved: true`).
 */
export function fetchArcoPortabilityExportPreview(
  companyId: string,
  requestId: string
) {
  return customFetch<ArcoPortabilityExportPreview>(
    `${arcoCompanyPath(companyId)}/requests/${requestId}/portability-export`
  );
}

/**
 * Descarga el export de portabilidad para el oficial como archivo (CSV o JSON).
 * Antes de resolver descarga datos generados al vuelo; después de resolver, el
 * snapshot guardado. Devuelve `{}` en éxito o `{ error }`.
 */
export async function downloadArcoPortabilityExport(
  companyId: string,
  requestId: string,
  format: PortabilityExportFormat = "csv"
): Promise<APIResponse<void>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${arcoCompanyPath(companyId)}/requests/${requestId}/portability-export?format=${format}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
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
              message: "No se pudo descargar el export de portabilidad.",
              status: response.status,
            },
      };
    }

    const blob = await response.blob();
    const filename =
      filenameFromContentDisposition(
        response.headers.get("content-disposition")
      ) ?? `portabilidad-${requestId}.${format}`;
    triggerBrowserDownload(blob, filename);
    return {};
  } catch (error) {
    const message = (error as Error).message;
    if (message.includes("Failed to fetch")) {
      return {
        error: {
          code: "http/network-error",
          message: "Error de conexión. Verifica tu red e intenta de nuevo.",
        },
      };
    }
    return {
      error: {
        code: "http/unknown-error",
        message: "Error inesperado al descargar el export de portabilidad.",
      },
    };
  }
}

export function fetchArcoOfficers(companyId: string) {
  return customFetch<ArcoOfficersResult>(`${arcoCompanyPath(companyId)}/officers`);
}

export function updateArcoOfficers(
  companyId: string,
  payload: ArcoUpdateOfficersPayload
) {
  return customFetch<{ updated: boolean; officerCount: number }>(
    `${arcoCompanyPath(companyId)}/officers`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}
