import { APIResponse, QueryParams } from "@/types/api.types";
import { CreatePolicyTemplate } from "@/types/policyTemplate.types";
import { customFetch } from "@/utils/customFetch";
import { API_BASE_URL } from "@/utils/env.utils";
import {
  filenameFromContentDisposition,
  triggerBrowserDownload,
} from "@/utils/downloadFile";

export async function fetchCompanyPolicyTemplates(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/companies/${params.companyId}/policyTemplates`;

  if (params.id) endpoint += `/${params.id}`;

  const res = await customFetch(endpoint, {}, params);

  return res;
}

export async function createCompanyPolicyTemplate(
  companyId: string,
  data: CreatePolicyTemplate
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/policyTemplates`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
}

export async function updatePolicyTemplate(
  companyId: string,
  policyId: string,
  data: { name?: string; versionLabel?: string }
): Promise<APIResponse> {
  const res = await customFetch(
    `/companies/${companyId}/policyTemplates/${policyId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );

  return res;
}

export async function deletePolicyTemplate(
  companyId: string,
  policyId: string
): Promise<APIResponse> {
  const res = await customFetch(
    `/companies/${companyId}/policyTemplates/${policyId}`,
    {
      method: "DELETE",
    }
  );

  return res;
}

export async function restorePolicyTemplate(
  companyId: string,
  policyId: string
): Promise<APIResponse<{ message: string }>> {
  return customFetch<{ message: string }>(
    `/companies/${companyId}/policyTemplates/${policyId}/restore`,
    { method: "PATCH" }
  );
}

// Item 7: preview de la política generada desde el RAT (sin necesidad de
// tener aún creada una PolicyTemplate RAT_GENERATED).
export async function getGeneratedPolicyPreview(
  companyId: string,
  options?: { includeDraftTreatmentId?: string }
): Promise<APIResponse> {
  const query = options?.includeDraftTreatmentId
    ? `?includeDraftTreatmentId=${encodeURIComponent(options.includeDraftTreatmentId)}`
    : "";
  return customFetch(`/companies/${companyId}/policy/generated${query}`);
}

/**
 * Descarga (o abre) el PDF de preview de la política generada desde el RAT.
 * Mismo patrón que downloadArcoPortabilityExport: fetch con credenciales +
 * blob, porque es un endpoint autenticado por cookie de sesión, no una URL
 * pública.
 */
export async function downloadGeneratedPolicyPreviewPdf(
  companyId: string,
  options?: { includeDraftTreatmentId?: string }
): Promise<APIResponse<void>> {
  try {
    const query = options?.includeDraftTreatmentId
      ? `?includeDraftTreatmentId=${encodeURIComponent(options.includeDraftTreatmentId)}`
      : "";
    const response = await fetch(
      `${API_BASE_URL}/companies/${companyId}/policy/generated/pdf${query}`,
      { method: "GET", credentials: "include", cache: "no-store" }
    );

    if (!response.ok) {
      let body: APIResponse<void> | null = null;
      try {
        body = (await response.json()) as APIResponse<void>;
      } catch {}
      return {
        error: body?.error ?? {
          code: "http/unknown-error",
          message: "No se pudo generar la previsualización en PDF.",
        },
      };
    }

    const blob = await response.blob();
    const filename =
      filenameFromContentDisposition(response.headers.get("content-disposition")) ??
      "politica-privacidad-preview.pdf";
    triggerBrowserDownload(blob, filename);
    return {};
  } catch (error) {
    return {
      error: {
        code: "http/unknown-error",
        message: (error as Error).message || "No se pudo generar la previsualización en PDF.",
      },
    };
  }
}

export interface PolicyTemplateFileUrlResponse {
  url: string;
  expiresIn: number;
  file: {
    id: string;
    originalName: string;
    contentType: string;
    size: number;
  };
  policyTemplate: {
    id: string;
    name: string;
  };
}

/**
 * Obtiene una presigned URL para ver el archivo de una plantilla de política
 */
export async function getPolicyTemplateFileUrl(
  companyId: string,
  policyTemplateId: string,
  expiresIn?: number
): Promise<APIResponse<PolicyTemplateFileUrlResponse>> {
  const queryParams = expiresIn ? { expiresIn: expiresIn.toString() } : undefined;
  const res = await customFetch<PolicyTemplateFileUrlResponse>(
    `/companies/${companyId}/policyTemplates/${policyTemplateId}/file/url`,
    {
      method: "GET",
    },
    queryParams
  );

  return res;
}