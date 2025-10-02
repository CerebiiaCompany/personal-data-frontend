import { ERROR_DICTIONARY } from "@/utils/parseApiError";

export interface APIError {
  code: keyof typeof ERROR_DICTIONARY;
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
  areaId?: string;
  roleId?: string;
  responseId?: string;
}
