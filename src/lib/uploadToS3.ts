/**
 * Sube un archivo a S3 usando una URL presignada
 * Esta función se mantiene porque todavía se necesita para subir el archivo
 * después de obtener la URL presignada del backend
 */
export async function uploadWithPresignedUrl(url: string, file: File) {
  if (!url || typeof url !== "string") {
    throw new Error("URL presignada no válida");
  }

  if (!file) {
    throw new Error("Archivo no válido");
  }

  // Validar que la URL sea válida
  try {
    new URL(url);
  } catch (e) {
    throw new Error(`URL presignada inválida: ${url.substring(0, 50)}...`);
  }

  console.log("📤 Subiendo archivo a S3:", {
    url: url.substring(0, 100) + "...", // Solo mostrar primeros 100 caracteres
    urlDomain: new URL(url).hostname,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  try {
    // IMPORTANTE: Para URLs presignadas de S3, solo incluir Content-Type si fue especificado
    // en la generación de la URL presignada. No incluir otros headers que puedan romper la firma.
    const headers: HeadersInit = {};
    
    // Solo agregar Content-Type si existe
    if (file.type) {
      headers["Content-Type"] = file.type;
    }

    // Note: fetch doesn't expose progress; for progress use XHR or axios
    const put = await fetch(url, {
      method: "PUT",
      headers,
      body: file,
    });

    console.log("📥 Respuesta de S3:", {
      status: put.status,
      statusText: put.statusText,
      ok: put.ok,
      headers: Object.fromEntries(put.headers.entries()),
    });

    if (!put.ok) {
      const errorText = await put.text();
      console.error("❌ Error de S3:", {
        status: put.status,
        statusText: put.statusText,
        errorText: errorText.substring(0, 500), // Limitar tamaño del error
      });
      throw new Error(`Upload to S3 failed (${put.status}): ${errorText.substring(0, 200)}`);
    }

    console.log("✅ Archivo subido correctamente a S3");
  } catch (error: any) {
    console.error("❌ Error en uploadWithPresignedUrl:", {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 300),
      url: url.substring(0, 100) + "...",
    });

    // Si es un error de CORS o red, dar un mensaje más claro
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      const corsError = `
⚠️ Error de conexión al subir el archivo a S3.

Posibles causas:
1. CORS no configurado en el bucket de S3
   - El bucket necesita permitir PUT desde tu dominio
   - Configura CORS en S3 para permitir: Origin, PUT, Content-Type

2. URL presignada inválida o expirada
   - Verifica que el backend genere URLs válidas
   - La URL no debe haber expirado

3. Problemas de red o firewall
   - Verifica tu conexión a internet
   - Algunos firewalls bloquean conexiones a S3
      `;
      console.error(corsError);
      throw new Error(
        "Error de conexión al subir el archivo. Verifica la configuración de CORS en S3 y que la URL presignada sea válida. " +
        (error.message || "")
      );
    }

    throw error;
  }
}
