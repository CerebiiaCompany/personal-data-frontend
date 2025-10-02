import { APIResponse, QueryParams } from "@/types/api.types";
import { CreateCompanyArea } from "@/types/companyArea.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchCompanyAreas({
  companyId,
  id,
}: QueryParams): Promise<APIResponse> {
  let endpoint = `/companies/${companyId}/areas`;

  if (id) endpoint += `/${id}`;

  const res = await customFetch(endpoint);

  return res;
}

export async function fetchCompanyAreaUsers({
  companyId,
  areaId,
}: QueryParams): Promise<APIResponse> {
  const res = await customFetch(
    `/companies/${companyId}/areas/${areaId}/users`
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
