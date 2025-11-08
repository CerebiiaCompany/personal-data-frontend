import { APIResponse, QueryParams } from "@/types/api.types";
import { CreateCustomFile } from "@/types/file.types";
import { CreatePolicyTemplate } from "@/types/policyTemplate.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchCompanyFiles(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/companies/${params.companyId}/files`;

  if (params.id) endpoint += `/${params.id}`;

  const res = await customFetch(endpoint, {}, params);

  return res;
}

export async function createCompanyFile(
  companyId: string,
  data: CreateCustomFile
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/files`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
}
