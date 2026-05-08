import { APIResponse, QueryParams } from "@/types/api.types";
import {
  CreateCompany,
  CompanyDataOfficer,
  CompanyCreditsCurrentMonth,
  CompanyCreditsPricing,
  CompanyProfile,
  PlanStatus,
} from "@/types/company.types";
import { customFetch } from "@/utils/customFetch";
import { API_BASE_URL } from "@/utils/env.utils";

export async function fetchOwnCompany(): Promise<APIResponse> {
  const res = await customFetch(`/companies/own`);

  return res;
}

export async function updateOwnCompany(data: {
  name: string;
  nit: string;
  email: string;
  phone: string;
}): Promise<APIResponse> {
  const res = await customFetch(`/companies/own`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

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

export async function fetchCompanyDataOfficer(
  companyId: string
): Promise<APIResponse<CompanyDataOfficer | null>> {
  return customFetch<CompanyDataOfficer | null>(
    `/companies/${companyId}/data-officer`
  );
}

export async function assignCompanyDataOfficer(
  companyId: string,
  userId: string
): Promise<APIResponse<CompanyDataOfficer>> {
  return customFetch<CompanyDataOfficer>(`/companies/${companyId}/data-officer`, {
    method: "PATCH",
    body: JSON.stringify({ userId }),
  });
}

// ---- Company Profile endpoints ----

export async function fetchCompanyProfile(
  companyId: string
): Promise<APIResponse<CompanyProfile>> {
  return customFetch<CompanyProfile>(`/companies/${companyId}/profile`);
}

export async function updateCompanyIdentification(
  companyId: string,
  data: {
    company_name?: string;
    nit?: string;
    main_address?: string;
    city?: string;
    department?: string;
    phone_numbers?: string[];
    website?: string;
    institutional_email?: string;
  }
): Promise<APIResponse> {
  return customFetch(`/companies/${companyId}/profile/identification`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateCompanyLegalRepresentative(
  companyId: string,
  data: {
    full_name?: string;
    position?: string;
    document_number?: string;
    contact_email?: string;
  }
): Promise<APIResponse> {
  return customFetch(`/companies/${companyId}/profile/legal-representative`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateCompanyDataProtectionOfficer(
  companyId: string,
  data: {
    full_name?: string;
    position?: string;
    email?: string;
    phone?: string;
    responsibility_description?: string;
  }
): Promise<APIResponse> {
  return customFetch(
    `/companies/${companyId}/profile/data-protection-officer`,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export async function updateCompanyAuthorizedPersonnel(
  companyId: string,
  data: { user_ids: string[] }
): Promise<APIResponse> {
  return customFetch(`/companies/${companyId}/profile/authorized-personnel`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateCompanyEconomicActivity(
  companyId: string,
  data: { activity_description?: string }
): Promise<APIResponse> {
  return customFetch(`/companies/${companyId}/profile/economic-activity`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateCompanyPersonalDataCollected(
  companyId: string,
  data: {
    employees_data?: boolean;
    suppliers_data?: boolean;
    clients_data?: boolean;
    web_users_data?: boolean;
    commercial_prospects_data?: boolean;
    financial_data?: boolean;
    sensitive_data?: string[];
    other_sensitive_data?: string;
  }
): Promise<APIResponse> {
  return customFetch(
    `/companies/${companyId}/profile/personal-data-collected`,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export async function updateCompanyProcessingPurposes(
  companyId: string,
  data: {
    processing_purposes: Array<{ data_type?: string; purpose?: string }>;
  }
): Promise<APIResponse> {
  return customFetch(`/companies/${companyId}/profile/processing-purposes`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateCompanyInternationalTransfers(
  companyId: string,
  data: {
    servers_outside_country?: boolean;
    third_party_transfers?: boolean;
    transfer_details?: string;
  }
): Promise<APIResponse> {
  return customFetch(
    `/companies/${companyId}/profile/international-transfers`,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export async function updateCompanyRightsAttention(
  companyId: string,
  data: { user_ids?: string[]; phone_line?: string }
): Promise<APIResponse> {
  return customFetch(`/companies/${companyId}/profile/rights-attention`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateCompanyInternalRegulations(
  companyId: string,
  data: {
    has_internal_policies?: boolean;
    documents_description?: string;
    attachments?: string[];
  }
): Promise<APIResponse> {
  return customFetch(`/companies/${companyId}/profile/internal-regulations`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateCompanySpecialObservations(
  companyId: string,
  data: {
    minor_data_processing?: boolean;
    biometric_data_usage?: boolean;
    video_surveillance?: boolean;
    third_party_integrations?: boolean;
    additional_observations?: string;
  }
): Promise<APIResponse> {
  return customFetch(`/companies/${companyId}/profile/special-observations`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
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
