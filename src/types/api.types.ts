import { ERROR_DICTIONARY } from "@/utils/parseApiError";
import { CampaignAudienceGender } from "./campaign.types";
import { UserRole } from "./user.types";

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
  active?: boolean;
  campaignId?: string;
  search?: string;
  role?: UserRole;
  expiresIn?: string | number; // Para parámetros de query como expiresIn

  //for date range filtering
  startDate?: string;
  endDate?: string;

  //for calc audience
  sourceForms?: string;
  minAge?: number;
  maxAge?: number;
  gender?: CampaignAudienceGender;

  // for credits by month/year
  year?: number;
  month?: number;
}
