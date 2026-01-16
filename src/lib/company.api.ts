import { APIResponse, QueryParams } from "@/types/api.types";
import {
  CreateCompany,
  CompanyCreditsCurrentMonth,
  CompanyCreditsPricing,
  PlanStatus,
} from "@/types/company.types";
import { customFetch } from "@/utils/customFetch";
import { API_BASE_URL } from "@/utils/env.utils";

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

export async function fetchCompanyCreditsByMonth(params: {
  year: number;
  month: number;
}): Promise<APIResponse<CompanyCreditsCurrentMonth>> {
  const res = await customFetch<CompanyCreditsCurrentMonth>(
    `/companies/credits/by-month`,
    {},
    {
      year: params.year,
      month: params.month,
    }
  );

  return res;
}

// Nota: usamos fetch directo (no customFetch) para evitar redirecciones automáticas
// en pantallas públicas (p.ej. /formularios/:id). Si falla, simplemente no mostramos tarifas.
export async function fetchCompanyCreditsPricing(): Promise<
  APIResponse<CompanyCreditsPricing>
> {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/credits/pricing`, {
      method: "GET",
      credentials: "include",
    });

    const body = (await response.json()) as APIResponse<CompanyCreditsPricing>;

    if (!response.ok) {
      return {
        error:
          body.error ??
          ({
            code: "http/unknown-error",
            message: "Error al consultar tarifas de créditos",
          } as any),
      };
    }

    return body;
  } catch (error: any) {
    return {
      error: {
        code: "http/unknown-error",
        message: error?.message || "Error desconocido",
      } as any,
    };
  }
}
