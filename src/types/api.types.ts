import { ERROR_DICTIONARY } from "@/utils/parseApiError";
import { CampaignAudienceGender } from "./campaign.types";
import { ConsentStatus } from "./collectFormResponse.types";
import { UserRole } from "./user.types";

export interface APIError {
  code?: keyof typeof ERROR_DICTIONARY | (string & {});
  message?: string;
  status?: number;
}

export interface APIResponse<T = any> {
  data?: T;
  meta?: {
    totalCount?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
  summary?: Record<string, any>;
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

  // Tokens de campaña de consentimiento (formularios públicos)
  qct?: string; // Quick Consent Token (por persona)

  //for date range filtering
  startDate?: string;
  endDate?: string;

  // filtro de estado de consentimiento (respuestas de formularios)
  consentStatus?: ConsentStatus;

  //for calc audience
  sourceForms?: string;
  responseIds?: string;
  minAge?: number;
  maxAge?: number;
  gender?: CampaignAudienceGender;

  // for credits by month/year
  year?: number;
  month?: number;

  // for audit / actionLogs
  type?: string;
  targetModel?: string;
  searchUser?: string;

  // campaign deliveries audit
  status?: string;
  from?: string;
  to?: string;
}
