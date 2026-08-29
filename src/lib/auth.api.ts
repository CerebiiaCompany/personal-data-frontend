import { APIResponse } from "@/types/api.types";
import { SessionUser, UserPermissionsResponse } from "@/types/user.types";
import { customFetch } from "@/utils/customFetch";
import { API_BASE_URL } from "@/utils/env.utils";

type AuthSessionPayload = {
  user: SessionUser;
  company?: SessionUser["company"];
  companyUserData?: SessionUser["companyUserData"];
};

export function resolveSessionUser(
  payload: SessionUser | AuthSessionPayload | undefined | null
): SessionUser | undefined {
  if (!payload) return undefined;

  if ("user" in payload && payload.user) {
    return {
      ...payload.user,
      company: payload.company ?? payload.user.company,
      companyUserData:
        payload.companyUserData ?? payload.user.companyUserData,
    };
  }

  return payload as SessionUser;
}

export async function getSession(): Promise<APIResponse<SessionUser>> {
  const res = await customFetch<SessionUser | AuthSessionPayload>("/auth", {
    method: "GET",
  });

  const user = resolveSessionUser(res.data);
  if (!user) return res as APIResponse<SessionUser>;

  return { ...res, data: user };
}

export async function getPermissions(): Promise<
  APIResponse<UserPermissionsResponse>
> {
  return customFetch<UserPermissionsResponse>("/auth/permissions", {
    method: "GET",
  });
}

export async function loginUser(
  username: string,
  password: string
): Promise<APIResponse<SessionUser | AuthSessionPayload>> {
  return customFetch<SessionUser | AuthSessionPayload>("/auth", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logoutUser(): Promise<APIResponse> {
  return customFetch("/auth", {
    method: "DELETE",
  });
}

export async function updatePassword(
  newPassword: string
): Promise<APIResponse> {
  return customFetch("/auth/update-password", {
    method: "PATCH",
    body: JSON.stringify({ password: newPassword }),
  });
}

export async function checkActiveSession(): Promise<
  APIResponse<{ authenticated: boolean }>
> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const req = await fetch(`${API_BASE_URL}/auth`, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
    });

    if (req.status === 401) {
      return {
        error: {
          code: "auth/unauthenticated",
          message: "Tu sesión expiró, inicia sesión de nuevo",
        },
      };
    }

    if (!req.ok) {
      return {
        error: {
          code: "http/unknown-error",
          message: "No se pudo validar la sesión",
        },
      };
    }

    return { data: { authenticated: true } };
  } catch (error) {
    if ((error as Error)?.name === "AbortError") {
      return {
        error: {
          code: "http/timeout",
          message:
            "No se pudo validar la sesión: la conexión está muy lenta. Intenta de nuevo.",
        },
      };
    }
    return {
      error: {
        code: "http/network-error",
        message: "No se pudo validar la sesión por un error de red",
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
