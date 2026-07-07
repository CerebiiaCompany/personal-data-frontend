/**
 * Utilidades de descarga de archivos en el navegador.
 *
 * Centraliza la lógica de convertir un `Blob` en una descarga con nombre y de
 * extraer el nombre sugerido por el servidor vía cabecera `Content-Disposition`,
 * para evitar duplicar este patrón en cada endpoint que devuelve archivos.
 */

/** Dispara la descarga de un `Blob` con el nombre indicado. */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Extrae el nombre de archivo de una cabecera `Content-Disposition`.
 * Soporta tanto `filename="..."` como `filename*=UTF-8''...` (RFC 5987).
 */
export function filenameFromContentDisposition(
  header: string | null | undefined
): string | undefined {
  if (!header) return undefined;

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }

  const simpleMatch = /filename="?([^";]+)"?/i.exec(header);
  return simpleMatch?.[1]?.trim();
}
