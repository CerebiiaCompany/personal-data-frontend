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

export async function fetchCollectFormResponses({
  companyId,
  id,
  responseId,
  pageSize,
}: QueryParams): Promise<APIResponse> {
  let endpoint = `/companies/${companyId}/collectForms/${id}/responses`;

  if (responseId) {
    endpoint += `/${responseId}`;
  }

  if (pageSize != undefined) {
    
    endpoint += `?pageSize=${pageSize}`;
  }

  console.log(endpoint)

  const res = await customFetch(endpoint);

  return res;
}

export async function fetchAllCollectFormResponses({
  companyId,
  id,
}: QueryParams): Promise<APIResponse> {
  const res = await customFetch(
    `/companies/${companyId}/collectForms/${id}/responses/all`
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
