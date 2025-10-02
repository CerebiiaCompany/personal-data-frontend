import { APIResponse, QueryParams } from "@/types/api.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchOwnCompany(): Promise<APIResponse> {
  const res = await customFetch(`/companies/own`);

  return res;
}
