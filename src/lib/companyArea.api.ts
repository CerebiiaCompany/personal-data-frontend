import { APIResponse, QueryParams } from "@/types/api.types";
import { CreateCompanyArea } from "@/types/companyArea.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchCompanyAreas(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/companies/${params.companyId}/areas`;

  if (params.id) endpoint += `/${params.id}`;

  const res = await customFetch(endpoint, {}, params);

  return res;
}

export async function fetchCompanyAreaUsers(
  params: QueryParams
): Promise<APIResponse> {
  const res = await customFetch(
    `/companies/${params.companyId}/areas/${params.areaId}/users`,
    {},
    params
  );

  return res;
}

export async function createCompanyArea(
  companyId: string,
  data: CreateCompanyArea
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/areas`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
}

export async function updateCompanyArea(
  companyId: string,
  areaId: string,
  data: UpdatePartial<CreateCompanyArea>
) {
  const res = await customFetch(`/companies/${companyId}/areas/${areaId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return res;
}

export async function deleteCompanyArea(
  companyId: string,
  id: string
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/areas/${id}`, {
    method: "DELETE",
  });

  return res;
}
