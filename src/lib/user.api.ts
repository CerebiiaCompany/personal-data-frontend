import { APIResponse, QueryParams } from "@/types/api.types";
import { CreateUser, UpdateUser } from "@/types/user.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchCompanyUsers({
  companyId,
  id,
}: QueryParams): Promise<APIResponse> {
  let endpoint = `/companies/${companyId}/users`;

  if (id) endpoint += `/${id}`;
  const res = await customFetch(endpoint);

  return res;
}

export async function createCompanyUser(
  companyId: string,
  data: CreateUser
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/users`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
}

export async function updateCompanyUser(
  companyId: string,
  userId: string,
  data: UpdateUser
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return res;
}

export async function deleteCompanyUser(
  companyId: string,
  userId: string
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/users/${userId}`, {
    method: "DELETE",
  });

  return res;
}
