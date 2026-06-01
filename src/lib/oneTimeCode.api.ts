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

// Config para operaciones OTP: timeout amplio (red lenta) pero SOLO se reintenta
// ante errores de red (conexión no establecida). NO se reintenta en timeout
// porque el servidor pudo haber enviado el SMS/correo (costo) o consumido el
// código, y duplicarlo sería incorrecto.
const OTP_FETCH_CONFIG = {
  timeoutMs: 45000,
  retries: 2,
  retryDelayMs: 1500,
  retryOnTimeout: false,
} as const;

export async function generateOtpCode(
  data: CreateOneTimeCode
): Promise<APIResponse> {
  const res = await customFetch(
    "/public/otp/generate",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    undefined,
    OTP_FETCH_CONFIG
  );

  return res;
}

export async function validateOtpCode(
  id: string,
  code: string
): Promise<APIResponse> {
  const res = await customFetch(
    `/public/otp/${id}/validate`,
    {
      method: "PATCH",
      body: JSON.stringify({ code }),
    },
    undefined,
    OTP_FETCH_CONFIG
  );

  return res;
}

export async function resendOtpCodeByEmail(
  id: string,
  email: string
): Promise<APIResponse> {
  const res = await customFetch(
    `/public/otp/${id}/resend-email`,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    undefined,
    OTP_FETCH_CONFIG
  );

  return res;
}