import { APIResponse, QueryParams } from "@/types/api.types";
import { CreateCompanyRole } from "@/types/companyRole.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchCompanyRoles(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/companies/${params.companyId}/roles`;

  if (params.id) endpoint += `/${params.id}`;
  const res = await customFetch(endpoint, {}, params);

  return res;
}

export async function createCompanyRole(
  companyId: string,
  data: CreateCompanyRole
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/roles`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
}

export async function updateCompanyRole(
  companyId: string,
  roleId: string,
  data: UpdatePartial<CreateCompanyRole>
) {
  const res = await customFetch(`/companies/${companyId}/roles/${roleId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return res;
}

export async function deleteCompanyRole(
  companyId: string,
  id: string
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/roles/${id}`, {
    method: "DELETE",
  });

  return res;
}
