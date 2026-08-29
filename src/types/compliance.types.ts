/**
 * Fase 1 PRD v2.2 item C (RF-33 a RF-35) — Dashboard de Cumplimiento.
 * Contrato alineado 1:1 con compliance.controller.ts (backend).
 */

export interface ComplianceArcoAlert {
  id: string;
  docType: string;
  docNumber: string;
  requestType: string;
  dueDate: string;
}

/** Item PLAZ-005 — fila completa de una solicitud ARCO abierta, para /admin/plazos. */
export interface ComplianceArcoActiveRequest {
  id: string;
  docType: string;
  docNumber: string;
  requestType: string;
  status: "PENDING" | "IN_PROGRESS";
  dueDate: string;
  createdAt: string;
  assignedToId: string | null;
  assignedTo: { id: string; name: string; lastName: string } | null;
}

export interface ComplianceDashboard {
  treatments: {
    total: number;
    active: number;
    activePercentage: number;
  };
  arcoRequests: {
    open: number;
    overdue: number;
    resolvedThisMonth: number;
    dueSoon: ComplianceArcoAlert[];
    withoutDpo: number;
    active: ComplianceArcoActiveRequest[];
  };
  alerts: {
    noDpoAssigned: { count: number; message: string } | null;
  };
  consents: {
    active: number;
    revoked: number;
  };
  // Item CHK-093 (sprint pre go-live 2026-08-28): motor de 11 criterios
  // (C-01 a C-11) en 3 dimensiones ponderadas — reemplaza los 4 booleanos
  // de igual peso que tenía antes.
  complianceScore: {
    score: number;
    category: string;
    dimensions: {
      A: { score: number; label: string };
      B: { score: number; label: string };
      C: { score: number; label: string };
    };
    criteria: { code: string; score: number; description: string }[];
  };
}
