export type ConsentExportJobStatus =
  | "pending"
  | "active"
  | "completed"
  | "failed";

export interface ConsentExportRequest {
  collectFormId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ConsentExportCreateResult {
  jobId: string;
  status: "pending";
}

export interface ConsentExportJobResult {
  jobId: string;
  status: ConsentExportJobStatus;
  progress?: number;
  downloadUrl?: string;
  filename?: string;
  totalRows?: number;
  expiresIn?: number;
  error?: string;
  message?: string;
}
