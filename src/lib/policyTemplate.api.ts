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