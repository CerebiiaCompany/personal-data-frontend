import { APIResponse } from "@/types/api.types";
import {
  ArcoAdminRequestDetail,
  ArcoAdminRequestListItem,
  ArcoAccessReportDraftResponse,
  ArcoOfficersResult,
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

export function fetchArcoSummary(companyId: string) {
  return customFetch<ArcoSummary>(`${arcoCompanyPath(companyId)}/summary`);
}

export function fetchArcoRequests(params: ArcoRequestsQuery) {
  const { companyId, ...query } = params;
  return customFetch<ArcoAdminRequestListItem[]>(
    `${arcoCompanyPath(companyId)}/requests`,
    {},
    query
  );
}

export function fetchArcoRequestDetail(companyId: string, requestId: string) {
  return customFetch<ArcoAdminRequestDetail>(
    `${arcoCompanyPath(companyId)}/requests/${requestId}`
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
  return customFetch<{ status: ArcoRequestStatus }>(
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
