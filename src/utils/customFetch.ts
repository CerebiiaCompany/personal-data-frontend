import { APIResponse } from "@/types/api.types";
import { API_BASE_URL } from "@/utils/env.utils";

export async function customFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const headers: HeadersInit = {};

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const req = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",
      headers: {
        ...headers,
        ...options.headers,
      },
      ...options,
    });

    const res = await req.json();

    return res;
  } catch (error) {
    return {
      error: { message: "Error desconocido", code: "http/unknown-error" },
    };
  }
}
