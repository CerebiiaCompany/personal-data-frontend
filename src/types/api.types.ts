export interface APIError {
  code: string;
  message?: string;
}

export interface APIResponse<T = any> {
  data?: T;
  meta?: {
    totalCount?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
  error?: APIError;
}

export interface QueryParams {
  companyId?: string;
  page?: number;
  pageSize?: number;
  id?: string;
}
