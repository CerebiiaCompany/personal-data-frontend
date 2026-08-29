import {
  CollectFormResponse,
  isJuridicaDocType,
  PersonKind,
  UpdateCollectFormResponseInput,
  UserGender,
} from "@/types/collectFormResponse.types";
import { DocType, getDocTypeOptionsByCountry, getJuridicaDocType } from "@/types/user.types";
import { parseNitDocNumber } from "@/utils/collectFormUser.utils";
import { isValidRut, normalizeRut } from "@/utils/rutValidator";

/** Detecta valores anonimizados que el backend devuelve con asteriscos (ej. ju***@g****.com). */
export function isMaskedPersonalData(value?: string | null): boolean {
  return Boolean(value && value.includes("*"));
}

export interface EditableCollectFormResponseFormValues {
  personKind: PersonKind;
  withoutDocument: boolean;
  docType: string;
  docNumber: string;
  name: string;
  lastName: string;
  razonSocial: string;
  email: string;
  phone: string;
  age: string;
  gender?: UserGender;
}

/** Normaliza género del API para el formulario de edición (campo opcional). */
export function normalizeEditableGender(
  value?: string | null
): UserGender | undefined {
  if (value == null || value === "") return undefined;
  const normalized = String(value).trim().toUpperCase();
  if (normalized === "M" || normalized === "MALE") return "MALE";
  if (normalized === "F" || normalized === "FEMALE") return "FEMALE";
  if (normalized === "OTHER") return "OTHER";
  return undefined;
}

export function responseToEditableFormValues(
  response: CollectFormResponse
): EditableCollectFormResponseFormValues {
  const user = response.user;
  // Item CHK-138 (sprint pre go-live 2026-08-28): RUT (CL) no distingue
  // natural/jurídica por formato como NIT/CC — el flag explícito isJuridica
  // (guardado desde la creación, ver buildCollectFormUserPayload) es la
  // fuente de verdad cuando está presente; docType queda como fallback para
  // respuestas legacy sin el flag.
  const explicitIsJuridica: boolean | undefined =
    (user as { isJuridica?: boolean; userIsJuridica?: boolean }).isJuridica ??
    (user as { isJuridica?: boolean; userIsJuridica?: boolean }).userIsJuridica;
  const isJuridica = explicitIsJuridica ?? isJuridicaDocType(user.docType);
  const hasDoc = Boolean(user.docType && user.docNumber != null);

  return {
    personKind: isJuridica ? "JURIDICA" : "NATURAL",
    withoutDocument: !hasDoc,
    docType: user.docType || "CC",
    docNumber: user.docNumber != null ? String(user.docNumber) : "",
    name: user.name || "",
    lastName: user.lastName || "",
    razonSocial: user.razonSocial || "",
    email: user.email || "",
    phone: user.phone || "",
    age: user.age != null ? String(user.age) : "",
    gender: normalizeEditableGender(user.gender),
  };
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function resolveDocFields(
  values: EditableCollectFormResponseFormValues,
  companyCountryCode?: string | null
): {
  docType?: string;
  docNumber?: string | number;
} {
  if (values.withoutDocument) return {};

  const isChile = companyCountryCode === "CL";

  if (values.personKind === "JURIDICA") {
    return {
      docType: getJuridicaDocType(companyCountryCode),
      docNumber: isChile
        ? normalizeRut(values.docNumber || "")
        : parseNitDocNumber(values.docNumber || ""),
    };
  }

  return {
    docType: (values.docType ||
      getDocTypeOptionsByCountry(companyCountryCode).defaultValue) as DocType,
    docNumber: isChile
      ? normalizeRut(values.docNumber || "")
      : Number(String(values.docNumber || "").replace(/\D/g, "")),
  };
}

export function buildCollectFormResponseUpdatePayload(
  current: EditableCollectFormResponseFormValues,
  initial: EditableCollectFormResponseFormValues,
  companyCountryCode?: string | null
): UpdateCollectFormResponseInput | null {
  const payload: UpdateCollectFormResponseInput = {};
  let hasChanges = false;

  const setField = <K extends keyof UpdateCollectFormResponseInput>(
    key: K,
    value: UpdateCollectFormResponseInput[K]
  ) => {
    payload[key] = value;
    hasChanges = true;
  };

  const trimmedName = current.name.trim();
  if (
    trimmedName !== initial.name.trim() &&
    !isMaskedPersonalData(trimmedName) &&
    trimmedName !== ""
  ) {
    setField("name", trimmedName);
  }

  const trimmedLastName = current.lastName.trim();
  if (
    trimmedLastName !== initial.lastName.trim() &&
    !isMaskedPersonalData(trimmedLastName) &&
    trimmedLastName !== ""
  ) {
    setField("lastName", trimmedLastName);
  }

  const trimmedEmail = current.email.trim();
  if (
    trimmedEmail !== initial.email.trim() &&
    !isMaskedPersonalData(trimmedEmail) &&
    trimmedEmail !== ""
  ) {
    setField("email", trimmedEmail);
  }

  const currentPhone = normalizePhone(current.phone);
  const initialPhone = normalizePhone(initial.phone);
  if (
    currentPhone !== initialPhone &&
    !isMaskedPersonalData(current.phone) &&
    currentPhone !== ""
  ) {
    setField("phone", currentPhone);
  }

  const currentDoc = resolveDocFields(current, companyCountryCode);
  const initialDoc = resolveDocFields(initial, companyCountryCode);

  if (current.withoutDocument !== initial.withoutDocument) {
    if (!current.withoutDocument && !isMaskedPersonalData(current.docNumber)) {
      if (currentDoc.docType) setField("docType", currentDoc.docType);
      if (isValidDocNumber(currentDoc.docNumber)) {
        setField("docNumber", currentDoc.docNumber!);
      }
    }
  } else if (!current.withoutDocument && !isMaskedPersonalData(current.docNumber)) {
    if (currentDoc.docType !== initialDoc.docType) {
      setField("docType", currentDoc.docType);
    }
    if (
      String(currentDoc.docNumber ?? "") !== String(initialDoc.docNumber ?? "") &&
      isValidDocNumber(currentDoc.docNumber)
    ) {
      setField("docNumber", currentDoc.docNumber!);
    }
  }

  const trimmedRazonSocial = current.razonSocial.trim();
  if (current.personKind === "JURIDICA") {
    if (
      trimmedRazonSocial !== initial.razonSocial.trim() &&
      !isMaskedPersonalData(trimmedRazonSocial)
    ) {
      setField("razonSocial", trimmedRazonSocial || null);
    }
  } else if (initial.personKind === "JURIDICA" && initial.razonSocial.trim()) {
    setField("razonSocial", null);
  }

  if (current.personKind === "NATURAL") {
    const currentAge = current.age.trim();
    const initialAge = initial.age.trim();
    if (currentAge !== initialAge) {
      if (currentAge) {
        const ageNum = Number(currentAge);
        if (!Number.isNaN(ageNum)) setField("age", ageNum);
      }
    }

    if (current.gender !== initial.gender && current.gender) {
      setField("gender", current.gender);
    }
  }

  return hasChanges ? payload : null;
}

function isValidDocNumber(value?: string | number): boolean {
  if (value == null || value === "") return false;
  const num = Number(value);
  return !Number.isNaN(num) && num > 0;
}

export type EditCollectFormFieldErrors = Partial<
  Record<keyof EditableCollectFormResponseFormValues, string>
>;

function fieldChanged(
  current: string,
  initial: string
): boolean {
  return current.trim() !== initial.trim();
}

/** Validación en tiempo real para el formulario de edición. */
export function validateEditableCollectFormResponse(
  current: EditableCollectFormResponseFormValues,
  initial: EditableCollectFormResponseFormValues,
  companyCountryCode?: string | null
): {
  valid: boolean;
  errors: EditCollectFormFieldErrors;
  hasChanges: boolean;
  canSave: boolean;
} {
  const errors: EditCollectFormFieldErrors = {};
  const isChile = companyCountryCode === "CL";
  const hasChanges =
    buildCollectFormResponseUpdatePayload(current, initial, companyCountryCode) !== null;

  const flagMaskedPartial = (
    key: keyof EditableCollectFormResponseFormValues,
    label: string
  ) => {
    const val = String(current[key] ?? "").trim();
    const init = String(initial[key] ?? "").trim();
    if (fieldChanged(val, init) && isMaskedPersonalData(val)) {
      errors[key] = `Escribe el valor completo de ${label} para modificarlo`;
    }
  };

  flagMaskedPartial("name", "nombres");
  flagMaskedPartial("lastName", "apellidos");
  flagMaskedPartial("email", "correo");
  flagMaskedPartial("phone", "teléfono");
  flagMaskedPartial("docNumber", "documento");
  flagMaskedPartial("razonSocial", "razón social");

  const email = current.email.trim();
  if (
    fieldChanged(email, initial.email) &&
    !isMaskedPersonalData(email) &&
    email !== ""
  ) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Correo electrónico inválido";
    }
  }

  const phone = normalizePhone(current.phone);
  const initialPhoneNorm = normalizePhone(initial.phone);
  if (
    phone !== initialPhoneNorm &&
    !isMaskedPersonalData(current.phone) &&
    phone !== ""
  ) {
    if (phone.length < 7) {
      errors.phone = "Teléfono inválido (mínimo 7 dígitos)";
    }
  }

  if (!current.withoutDocument && !isMaskedPersonalData(current.docNumber)) {
    const docChanged = fieldChanged(current.docNumber, initial.docNumber);
    const docTypeChanged = current.docType !== initial.docType;

    if (docChanged || docTypeChanged || current.withoutDocument !== initial.withoutDocument) {
      const rawDoc = current.docNumber.trim();
      if (!rawDoc) {
        errors.docNumber = "El número de documento es obligatorio";
      } else if (isChile) {
        // Item CHK-138: RUT es alfanumérico (dígito verificador "K") — no
        // pasa por el strip de no-dígitos que usa el resto de tipos.
        if (!isValidRut(rawDoc)) {
          errors.docNumber = "RUT inválido (dígito verificador incorrecto)";
        }
      } else {
        const docDigits = rawDoc.replace(/\D/g, "");
        if (!docDigits) {
          errors.docNumber = "El número de documento es obligatorio";
        } else {
          const docNum =
            current.personKind === "JURIDICA"
              ? parseNitDocNumber(current.docNumber)
              : Number(docDigits);
          if (!isValidDocNumber(docNum)) {
            errors.docNumber = "Número de documento inválido";
          }
        }
      }
    }
  }

  if (current.personKind === "JURIDICA" && !current.withoutDocument) {
    const rs = current.razonSocial.trim();
    if (
      fieldChanged(rs, initial.razonSocial) &&
      !isMaskedPersonalData(rs) &&
      rs === ""
    ) {
      errors.razonSocial = "La razón social es obligatoria";
    }
  }

  const age = current.age.trim();
  if (age) {
    const ageNum = Number(age);
    if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
      errors.age = "Edad inválida (1-150)";
    }
  }

  const valid = Object.keys(errors).length === 0;
  const canSave = valid && hasChanges;

  return { valid, errors, hasChanges, canSave };
}
