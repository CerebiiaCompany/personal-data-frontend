import { APIResponse, QueryParams } from "@/types/api.types";
import { CreatePolicyTemplate } from "@/types/policyTemplate.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchCompanyPolicyTemplates(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/companies/${params.companyId}/policyTemplates`;

  if (params.id) endpoint += `/${params.id}`;

  const res = await customFetch(endpoint, {}, params);

  return res;
}

export async function createCompanyPolicyTemplate(
  companyId: string,
  data: CreatePolicyTemplate
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/policyTemplates`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
}

export async function deletePolicyTemplate(
  companyId: string,
  policyId: string
): Promise<APIResponse> {
  const res = await customFetch(
    `/companies/${companyId}/policyTemplates/${policyId}`,
    {
      method: "DELETE",
    }
  );

  return res;
}

export interface PolicyTemplateFileUrlResponse {
  url: string;
  expiresIn: number;
  file: {
    id: string;
    originalName: string;
    contentType: string;
    size: number;
  };
  policyTemplate: {
    id: string;
    name: string;
  };
}

/**
 * Obtiene una presigned URL para ver el archivo de una plantilla de política
 */
export async function getPolicyTemplateFileUrl(
  companyId: string,
  policyTemplateId: string,
  expiresIn?: number
): Promise<APIResponse<PolicyTemplateFileUrlResponse>> {
  const queryParams = expiresIn ? { expiresIn: expiresIn.toString() } : undefined;
  const res = await customFetch<PolicyTemplateFileUrlResponse>(
    `/companies/${companyId}/policyTemplates/${policyTemplateId}/file/url`,
    {
      method: "GET",
    },
    queryParams
  );

  return res;
}