import { CustomSelectOption } from "./forms.types";

/**
 * Feriados del Motor de Plazos (superadmin).
 * Alineado con el modelo `PublicHoliday` de prisma/schema.prisma:
 *   id, countryCode, date (@db.Date), name, createdAt · @@unique([countryCode, date])
 */
export interface PublicHoliday {
  id: string;
  /** ISO 3166-1 alpha-2 en mayúsculas (el backend normaliza a upper). */
  countryCode: string;
  /** Fecha del feriado. Se almacena como DATE (medianoche UTC). */
  date: string;
  name: string;
  createdAt: string;
}

export interface CreatePublicHolidayPayload {
  countryCode: string;
  /** Fecha en formato ISO (YYYY-MM-DD). */
  date: string;
  name: string;
}

/**
 * Países ofrecidos en el formulario. El backend acepta cualquier código (lo
 * pasa a mayúsculas), pero acotamos a una lista curada para consistencia.
 */
export const HOLIDAY_COUNTRY_OPTIONS: CustomSelectOption<string>[] = [
  { value: "CL", title: "Chile (CL)" },
  { value: "CO", title: "Colombia (CO)" },
  { value: "PE", title: "Perú (PE)" },
  { value: "MX", title: "México (MX)" },
  { value: "AR", title: "Argentina (AR)" },
  { value: "EC", title: "Ecuador (EC)" },
  { value: "VE", title: "Venezuela (VE)" },
  { value: "US", title: "Estados Unidos (US)" },
  { value: "ES", title: "España (ES)" },
];

export function getHolidayCountryLabel(code: string): string {
  return (
    HOLIDAY_COUNTRY_OPTIONS.find((c) => c.value === code)?.title ?? code
  );
}
