import { APIResponse } from "@/types/api.types";
import { SessionUser, UserPermissionsResponse } from "@/types/user.types";
import { customFetch } from "@/utils/customFetch";

export async function getSession(): Promise<APIResponse<SessionUser>> {
  const res = await customFetch<SessionUser>("/auth", { method: "GET" });

  return res;
}

/**
 * Obtiene los permisos del usuario actual desde el backend
 * Debe llamarse después del login o al cargar la aplicación si hay sesión activa
 */
export async function getPermissions(): Promise<APIResponse<UserPermissionsResponse>> {
  const res = await customFetch<UserPermissionsResponse>("/auth/permissions", { 
    method: "GET" 
  });

  return res;
}

export async function loginUser(
  username: string,
  password: string
): Promise<APIResponse> {
  const res = await customFetch("/auth", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  return res;
}

export async function logoutUser(): Promise<APIResponse> {
  const res = await customFetch(`/auth`, {
    method: "DELETE",
  });

  return res;
}

export async function updatePassword(
  newPassword: string
): Promise<APIResponse> {
  const res = await customFetch("/auth/update-password", {
    method: "PATCH",
    body: JSON.stringify({ password: newPassword }),
  });
  return res;
}
