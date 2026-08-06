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
  complianceScore: {
    value: number;
    criteria: {
      hasActiveRat: boolean;
      hasPublishedPolicy: boolean;
      hasDesignatedDataOfficer: boolean;
      hasNoOverdueArcoRequests: boolean;
    };
  };
}
