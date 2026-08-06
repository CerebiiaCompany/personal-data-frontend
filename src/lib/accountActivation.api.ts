import { APIResponse } from "@/types/api.types";
import { customFetch } from "@/utils/customFetch";

// Activación de cuenta del admin de empresa (creado junto con la empresa,
// pendiente de activar). Endpoints públicos — por definición, quien activa
// su cuenta todavía no tiene sesión.

export async function requestActivationCode(email: string): Promise<APIResponse<{ message: string }>> {
  return customFetch<{ message: string }>("/account-activation/request-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyActivationCode(
  email: string,
  code: string
): Promise<APIResponse<{ valid: boolean }>> {
  return customFetch<{ valid: boolean }>("/account-activation/verify-code", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function completeActivation(
  email: string,
  code: string,
  password: string
): Promise<APIResponse<{ message: string }>> {
  return customFetch<{ message: string }>("/account-activation/complete", {
    method: "POST",
    body: JSON.stringify({ email, code, password }),
  });
}
