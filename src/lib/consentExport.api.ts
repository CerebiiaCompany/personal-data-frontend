import { APIResponse } from "@/types/api.types";
import {
  ConsentExportCreateResult,
  ConsentExportJobResult,
  ConsentExportRequest,
} from "@/types/consentExport.types";
import { customFetch } from "@/utils/customFetch";

export async function requestConsentResponsesExport(
  companyId: string,
  body?: ConsentExportRequest
): Promise<APIResponse<ConsentExportCreateResult>> {
  return customFetch<ConsentExportCreateResult>(
    `/companies/${companyId}/exports/consent-responses`,
    {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }
  );
}

export async function getConsentResponsesExportStatus(
  companyId: string,
  jobId: string
): Promise<APIResponse<ConsentExportJobResult>> {
  return customFetch<ConsentExportJobResult>(
    `/companies/${companyId}/exports/consent-responses/${jobId}`
  );
}
