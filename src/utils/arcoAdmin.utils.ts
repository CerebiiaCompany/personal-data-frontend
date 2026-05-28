import {
  ARCO_REQUEST_STATUS_LABELS,
  ARCO_REQUEST_TYPE_LABELS,
  ArcoDocType,
  ArcoRequestStatus,
} from "@/types/arco.types";
import { ArcoAccessConsentInfo } from "@/types/arco.admin.types";
import { formatDateToString } from "@/utils/date.utils";

export const ARCO_DOC_TYPE_LABELS: Record<ArcoDocType, string> = {
  CC: "Cédula de ciudadanía",
  TI: "Tarjeta de identidad",
  NIT: "NIT",
  OTHER: "Otro",
};

export function formatArcoDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const date = formatDateToString({ date: d });
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${date} ${hours}:${minutes}`;
}

export function formatArcoDate(iso?: string): string {
  if (!iso) return "—";
  return formatDateToString({ date: iso });
}

export function isArcoRequestOverdue(
  dueDate: string,
  status: ArcoRequestStatus
): boolean {
  if (status === "RESOLVED" || status === "REJECTED") return false;
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function getArcoDaysUntilDue(dueDate: string): number | null {
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getArcoResolutionDays(
  createdAt: string,
  resolvedAt?: string
): number | null {
  if (!resolvedAt) return null;
  const start = new Date(createdAt).getTime();
  const end = new Date(resolvedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

export function formatArcoRequestLabel(type: keyof typeof ARCO_REQUEST_TYPE_LABELS) {
  return ARCO_REQUEST_TYPE_LABELS[type];
}

export function formatArcoStatusLabel(status: ArcoRequestStatus) {
  return ARCO_REQUEST_STATUS_LABELS[status];
}

export function getArcoConsentStatusCode(
  consent: ArcoAccessConsentInfo
): string | null {
  if (consent.statusCode !== undefined) {
    return consent.statusCode;
  }
  const legacy = consent.status;
  if (!legacy || legacy === "UNKNOWN") return null;
  return legacy;
}

export function getArcoConsentStatusLabel(consent: ArcoAccessConsentInfo): string {
  if (consent.statusLabel?.trim()) return consent.statusLabel.trim();
  if (consent.status === "ACTIVE") return "Consentimiento activo y vigente";
  if (consent.status === "REVOKED") return "Consentimiento revocado";
  if (consent.status === "PENDING") return "Consentimiento pendiente";
  return consent.status ?? "Sin información de consentimiento";
}

export function isArcoConsentLegacyRecord(consent: ArcoAccessConsentInfo): boolean {
  return getArcoConsentStatusCode(consent) == null;
}

export function getArcoConsentBadgeClass(
  statusCode: string | null | undefined
): string {
  if (statusCode == null) {
    return "bg-amber-50 text-amber-900 border-amber-200/90";
  }
  switch (statusCode) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-800 border-emerald-200/90";
    case "REVOKED":
      return "bg-red-50 text-red-800 border-red-200/90";
    case "PENDING":
      return "bg-amber-50 text-amber-800 border-amber-200/90";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200/90";
  }
}

/** Origen registrado en sistema al dar consentimiento (no requiere edición del oficial). */
export function isArcoDataOriginFromSystem(
  dataOriginRaw?: string | null
): boolean {
  return dataOriginRaw != null && dataOriginRaw !== "";
}

export function parseArcoAuditTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    CREATED: "Solicitud creada",
    STATUS_CHANGED_TO_IN_PROGRESS: "Marcada en proceso",
    RESPONDED_RESOLVED: "Respondida — resuelta",
    RESPONDED_REJECTED: "Respondida — rechazada",
    STATUS_CHANGED_TO_REJECTED: "Rechazada",
  };
  return labels[type] ?? type.replaceAll("_", " ").toLowerCase();
}
