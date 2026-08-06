// Referencia legal/autoridad de protección de datos por país, para textos de
// consentimiento que hoy citan la normativa colombiana sin importar el país
// real de la empresa (Company.countryCode, expuesto por el backend en
// GET /public/collectForms/:id). Espejo de legalNotices.ts del backend.
export interface DataProtectionLegalNotice {
  lawReference: string;
  authorityName: string;
}

const LEGAL_NOTICES_BY_COUNTRY: Record<string, DataProtectionLegalNotice> = {
  CO: {
    lawReference: "Ley 1581 de 2012",
    authorityName: "Superintendencia de Industria y Comercio (SIC)",
  },
  CL: {
    lawReference: "Ley 21.719",
    authorityName: "Agencia de Protección de Datos Personales (APDP)",
  },
};

export function getDataProtectionLegalNotice(
  countryCode?: string | null
): DataProtectionLegalNotice {
  return LEGAL_NOTICES_BY_COUNTRY[countryCode ?? ""] ?? LEGAL_NOTICES_BY_COUNTRY.CO;
}
