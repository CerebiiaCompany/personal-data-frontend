import { APIResponse, QueryParams } from "@/types/api.types";
import { CreateCompanyPayment } from "@/types/payment.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchAllPayments(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/superadmin/payments`;

  const res = await customFetch(endpoint, {}, params);

  return res;
}

export async function fetchCompanyPayments(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/companies/${params.companyId}/payments`;

  if (params.id) endpoint += `/${params.id}`;

  const res = await customFetch(endpoint, {}, params);

  return res;
}

export async function createCompanyPayment(
  companyId: string,
  data: CreateCompanyPayment
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/payments`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
}
