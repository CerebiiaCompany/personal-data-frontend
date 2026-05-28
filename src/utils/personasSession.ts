import { ArcoOtpChannel } from "@/types/arco.types";
import { PersonasCountryCode, PersonasDocTypeId } from "@/types/personas.types";

const STORAGE_KEY = "personas_verification";

export interface PersonasVerification {
  country: PersonasCountryCode;
  docType: PersonasDocTypeId;
  docNumber: string;
  sessionId?: string;
  channel?: ArcoOtpChannel;
  maskedEmail?: string;
  maskedPhone?: string;
  sessionToken?: string;
  tokenExpiresAt?: string;
  verifiedAt?: string;
}

export function savePersonasVerification(data: PersonasVerification): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getPersonasVerification(): PersonasVerification | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersonasVerification;
  } catch {
    return null;
  }
}

export function getArcoSessionToken(): string | null {
  return getPersonasVerification()?.sessionToken ?? null;
}

export function isArcoSessionValid(): boolean {
  const data = getPersonasVerification();
  if (!data?.sessionToken || !data.tokenExpiresAt) return false;
  return new Date(data.tokenExpiresAt) > new Date();
}

export function isPersonasVerified(): boolean {
  return isArcoSessionValid();
}

export function clearPersonasVerification(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
