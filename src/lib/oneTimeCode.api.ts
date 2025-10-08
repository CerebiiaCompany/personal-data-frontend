import { APIResponse, QueryParams } from "@/types/api.types";
import { CreateOneTimeCode } from "@/types/oneTimeCode.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchCompanyOtpCodes(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/companies/${params.companyId}/otp`;

  if (params.id) endpoint += `/${params.id}`;

  const res = await customFetch(endpoint, {}, params);

  return res;
}

export async function generateOtpCode(
  data: CreateOneTimeCode
): Promise<APIResponse> {
  const res = await customFetch("/public/otp/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
}

export async function validateOtpCode(
  id: string,
  code: string
): Promise<APIResponse> {
  const res = await customFetch(`/public/otp/${id}/validate`, {
    method: "PATCH",
    body: JSON.stringify({ code }),
  });

  return res;
}
