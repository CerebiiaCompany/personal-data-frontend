import {
  getConsentResponsesExportStatus,
  requestConsentResponsesExport,
} from "@/lib/consentExport.api";
import {
  ConsentExportJobResult,
  ConsentExportRequest,
} from "@/types/consentExport.types";
import { parseApiError } from "@/utils/parseApiError";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 200;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function openConsentExportDownload(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function runConsentResponsesExport(
  companyId: string,
  params?: ConsentExportRequest,
  onProgress?: (progress: number) => void
): Promise<ConsentExportJobResult> {
  const createRes = await requestConsentResponsesExport(companyId, params);

  if (createRes.error) {
    throw new Error(parseApiError(createRes.error));
  }

  const jobId = createRes.data?.jobId;
  if (!jobId) {
    throw new Error("No se recibió el identificador del trabajo de exportación.");
  }

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const statusRes = await getConsentResponsesExportStatus(companyId, jobId);

    if (statusRes.error) {
      throw new Error(parseApiError(statusRes.error));
    }

    const job = statusRes.data;
    if (!job) {
      throw new Error("Respuesta inválida al consultar el estado de la exportación.");
    }

    if (job.status === "active" && typeof job.progress === "number") {
      onProgress?.(job.progress);
    }

    if (job.status === "completed") {
      return job;
    }

    if (job.status === "failed") {
      throw new Error(job.error || "La exportación falló.");
    }

    if (attempt < MAX_POLL_ATTEMPTS - 1) {
      await delay(POLL_INTERVAL_MS);
    }
  }

  throw new Error(
    "La exportación está tardando más de lo esperado. Intenta consultar el estado más tarde."
  );
}

export function handleConsentExportCompleted(job: ConsentExportJobResult): {
  downloaded: boolean;
  message: string;
} {
  if (job.totalRows === 0 || (!job.downloadUrl && job.message)) {
    return {
      downloaded: false,
      message: job.message || "No hay datos para exportar.",
    };
  }

  if (job.downloadUrl) {
    openConsentExportDownload(job.downloadUrl);
    const rows =
      typeof job.totalRows === "number" ? ` (${job.totalRows} registros)` : "";
    return {
      downloaded: true,
      message: `Exportación lista${rows}. El enlace de descarga expira en aproximadamente 1 hora.`,
    };
  }

  return {
    downloaded: false,
    message: "La exportación finalizó pero no se recibió enlace de descarga.",
  };
}
