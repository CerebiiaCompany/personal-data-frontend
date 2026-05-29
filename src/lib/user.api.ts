import { APIError, APIResponse, QueryParams } from "@/types/api.types";
import {
  CreateUser,
  DocType,
  ImportUsersResult,
  SessionUser,
  UpdateUser,
  UserRole,
} from "@/types/user.types";
import { customFetch } from "@/utils/customFetch";
import { API_BASE_URL } from "@/utils/env.utils";

/**
 * Contrato real que espera el backend en POST/PATCH /companies/:id/users:
 * los datos del colaborador van "planos" en la raíz (no anidados en
 * `companyUserData`, que es el modelo interno del formulario).
 */
interface CompanyUserPayload {
  name: string;
  lastName: string;
  username?: string;
  password?: string;
  role?: UserRole;
  position?: string;
  phone?: string;
  personalEmail?: string;
  companyAreaId?: string;
  companyRoleId?: string;
  note?: string;
  docNumber?: number | null;
  docType?: DocType;
}

function isFilledString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * Aplana el modelo del formulario (con `companyUserData` anidado) al contrato
 * plano del backend, omitiendo campos vacíos para no enviar "" donde el backend
 * espera ausencia o null.
 */
function buildCompanyUserPayload(
  data: CreateUser | UpdateUser
): CompanyUserPayload {
  const cud = data.companyUserData ?? ({} as CreateUser["companyUserData"]);

  const payload: CompanyUserPayload = {
    name: data.name,
    lastName: data.lastName,
    role: data.role,
    position: cud.position,
    phone: cud.phone,
    personalEmail: cud.personalEmail,
    docType: cud.docType,
  };

  // username / password: solo si vienen con contenido (en edición son opcionales).
  if (isFilledString(data.username)) payload.username = data.username.trim();
  if (isFilledString(data.password)) payload.password = data.password;

  // Relaciones y nota: omitir si están vacías (no enviar "").
  if (isFilledString(cud.companyAreaId)) payload.companyAreaId = cud.companyAreaId;
  if (isFilledString(cud.companyRoleId)) payload.companyRoleId = cud.companyRoleId;
  if (isFilledString(cud.note)) payload.note = cud.note;

  // docNumber: entero o null. Nunca "" ni NaN.
  const docNumber = Number(cud.docNumber);
  payload.docNumber =
    cud.docNumber === undefined || cud.docNumber === null || Number.isNaN(docNumber)
      ? null
      : docNumber;

  return payload;
}

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
    body: JSON.stringify(buildCompanyUserPayload(data)),
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
    body: JSON.stringify(buildCompanyUserPayload(data)),
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

/**
 * Descarga la plantilla .xlsx para importar usuarios. Usa fetch directo (no
 * customFetch) porque la respuesta es un binario, no JSON, y se dispara la
 * descarga en el navegador.
 */
export async function downloadUsersImportTemplate(
  companyId: string
): Promise<{ error?: APIError }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/companies/${companyId}/users/import-template`,
      { credentials: "include" }
    );

    if (!response.ok) {
      let message = `No se pudo descargar la plantilla (${response.status})`;
      try {
        const body = await response.json();
        message = body?.error?.message || message;
      } catch {
        // respuesta no-JSON: se conserva el mensaje por defecto
      }
      return { error: { code: "http/unknown-error", message } };
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "plantilla_usuarios.xlsx";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    return {};
  } catch (error) {
    return {
      error: {
        code: "http/network-error",
        message:
          (error as Error)?.message || "Error de conexión al descargar la plantilla",
      },
    };
  }
}

/**
 * El detalle de la importación (resumen + errores por fila) puede venir en
 * distintos lugares según el backend: en `data`, dentro del envelope de error
 * (`error.details` / `error.data`) o en la raíz. Lo rescatamos desde cualquiera
 * de esas ubicaciones para poder mostrarlo SIEMPRE en la tabla, no como un toast
 * genérico.
 */
function extractImportResult(body: unknown): ImportUsersResult | null {
  if (!body || typeof body !== "object") return null;

  const candidates: unknown[] = [
    (body as Record<string, unknown>).data,
    (body as Record<string, unknown>).result,
    ((body as Record<string, unknown>).error as Record<string, unknown>)?.details,
    ((body as Record<string, unknown>).error as Record<string, unknown>)?.data,
    body,
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const c = candidate as Record<string, unknown>;
    const hasErrors = Array.isArray(c.errors);
    const hasSummary =
      !!c.summary &&
      typeof c.summary === "object" &&
      "errorCount" in (c.summary as Record<string, unknown>);
    if (hasErrors || hasSummary) {
      const errors = Array.isArray(c.errors)
        ? (c.errors as ImportUsersResult["errors"])
        : [];
      const created = Array.isArray(c.created)
        ? (c.created as ImportUsersResult["created"])
        : [];
      const summary = (c.summary as ImportUsersResult["summary"]) ?? {
        total: created.length + errors.length,
        createdCount: created.length,
        errorCount: errors.length,
      };
      return { summary, created, errors };
    }
  }

  return null;
}

/**
 * Importa usuarios masivamente desde un archivo Excel (.xlsx/.xls) usando
 * multipart/form-data. No se fija Content-Type manualmente: el navegador agrega
 * el boundary automáticamente.
 *
 * Devuelve `data` con el detalle (resumen + errores por fila) siempre que el
 * backend lo incluya, incluso cuando la respuesta es de error, para mostrar al
 * usuario qué filas fallaron y por qué.
 */
export async function importCompanyUsers(
  companyId: string,
  file: File
): Promise<APIResponse<ImportUsersResult>> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      `${API_BASE_URL}/companies/${companyId}/users/import`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // respuesta no-JSON
    }

    const result = extractImportResult(body);

    if (!response.ok) {
      const error = (body as APIResponse<ImportUsersResult>)?.error ?? {
        code: "http/unknown-error",
        message: `No se pudo importar el archivo (${response.status})`,
      };
      // Si el error trae el detalle de filas, lo devolvemos como data para
      // renderizar la tabla en lugar de un toast genérico.
      return result ? { data: result, error } : { error };
    }

    if (result) return { data: result };

    return (body as APIResponse<ImportUsersResult>) ?? {};
  } catch (error) {
    return {
      error: {
        code: "http/unknown-error",
        message:
          (error as Error)?.message || "Error desconocido al importar usuarios",
      },
    };
  }
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
