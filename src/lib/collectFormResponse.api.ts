import { APIResponse, QueryParams } from "@/types/api.types";
import { CreateCollectFormResponse } from "@/types/collectFormResponse.types";
import { customFetch } from "@/utils/customFetch";

export async function registerCollectFormResponse(
  formId: string,
  data: CreateCollectFormResponse
): Promise<APIResponse> {
  let res = await customFetch(`/public/collectForms/${formId}/responses`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
}

export async function registerConsentCampaignResponse(
  formId: string,
  cct: string,
  data: {
    dataProcessing: boolean;
    data: Record<string, any>;
    user: {
      docType: string;
      docNumber: number;
      name: string;
      lastName: string;
      age: number;
      gender: string;
      email: string;
      phone: string;
    };
  }
): Promise<APIResponse> {
  return customFetch(
    `/public/collectForms/${formId}/responses?cct=${encodeURIComponent(cct)}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function fetchCollectFormResponses(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/companies/${params.companyId}/collectForms/${params.id}/responses`;

  if (params.responseId) {
    endpoint += `/${params.responseId}`;
  }

  const res = await customFetch(endpoint, {}, params);

  return res;
}

export async function fetchAllCollectFormResponses(
  params: QueryParams
): Promise<APIResponse> {
  const res = await customFetch(
    `/companies/${params.companyId}/collectForms/${params.id}/responses/all`,
    {},
    params
  );

  return res;
}

export async function deleteCollectFormResponse(
  companyId: string,
  formId: string,
  responseId: string,
  reason?: string
) {
  const res = await customFetch(
    `/companies/${companyId}/collectForms/${formId}/responses/${responseId}`,
    {
      method: "DELETE",
      body: reason ? JSON.stringify({ reason }) : undefined,
    }
  );

  return res;
}

export async function restoreCollectFormResponse(
  companyId: string,
  collectFormId: string,
  responseId: string
): Promise<APIResponse<{ message: string }>> {
  return customFetch<{ message: string }>(
    `/companies/${companyId}/collectForms/${collectFormId}/responses/${responseId}/restore`,
    { method: "PATCH" }
  );
}

export async function sendConsentInvitation(
  companyId: string,
  collectFormId: string,
  data: {
    channel: "SMS" | "EMAIL";
    docType: string;
    docNumber: number;
    phone?: string;
    email?: string;
    link: string;
    message?: string;
  }
): Promise<APIResponse> {
  const res = await customFetch(
    `/companies/${companyId}/collectForms/${collectFormId}/consent-invitations`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  return res;
}
