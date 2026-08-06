import { APIResponse } from "@/types/api.types";
import { ComplianceDashboard } from "@/types/compliance.types";
import { customFetch } from "@/utils/customFetch";

// Fase 1 PRD v2.2 item C — /companies/:companyId/dashboard/compliance
// (GET). Sin caché: cada llamada recalcula todo en vivo desde la BD.
export async function fetchComplianceDashboard(
  companyId: string
): Promise<APIResponse<ComplianceDashboard>> {
  return customFetch<ComplianceDashboard>(`/companies/${companyId}/dashboard/compliance`);
}
