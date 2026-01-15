import { APIResponse } from "@/types/api.types";
import { API_BASE_URL } from "@/utils/env.utils";
import { customFetch } from "@/utils/customFetch";

export interface UploadFileResponse {
  id: string;
  key: string;
  url: string;
  originalName: string;
  size: number;
  contentType: string;
}

export interface GetFileUrlResponse {
  url: string;
  expiresIn: number;
  file: {
    id: string;
    originalName: string;
    contentType: string;
    size: number;
  };
}

/**
 * Sube un archivo directamente al backend usando multipart/form-data
 * El backend maneja la subida a S3 y crea el registro en la BD
 */
export async function uploadFile(
  companyId: string,
  file: File,
  purpose: string = "templates"
): Promise<APIResponse<UploadFileResponse>> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", purpose);

  try {
    const response = await fetch(
      `${API_BASE_URL}/companies/${companyId}/uploads`,
      {
        method: "POST",
        body: formData,
        credentials: "include", // Importante: para incluir cookies de sesión
        // NO incluir Content-Type header, el navegador lo hará automáticamente
      }
    );

    // Manejar errores de HTTP antes de parsear JSON
    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        // Si no se puede parsear, usar el texto de error
        const text = await response.text();
        return {
          error: {
            code: "http/unknown-error",
            message: `Error al subir archivo: ${response.statusText} - ${text}`,
          },
        };
      }

      return {
        error: errorBody.error || {
          code: "http/unknown-error",
          message: `Error al subir archivo: ${response.statusText}`,
        },
      };
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      error: {
        code: "http/unknown-error",
        message: error?.message || "Error desconocido al subir el archivo",
      },
    };
  }
}

/**
 * Obtiene una presigned URL para leer un archivo (con validación de acceso)
 */
export async function getFileUrl(
  companyId: string,
  fileId: string,
  expiresIn?: number
): Promise<APIResponse<GetFileUrlResponse>> {
  const queryParams = expiresIn ? { expiresIn: expiresIn.toString() } : undefined;
  const res = await customFetch<GetFileUrlResponse>(
    `/companies/${companyId}/uploads/${fileId}/url`,
    {
      method: "GET",
    },
    queryParams
  );

  return res;
}
