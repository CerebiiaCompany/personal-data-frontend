// Item 5 (auditoría Ley 21.719 — corrección de bloqueantes de código): Art.
// 14 ter letra h — aviso de transferencia internacional (AWS us-east-1,
// Virginia, EE.UU.) para el titular ANTES de que entregue sus datos.
// Espejo de utils/internationalTransferNotice.ts del backend (mismo patrón
// que legalNotices.ts/legalNotices.utils.ts) — este archivo es el que
// importan directamente los 3 formularios públicos, sin llamada de red.
//
// CO también habilitado a propósito: el hecho físico (AWS EE.UU.) es el
// mismo para ambos países. Ver el backend para el razonamiento completo.
export interface InternationalTransferNotice {
  enabled: boolean;
  text: string;
}

const INTERNATIONAL_TRANSFER_NOTICE_BY_COUNTRY: Record<string, InternationalTransferNotice> = {
  CL: {
    enabled: true,
    // TODO: TEXTO PENDIENTE DE VALIDACIÓN LEGAL — REEMPLAZAR ANTES DE GO-LIVE
    // Debe mencionar AWS us-east-1 (EE.UU.) y citar Art. 14 ter letra h, Ley 21.719.
    text: "TODO: TEXTO PENDIENTE DE VALIDACIÓN LEGAL — REEMPLAZAR ANTES DE GO-LIVE",
  },
  CO: {
    enabled: true,
    // TODO: TEXTO PENDIENTE DE VALIDACIÓN LEGAL PARA COLOMBIA — citar Arts.
    // 26-27 Ley 1581 según corresponda. NO usar el mismo texto que CL.
    text: "TODO: TEXTO PENDIENTE DE VALIDACIÓN LEGAL PARA COLOMBIA — citar Arts. 26-27 Ley 1581 según corresponda. NO usar el mismo texto que CL.",
  },
};

const DISABLED_NOTICE: InternationalTransferNotice = { enabled: false, text: "" };

export function getInternationalTransferNotice(
  countryCode?: string | null
): InternationalTransferNotice {
  return INTERNATIONAL_TRANSFER_NOTICE_BY_COUNTRY[countryCode ?? ""] ?? DISABLED_NOTICE;
}
