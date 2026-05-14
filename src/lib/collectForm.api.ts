import { APIResponse, QueryParams } from "@/types/api.types";
import {
  ClasificationListSummary,
  CollectFormClasification,
  CreateCollectForm,
  CreateCollectFormFromTemplate,
} from "@/types/collectForm.types";
import { customFetch } from "@/utils/customFetch";
import type { PolicyTemplateFileUrlResponse } from "@/lib/policyTemplate.api";

export async function fetchPublicCollectForm(
  params: QueryParams
): Promise<APIResponse> {
  let res = await customFetch(`/public/collectForms/${params.id}`, {}, params);
  return res;
}

export type PublicCollectFormPolicyUrlResponse = PolicyTemplateFileUrlResponse & {
  policyTemplate: PolicyTemplateFileUrlResponse["policyTemplate"] & {
    versionLabel?: string;
  };
};

/** URL firmada de la política del formulario (sin sesión; no requiere cct). */
export async function getPublicCollectFormPolicyUrl(
  collectFormId: string,
  expiresIn?: number
): Promise<APIResponse<PublicCollectFormPolicyUrlResponse>> {
  const query: QueryParams | undefined = expiresIn
    ? { expiresIn: expiresIn.toString() }
    : undefined;

  return customFetch<PublicCollectFormPolicyUrlResponse>(
    `/public/collectForms/${collectFormId}/policy/url`,
    { method: "GET" },
    query
  );
}

/** Respuesta del listado de clasificación: `data` + `meta` + `summary` */
export type ClasificationListApiResponse = APIResponse<
  CollectFormClasification[]
> & {
  summary?: ClasificationListSummary;
};

export async function fetchCollectFormClasifications(
  params: QueryParams
): Promise<ClasificationListApiResponse> {
  const res = await customFetch<CollectFormClasification[]>(
    `/companies/${params.companyId}/collectForms/clasification`,
    {},
    params
  );

  return res as ClasificationListApiResponse;
}

export async function fetchCollectForms(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/companies/${params.companyId}/collectForms`;

  if (params.id) endpoint += `/${params.id}`;

  const res = await customFetch(endpoint, {}, params);

  return res;
}

export async function fetchCompanyCollectFormsCount(): Promise<
  APIResponse<{ totalForms: number }>
> {
  const res = await customFetch<{ totalForms: number }>(
    `/companies/collect-forms/count`
  );

  return res;
}

export async function fetchAcceptedPoliciesByMonth(params: {
  year: number;
  month: number;
}): Promise<
  APIResponse<{
    acceptedCount: number;
    month: number;
    year: number;
    period: string;
  }>
> {
  const res = await customFetch<{
    acceptedCount: number;
    month: number;
    year: number;
    period: string;
  }>(`/companies/collect-forms/accepted-policies/by-month`, {}, params);

  return res;
}

export async function createCollectForm(
  companyId: string,
  data: CreateCollectForm
) {
  const res = await customFetch(`/companies/${companyId}/collectForms`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
}

export async function createCollectFormFromTemplate(
  companyId: string,
  data: CreateCollectFormFromTemplate
) {
  const res = await customFetch(
    `/companies/${companyId}/collectForms/import-template`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  return res;
}

export async function updateCollectForm(
  companyId: string,
  formId: string,
  data: CreateCollectForm
) {
  const res = await customFetch(
    `/companies/${companyId}/collectForms/${formId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );

  return res;
}

export async function deleteCollectForm(
  companyId: string,
  formId: string,
  reason?: string
) {
  const res = await customFetch(
    `/companies/${companyId}/collectForms/${formId}`,
    {
      method: "DELETE",
      body: reason ? JSON.stringify({ reason }) : undefined,
    }
  );

  return res;
}

export async function restoreCollectForm(
  companyId: string,
  collectFormId: string
): Promise<APIResponse<{ message: string }>> {
  return customFetch<{ message: string }>(
    `/companies/${companyId}/collectForms/${collectFormId}/restore`,
    { method: "PATCH" }
  );
}
