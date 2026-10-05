// Item D-01/N-02/N-03/N-04/N-09 — Consentimiento Biométrico vía módulo de
// comunicaciones (OTP + hash SHA-256). Backend: biometricConsent.controller.ts.
import { DocType } from "./user.types";

export type ConsentDocumentVariant = "EMPLOYEE" | "CUSTOMER";
export type ConsentCodeStatus = "PENDING" | "VERIFIED" | "EXPIRED";

export interface ConsentRequestTitularInput {
  name: string;
  docType: DocType;
  docNumber: string;
  email: string;
}

export interface ConsentRequestListItem {
  id: string;
  variant: ConsentDocumentVariant;
  titularName: string;
  titularDocType: DocType;
  titularDocNumber: string;
  titularEmail: string;
  codeStatus: ConsentCodeStatus;
  codeExpiresAt: string;
  verifiedAt: string | null;
  /** SHA-256 del PDF confirmado — null mientras el titular no verifica el OTP. */
  documentSha256: string | null;
  createdAt: string;
}

export interface SendConsentRequestsResult {
  treatmentId: string;
  sent: { titularEmail: string; consentRequestId: string; emailSent: boolean }[];
}

export interface PublicConsentConfirmResult {
  status: "CONFIRMED";
  confirmedAt: string;
  documentSha256: string;
}

export const CONSENT_CODE_STATUS_LABELS: Record<ConsentCodeStatus, string> = {
  PENDING: "Pendiente",
  VERIFIED: "Confirmado",
  EXPIRED: "Código expirado",
};
