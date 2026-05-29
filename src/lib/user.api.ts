import { APIResponse, QueryParams } from "@/types/api.types";
import { CreateUser, SessionUser, UpdateUser } from "@/types/user.types";
import { customFetch } from "@/utils/customFetch";

/**
 * El backend de /companies/:id/users (lista y detalle) devuelve los datos del
 * colaborador en forma "plana" (position, phone, companyArea, companyRole... en
 * la raíz), mientras que el resto del frontend consume la forma anidada
 * `companyUserData` (la misma que retorna /auth). Normalizamos aquí, en la capa
 * de datos, para mantener un único contrato en toda la UI.
 */
function normalizeCompanyUser<T extends Record<string, unknown>>(raw: T): T {
  if (!raw || typeof raw !== "object") return raw;
  // Ya viene en la forma anidada esperada: no se toca.
  if ("companyUserData" in raw && raw.companyUserData) return raw;

  const {
    companyId,
    position,
    phone,
    personalEmail,
    companyAreaId,
    companyRoleId,
    companyArea,
    companyRole,
    note,
    docNumber,
    docType,
    ...rest
  } = raw as Record<string, unknown>;

  return {
    ...rest,
    companyUserData: {
      companyId,
      position,
      phone,
      personalEmail,
      companyAreaId: companyAreaId ?? (companyArea as { _id?: string })?._id,
      companyRoleId: companyRoleId ?? (companyRole as { _id?: string })?._id,
      companyArea: companyArea ?? undefined,
      companyRole: companyRole ?? undefined,
      note,
      docNumber,
      docType,
    },
  } as unknown as T;
}

function normalizeCompanyUsersResponse(res: APIResponse): APIResponse {
  if (res.error || res.data == null) return res;

  const data = Array.isArray(res.data)
    ? (res.data as SessionUser[]).map((u) =>
        normalizeCompanyUser(u as unknown as Record<string, unknown>)
      )
    : normalizeCompanyUser(res.data as Record<string, unknown>);

  return { ...res, data };
}

export async function fetchUsers(params: QueryParams): Promise<APIResponse> {
  let endpoint = `/superadmin/users`;

  if (params.id) endpoint += `/${params.id}`;
  const res = await customFetch(endpoint, {}, params);

  return res;
}

export async function fetchCompanyUsers(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/companies/${params.companyId}/users`;

  if (params.id) endpoint += `/${params.id}`;
  const res = await customFetch(endpoint, {}, params);

  return normalizeCompanyUsersResponse(res);
}

export async function createCompanyUser(
  companyId: string,
  data: CreateUser
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/users`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
}

export async function updateCompanyUser(
  companyId: string,
  userId: string,
  data: UpdateUser
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return res;
}

export async function deleteCompanyUser(
  companyId: string,
  userId: string
): Promise<APIResponse> {
  const res = await customFetch(`/companies/${companyId}/users/${userId}`, {
    method: "DELETE",
  });

  return res;
}

export async function restoreCompanyUser(
  companyId: string,
  userId: string
): Promise<APIResponse<{ message: string }>> {
  return customFetch<{ message: string }>(
    `/companies/${companyId}/users/${userId}/restore`,
    { method: "PATCH" }
  );
}

export async function updateMe(data: {
  name: string;
  companyUserData: {
    phone: string;
    personalEmail: string;
  };
}): Promise<APIResponse> {
  const res = await customFetch(`/users/me`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return res;
}
