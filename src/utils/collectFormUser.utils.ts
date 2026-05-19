import {
  CollectFormResponseUserPayload,
  PersonKind,
  UserGender,
} from "@/types/collectFormResponse.types";
import { DocType } from "@/types/user.types";

/** NIT sin dígito de verificación (ej. 900123456-7 → 900123456). */
export function parseNitDocNumber(value: string | number): number {
  const mainPart = String(value).trim().split("-")[0].replace(/\D/g, "");
  return Number(mainPart);
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

export function buildCollectFormUserPayload(
  user: RawUserFormData,
  personKind: PersonKind
): CollectFormResponseUserPayload {
  const phoneCountryCode = user.phoneCountryCode || "57";
  const phoneDigits =
    typeof user.phone === "string" ? user.phone.replace(/[^\d]/g, "") : "";
  const fullPhone = `${phoneCountryCode}${phoneDigits}`;

  const base = {
    email: user.email as string,
    phone: fullPhone,
  };

  if (personKind === "JURIDICA") {
    return {
      ...base,
      docType: "NIT",
      docNumber: parseNitDocNumber(user.docNumber ?? ""),
      razonSocial: user.razonSocial as string,
      name: user.name as string,
      lastName: user.lastName as string,
    };
  }

  return {
    ...base,
    docType: user.docType as DocType,
    docNumber: Number(user.docNumber),
    name: user.name as string,
    lastName: user.lastName as string,
    age: Number(user.age),
    gender: user.gender as UserGender,
  };
}
