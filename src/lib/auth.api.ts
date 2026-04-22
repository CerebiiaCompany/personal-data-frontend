import { APIResponse } from "@/types/api.types";
import { SessionUser, UserPermissionsResponse } from "@/types/user.types";
import { customFetch } from "@/utils/customFetch";

type AuthSessionPayload = {
  user: SessionUser;
  company?: SessionUser["company"];
};

export async function getSession(): Promise<APIResponse<SessionUser>> {
  const res = await customFetch<SessionUser | AuthSessionPayload>("/auth", {
    method: "GET",
  });

  if (!res.data) return res as APIResponse<SessionUser>;

  // Compatibilidad: backend nuevo retorna { data: { user, company } }
  const payload = res.data as AuthSessionPayload;
  if ("user" in payload && payload.user) {
    return {
      ...res,
      data: {
        ...payload.user,
        company: payload.company,
      },
    };
  }

  // Compatibilidad con formato anterior (data = SessionUser)
  return res as APIResponse<SessionUser>;
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
