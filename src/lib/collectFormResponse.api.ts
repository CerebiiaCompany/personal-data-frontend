import { APIResponse, QueryParams } from "@/types/api.types";
import {
  CollectFormResponseUserPayload,
  CreateAdminCollectFormResponsesBody,
  CreateAdminCollectFormResponsesResult,
  CreateCollectFormResponse,
  UpdateCollectFormResponseInput,
  UpdateCollectFormResponseResult,
} from "@/types/collectFormResponse.types";
import { customFetch } from "@/utils/customFetch";

/**
 * Activa el envío del header `Idempotency-Key` en el registro de respuestas.
 *
 * IMPORTANTE: déjalo en `false` hasta que el BACKEND:
 *   1) incluya `Idempotency-Key` en `Access-Control-Allow-Headers` (CORS), y
 *   2) implemente la deduplicación por esa clave.
 * Si se activa antes del paso (1), el navegador bloquea la petición en el
 * preflight CORS (error "Request header field idempotency-key is not allowed").
 * Una vez listo el backend, pon esto en `true` y también `retryOnTimeout: true`.
 */
const SEND_IDEMPOTENCY_HEADER = false;

export async function registerCollectFormResponse(
  formId: string,
  data: CreateCollectFormResponse,
  idempotencyKey?: string
): Promise<APIResponse> {
  // Envío crítico (puede perderse la respuesta del titular en mala red):
  // - timeout amplio (90s) para tolerar subidas lentas + procesamiento.
  // - reintento ante errores de RED (conexión no establecida → seguro reintentar).
  // - `Idempotency-Key` (cuando el backend lo soporte): permite deduplicar
  //   reintentos sin crear respuestas duplicadas.
  const headers =
    SEND_IDEMPOTENCY_HEADER && idempotencyKey
      ? { "Idempotency-Key": idempotencyKey }
      : undefined;

  const res = await customFetch(
    `/public/collectForms/${formId}/responses`,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers,
    },
    undefined,
    {
      timeoutMs: 90000,
      retries: 2,
      retryDelayMs: 2000,
      // Mientras no haya idempotencia en backend, NO reintentar en timeout
      // (un timeout puede significar que el servidor sí guardó la respuesta).
      retryOnTimeout: false,
    }
  );

  return res;
}

export async function registerConsentCampaignResponse(
  formId: string,
  cct: string,
  data: {
    dataProcessing: boolean;
    data: Record<string, any>;
    user: CollectFormResponseUserPayload;
  }
): Promise<APIResponse> {
  return customFetch(
    `/public/collectForms/${formId}/responses?cct=${encodeURIComponent(cct)}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

/**
 * Registro manual de personas en un formulario de recolección (sesión activa,
 * permiso collect.create). Sin verificación OTP; quedan con consentimiento PENDING.
 */
export async function createAdminCollectFormResponses(
  companyId: string,
  collectFormId: string,
  data: CreateAdminCollectFormResponsesBody
): Promise<APIResponse<CreateAdminCollectFormResponsesResult>> {
  return customFetch<CreateAdminCollectFormResponsesResult>(
    `/companies/${companyId}/collectForms/${collectFormId}/responses`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function fetchCollectFormResponses(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/companies/${params.companyId}/collectForms/${params.id}/responses`;

  if (params.responseId) {
    endpoint += `/${params.responseId}`;
  }

  const res = await customFetch(endpoint, {}, params);

  return res;
}

export async function fetchAllCollectFormResponses(
  params: QueryParams
): Promise<APIResponse> {
  const res = await customFetch(
    `/companies/${params.companyId}/collectForms/${params.id}/responses/all`,
    {},
    params
  );

  return res;
}

export async function updateCollectFormResponse(
  companyId: string,
  collectFormId: string,
  responseId: string,
  data: UpdateCollectFormResponseInput
): Promise<APIResponse<UpdateCollectFormResponseResult>> {
  return customFetch<UpdateCollectFormResponseResult>(
    `/companies/${companyId}/collectForms/${collectFormId}/responses/${responseId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteCollectFormResponse(
  companyId: string,
  formId: string,
  responseId: string,
  reason?: string
) {
  const res = await customFetch(
    `/companies/${companyId}/collectForms/${formId}/responses/${responseId}`,
    {
      method: "DELETE",
      body: reason ? JSON.stringify({ reason }) : undefined,
    }
  );

  return res;
}

export async function restoreCollectFormResponse(
  companyId: string,
  collectFormId: string,
  responseId: string
): Promise<APIResponse<{ message: string }>> {
  return customFetch<{ message: string }>(
    `/companies/${companyId}/collectForms/${collectFormId}/responses/${responseId}/restore`,
    { method: "PATCH" }
  );
}

export async function sendConsentInvitation(
  companyId: string,
  collectFormId: string,
  data: {
    channel: "SMS" | "EMAIL";
    docType: string;
    docNumber: number;
    phone?: string;
    email?: string;
    link: string;
    message?: string;
  }
): Promise<APIResponse> {
  const res = await customFetch(
    `/companies/${companyId}/collectForms/${collectFormId}/consent-invitations`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  return res;
}
