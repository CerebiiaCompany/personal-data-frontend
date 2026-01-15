"use server";

import { getFileUrl } from "@/lib/upload.api";

/**
 * Obtiene una presigned URL para leer un archivo usando el endpoint del backend
 * @param companyId - ID de la compañía
 * @param fileId - ID del archivo en la BD
 * @param download - Nombre del archivo para descarga (opcional)
 * @param expiresIn - Tiempo de expiración en segundos (default: 3600 = 1 hora)
 * @returns URL presignada
 */
export async function getPresignedUrl(
  companyId: string,
  fileId: string,
  download?: string,
  expiresIn?: number
): Promise<string> {
  const res = await getFileUrl(companyId, fileId, expiresIn);

  if (res.error || !res.data) {
    throw new Error(res.error?.message || "Error al obtener URL del archivo");
  }

  // Si se especifica download, podríamos necesitar modificar la URL
  // Por ahora retornamos la URL tal como viene del backend
  // El backend debería manejar el parámetro de descarga si es necesario
  return res.data.url;
}
