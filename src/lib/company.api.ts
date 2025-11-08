import { APIResponse, QueryParams } from "@/types/api.types";
import { CreateCompany, PlanStatus } from "@/types/company.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchOwnCompany(): Promise<APIResponse> {
  const res = await customFetch(`/companies/own`);

  return res;
}

export async function fetchCompanies(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/companies`;

  if (params.id) endpoint += `/${params.id}`;

  const res = await customFetch(endpoint, {}, params);

  console.log(res)

  return res;
}

export async function createCompany(data: CreateCompany): Promise<APIResponse> {
  const res = await customFetch(`/companies`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
}

export async function updateCompanyPlan(
  companyId: string,
  data: {
    planId: string;
    status: PlanStatus;
  }
) {
  const res = await customFetch(`/companies/${companyId}/plan`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return res;
}
