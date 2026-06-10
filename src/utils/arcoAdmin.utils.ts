import { getConsentStatusLabel } from "@/types/collectFormResponse.types";
import {
  ARCO_REQUEST_STATUS_LABELS,
  ARCO_REQUEST_TYPE_LABELS,
  ArcoDocType,
  ArcoRequestStatus,
} from "@/types/arco.types";
import { ArcoAccessConsentInfo, ArcoAssignedTo, ArcoAuditEvent, ArcoCompanyAuditEntry } from "@/types/arco.admin.types";
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

export function formatArcoAssignedTo(assignedTo?: ArcoAssignedTo | null): string {
  if (!assignedTo) return "Sin asignar";
  return [assignedTo.name, assignedTo.lastName].filter(Boolean).join(" ");
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
  const code = getArcoConsentStatusCode(consent) ?? consent.status;
  return getConsentStatusLabel(code);
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
    case "CLAIM_IN_PROGRESS":
      return "bg-blue-50 text-blue-800 border-blue-200/90";
    case "LEGAL_DISPUTE":
      return "bg-violet-50 text-violet-800 border-violet-200/90";
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

export function parseArcoAuditTypeLabel(type?: string | null): string {
  if (!type) return "Evento";
  const labels: Record<string, string> = {
    REQUEST_CREATED: "Solicitud creada",
    CREATED: "Solicitud creada",
    OFFICER_NOTIFIED: "Encargados notificados",
    STATUS_CHANGED: "Cambio de estado",
    STATUS_CHANGED_TO_IN_PROGRESS: "Marcada en proceso",
    STATUS_CHANGED_TO_REJECTED: "Rechazada",
    ASSIGNED: "Asignada a responsable",
    RESPONDED: "Solicitud respondida",
    RESPONDED_RESOLVED: "Respondida — resuelta",
    RESPONDED_REJECTED: "Respondida — rechazada",
  };
  return labels[type] ?? type.replaceAll("_", " ").toLowerCase();
}

/** Normaliza eventos del backend (eventType/at vs type). */
export function normalizeArcoAuditEvent<T extends Record<string, unknown>>(
  raw: T
): ArcoAuditEvent {
  const type =
    (raw.type as string | undefined) ??
    (raw.eventType as string | undefined) ??
    "";
  const at =
    (raw.at as string | undefined) ??
    (raw.createdAt as string | undefined) ??
    (raw.timestamp as string | undefined) ??
    "";
  const actorRaw = raw.actor as ArcoAuditEvent["actor"] | undefined;
  const actorName =
    actorRaw?.name ??
    (raw.actorName as string | undefined) ??
    (raw.userName as string | undefined);

  return {
    type,
    at,
    actor: {
      userId: actorRaw?.userId ?? (raw.userId as string | undefined),
      name: actorName ?? "Sistema",
      role: actorRaw?.role ?? (raw.actorRole as string | undefined),
    },
    meta: (raw.meta as Record<string, unknown> | undefined) ?? undefined,
  };
}

export function normalizeArcoCompanyAuditEntry(
  raw: Record<string, unknown>
): ArcoCompanyAuditEntry {
  const base = normalizeArcoAuditEvent(raw);
  return {
    ...base,
    requestId:
      (raw.requestId as string | undefined) ??
      (raw.request_id as string | undefined),
    docNumber: raw.docNumber as string | undefined,
    requestType: raw.requestType as ArcoCompanyAuditEntry["requestType"],
    requestStatus: raw.requestStatus as ArcoCompanyAuditEntry["requestStatus"],
  };
}

export function getArcoRequestId(item: { id?: string; _id?: string }): string {
  return item.id ?? item._id ?? "";
}

export function formatArcoAuditMetaLines(
  meta?: Record<string, unknown>
): string[] {
  if (!meta) return [];
  const lines: string[] = [];

  if (typeof meta.message === "string" && meta.message.trim()) {
    lines.push(meta.message.trim());
  }
  if (typeof meta.status === "string") {
    lines.push(`Estado: ${formatArcoStatusLabel(meta.status as ArcoRequestStatus)}`);
  }
  if (typeof meta.finalStatus === "string") {
    lines.push(
      `Resultado: ${formatArcoStatusLabel(meta.finalStatus as ArcoRequestStatus)}`
    );
  }
  if (typeof meta.assignedToName === "string") {
    lines.push(`Asignado a: ${meta.assignedToName}`);
  }
  if (typeof meta.respondedByName === "string") {
    lines.push(`Respondió: ${meta.respondedByName}`);
  }
  if (meta.daysUntilDue !== undefined && meta.daysUntilDue !== null) {
    const days = Number(meta.daysUntilDue);
    if (Number.isFinite(days)) {
      lines.push(
        days < 0
          ? `${Math.abs(days)} día(s) después del vencimiento`
          : days === 0
            ? "Resuelta el día del vencimiento"
            : `${days} día(s) antes del vencimiento`
      );
    }
  }
  if (typeof meta.docNumber === "string") {
    lines.push(`Documento: ${meta.docNumber}`);
  }

  return lines;
}

export const ARCO_AUDIT_EVENT_TYPE_OPTIONS = [
  { value: "REQUEST_CREATED", label: "Solicitud creada" },
  { value: "OFFICER_NOTIFIED", label: "Encargados notificados" },
  { value: "STATUS_CHANGED", label: "Cambio de estado" },
  { value: "ASSIGNED", label: "Asignación" },
  { value: "RESPONDED", label: "Respuesta enviada" },
] as const;
