import {
  CollectFormResponseUserPayload,
  PersonKind,
  UserGender,
} from "@/types/collectFormResponse.types";
import { DocType, getJuridicaDocType } from "@/types/user.types";
import { normalizeRut } from "@/utils/rutValidator";

/** NIT sin dígito de verificación (ej. 900123456-7 → 900123456). */
export function parseNitDocNumber(value: string | number): number {
  const mainPart = String(value).trim().split("-")[0].replace(/\D/g, "");
  return Number(mainPart);
}

/**
 * Número de documento de persona natural (Colombia / tipos numéricos).
 * CC/TI/OTHER se envían como número. Si viene con guion (legacy), se toma
 * la parte izquierda — no usar para RUT chileno.
 */
function parseNaturalDocNumber(value: string | number | undefined): number {
  const str = String(value ?? "").trim();
  return str.includes("-") ? parseNitDocNumber(str) : Number(str);
}

type RawUserFormData = {
  docType?: string;
  docNumber?: string | number;
  name?: string;
  lastName?: string;
  age?: string | number;
  gender?: UserGender;
  razonSocial?: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
};

function resolveDocNumber(
  docType: string | undefined,
  raw: string | number | undefined,
  companyCountryCode?: string | null
): string | number {
  const usesRut =
    companyCountryCode === "CL" || docType === "RUT" || docType === "CI";
  if (usesRut) {
    return normalizeRut(String(raw ?? ""));
  }
  if (docType === "NIT") {
    return parseNitDocNumber(raw ?? "");
  }
  return parseNaturalDocNumber(raw);
}

export function buildCollectFormUserPayload(
  user: RawUserFormData,
  personKind: PersonKind,
  companyCountryCode?: string | null
): CollectFormResponseUserPayload {
  const phoneCountryCode =
    user.phoneCountryCode || (companyCountryCode === "CL" ? "56" : "57");
  const phoneDigits =
    typeof user.phone === "string" ? user.phone.replace(/[^\d]/g, "") : "";
  const fullPhone = `${phoneCountryCode}${phoneDigits}`;

  const base = {
    email: user.email as string,
    phone: fullPhone,
  };

  if (personKind === "JURIDICA") {
    const docType = getJuridicaDocType(companyCountryCode);
    return {
      ...base,
      docType,
      docNumber: resolveDocNumber(docType, user.docNumber, companyCountryCode),
      razonSocial: user.razonSocial as string,
      name: user.name as string,
      lastName: user.lastName as string,
    };
  }

  return {
    ...base,
    docType: user.docType as DocType,
    docNumber: resolveDocNumber(
      user.docType,
      user.docNumber,
      companyCountryCode
    ),
    name: user.name as string,
    lastName: user.lastName as string,
    age: Number(user.age),
    gender: user.gender as UserGender,
  };
}
