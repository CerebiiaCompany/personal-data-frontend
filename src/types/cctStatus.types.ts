export type CctInvalidReason = "expired_or_invalid" | string;

export interface CctStatusRequest {
  cct: string;
  docType?: string;
  docNumber?: number;
}

/** Respuesta fase 1: solo token */
export interface CctStatusTokenOnlyData {
  tokenValid: boolean;
  reason?: CctInvalidReason;
  alreadyRegistered?: null;
}

/** Respuesta fase 2: token + identidad */
export interface CctStatusWithIdentityData {
  tokenValid: boolean;
  alreadyRegistered: boolean;
}

export type CctStatusData = CctStatusTokenOnlyData | CctStatusWithIdentityData;

export function isCctIdentityCheck(
  data: CctStatusData | undefined
): data is CctStatusWithIdentityData {
  return data != null && data.alreadyRegistered !== null && data.alreadyRegistered !== undefined;
}
