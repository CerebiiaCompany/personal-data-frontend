import { APIResponse } from "@/types/api.types";
import {
  ConsentRequestListItem,
  ConsentRequestTitularInput,
  PublicConsentConfirmResult,
  SendConsentRequestsResult,
} from "@/types/biometricConsent.types";
import { customFetch } from "@/utils/customFetch";
import { API_BASE_URL } from "@/utils/env.utils";
import { filenameFromContentDisposition, triggerBrowserDownload } from "@/utils/downloadFile";

// ---------------------------------------------------------------------------
// Panel admin (autenticado) — companies/:companyId/treatments/:treatmentId/...
// ---------------------------------------------------------------------------

export async function fetchConsentRequests(
  companyId: string,
  treatmentId: string
): Promise<APIResponse<ConsentRequestListItem[]>> {
  return customFetch<ConsentRequestListItem[]>(
    `/companies/${companyId}/treatments/${treatmentId}/consent-requests`
  );
}

export async function sendConsentRequests(
  companyId: string,
  treatmentId: string,
  titulares: ConsentRequestTitularInput[]
): Promise<APIResponse<SendConsentRequestsResult>> {
  return customFetch<SendConsentRequestsResult>(
    `/companies/${companyId}/treatments/${treatmentId}/consent-requests`,
    { method: "POST", body: JSON.stringify({ titulares }) }
  );
}

/**
 * Descarga la copia firmada exacta (N-09) — mismo patrón raw-fetch + blob
 * que downloadWizardCompliancePdf (wizardSession.api.ts): customFetch no
 * maneja bien respuestas binarias.
 */
export async function downloadConsentDocument(
  companyId: string,
  treatmentId: string,
  consentId: string
): Promise<APIResponse<void>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/companies/${companyId}/treatments/${treatmentId}/consents/${consentId}/download`,
      { method: "GET", credentials: "include", cache: "no-store" }
    );
    if (!response.ok) {
      let body: APIResponse<void> | null = null;
      try {
        body = (await response.json()) as APIResponse<void>;
      } catch {
        // respuesta no-JSON (ej. 500 crudo) — se usa el fallback de abajo
      }
      return {
        error: body?.error
          ? { ...body.error, status: response.status }
          : { code: "http/unknown-error", message: "No se pudo descargar el documento.", status: response.status },
      };
    }
    const blob = await response.blob();
    const filename = filenameFromContentDisposition(response.headers.get("content-disposition")) ?? "consentimiento.pdf";
    triggerBrowserDownload(blob, filename);
    return {};
  } catch (error) {
    const message = (error as Error).message;
    if (message.includes("Failed to fetch")) {
      return { error: { code: "http/network-error", message: "Error de conexión. Verifica tu red e intenta de nuevo." } };
    }
    return { error: { code: "http/unknown-error", message: "Error inesperado al descargar el documento." } };
  }
}

// ---------------------------------------------------------------------------
// Público (sin autenticación) — /public/consents/:consentId/...
// ---------------------------------------------------------------------------

/** URL para mostrar el PDF en un <iframe>/<a> — GET directo, sin JS de por medio. */
export function getPublicConsentDocumentUrl(consentId: string): string {
  return `${API_BASE_URL}/public/consents/${consentId}/document`;
}

export async function confirmPublicConsent(
  consentId: string,
  code: string
): Promise<APIResponse<PublicConsentConfirmResult>> {
  return customFetch<PublicConsentConfirmResult>(`/public/consents/${consentId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}
