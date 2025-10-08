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
  responseId: string
) {
  const res = await customFetch(
    `/companies/${companyId}/collectForms/${formId}/responses/${responseId}`,
    {
      method: "DELETE",
    }
  );

  return res;
}
