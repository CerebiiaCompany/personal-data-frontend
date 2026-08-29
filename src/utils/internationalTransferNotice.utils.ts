// Item 5 (auditoría Ley 21.719 — corrección de bloqueantes de código): Art.
// 14 ter letra h — aviso de transferencia internacional (AWS us-east-1,
// Virginia, EE.UU.) para el titular ANTES de que entregue sus datos.
// Espejo de utils/internationalTransferNotice.ts del backend (mismo patrón
// que legalNotices.ts/legalNotices.utils.ts) — este archivo es el que
// importan directamente los 3 formularios públicos, sin llamada de red.
//
// CO también habilitado a propósito: el hecho físico (AWS EE.UU.) es el
// mismo para ambos países. Ver el backend para el razonamiento completo.
//
// Textos validados por legal (TX-11) — ver clave international_transfer_notice
// en JurisdictionLegalReference / diccionario de constantes.
export interface InternationalTransferNotice {
  enabled: boolean;
  text: string;
}

const INTERNATIONAL_TRANSFER_NOTICE_BY_COUNTRY: Record<string, InternationalTransferNotice> = {
  CL: {
    enabled: true,
    text: "De conformidad con lo dispuesto en el artículo 27 y siguientes de la Ley N.º 21.719 sobre Protección de Datos Personales, y demás normativa aplicable, sus datos personales podrán ser transferidos internacionalmente cuando se cumplan los requisitos legales que habilitan dicha transferencia, incluyendo la existencia de un nivel adecuado de protección en el país receptor, garantías adecuadas u otro mecanismo legalmente autorizado y, cuando corresponda, el consentimiento expreso del titular.",
  },
  CO: {
    enabled: true,
    text: "De conformidad con lo dispuesto en el artículo 26 de la Ley 1581 de 2012 y demás normas que la reglamenten, modifiquen o complementen, sus datos personales podrán ser transferidos a terceros ubicados en Colombia o en otros países, cuando ello resulte necesario para el cumplimiento de las finalidades previamente informadas y autorizadas. Las transferencias internacionales se realizarán únicamente cuando el país receptor proporcione un nivel adecuado de protección de datos personales o cuando resulte aplicable alguna de las excepciones, autorizaciones o mecanismos previstos por la normativa colombiana vigente.",
  },
};

const DISABLED_NOTICE: InternationalTransferNotice = { enabled: false, text: "" };

export function getInternationalTransferNotice(
  countryCode?: string | null
): InternationalTransferNotice {
  return INTERNATIONAL_TRANSFER_NOTICE_BY_COUNTRY[countryCode ?? ""] ?? DISABLED_NOTICE;
}
