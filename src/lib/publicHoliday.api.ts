import { APIResponse } from "@/types/api.types";
import {
  CreatePublicHolidayPayload,
  PublicHoliday,
} from "@/types/publicHoliday.types";
import { customFetch } from "@/utils/customFetch";

/**
 * CRUD de feriados del Motor de Plazos. Rutas exclusivas de SUPERADMIN:
 *   GET    /api/v1/superadmin/public-holidays[?countryCode=CL]
 *   POST   /api/v1/superadmin/public-holidays
 *   DELETE /api/v1/superadmin/public-holidays/:holidayId
 */

export async function fetchPublicHolidays(
  countryCode?: string
): Promise<APIResponse<PublicHoliday[]>> {
  const query = countryCode
    ? `?countryCode=${encodeURIComponent(countryCode)}`
    : "";
  return customFetch<PublicHoliday[]>(`/superadmin/public-holidays${query}`);
}

export async function createPublicHoliday(
  payload: CreatePublicHolidayPayload
): Promise<APIResponse<PublicHoliday>> {
  return customFetch<PublicHoliday>(`/superadmin/public-holidays`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deletePublicHoliday(
  holidayId: string
): Promise<APIResponse<{ message: string }>> {
  return customFetch<{ message: string }>(
    `/superadmin/public-holidays/${holidayId}`,
    { method: "DELETE" }
  );
}
