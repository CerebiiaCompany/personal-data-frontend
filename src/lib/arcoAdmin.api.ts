import { APIResponse } from "@/types/api.types";
import {
  ArcoAdminRequestDetail,
  ArcoAdminRequestListItem,
  ArcoAccessReportDraftResponse,
  ArcoAuditQuery,
  ArcoCompanyAuditEntry,
  ArcoMyAccess,
  ArcoOfficersResult,
  ArcoRequestAuditResponse,
  ArcoRequestsQuery,
  ArcoRespondPayload,
  ArcoSummary,
  ArcoUpdateOfficersPayload,
  ArcoUpdateStatusPayload,
} from "@/types/arco.admin.types";
import { ArcoRequestStatus } from "@/types/arco.types";
import { customFetch } from "@/utils/customFetch";

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
