import { Plan } from "./plan.types";
import { DocType } from "./user.types";

export type CompanyManagerDocType = "CC";
export type PlanStatus = "ACTIVE" | "INACTIVE";

export interface CreateCompany {
  name: string;
  nit: string;
  manager: {
    name: string;
    docType: DocType;
    docNumber: string;
  };
  email: string;
  phone: string;
  planId: string;
}

export interface Company extends CreateCompany {
  _id: string;
  plan: Pick<Plan, "_id" | "name" | "description" | "monthlyCredits">;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyDataOfficer {
  _id: string;
  name: string;
  lastName: string;
  username: string;
  position?: string;
  phone?: string;
  personalEmail?: string;
  companyUserData?: {
    position?: string;
    phone?: string;
    personalEmail?: string;
  };
}

export interface CompanyCreditsCurrentMonth {
  creditsUsed: number;
  month: number;
  year: number;
  period: string;
}

export interface CompanyCreditsPricing {
  smsPricePerMessage: number;
  emailPricePerMessage: number;
}

// --- Company Profile Types ---

export interface CompanyDataOfficerProfile {
  full_name?: string;
  position?: string;
  email?: string;
  phone?: string;
  responsibility_description?: string;
}

// Populated user summary returned in profile virtuals
export interface CompanyUserSummary {
  _id: string;
  name: string;
  lastName: string;
  username: string;
  companyUserData?: {
    position?: string;
    phone?: string;
    personalEmail?: string;
  };
}

export interface ProcessingPurpose {
  data_type?: string;
  purpose?: string;
}

export interface PersonalDataCollected {
  employees_data?: boolean;
  suppliers_data?: boolean;
  clients_data?: boolean;
  web_users_data?: boolean;
  commercial_prospects_data?: boolean;
  financial_data?: boolean;
  sensitive_data?: string[];
  other_sensitive_data?: string;
}

export interface InternationalTransfers {
  servers_outside_country?: boolean;
  third_party_transfers?: boolean;
  transfer_details?: string;
}

export interface InternalRegulations {
  has_internal_policies?: boolean;
  documents_description?: string;
  attachments?: string[];
}

export interface SpecialObservations {
  minor_data_processing?: boolean;
  biometric_data_usage?: boolean;
  video_surveillance?: boolean;
  third_party_integrations?: boolean;
  additional_observations?: string;
}

export interface CompanyProfile {
  _id: string;
  name?: string;
  nit?: string;
  email?: string;
  phone?: string;
  mainAddress?: string;
  city?: string;
  department?: string;
  phoneNumbers?: string[];
  website?: string;
  manager?: {
    name?: string;
    docType?: string;
    docNumber?: string;
    position?: string;
    contactEmail?: string;
  };
  companyDataOfficer?: CompanyDataOfficerProfile;
  // Authorized personnel: populated user objects
  authorizedPersonnel?: CompanyUserSummary[];
  economicActivityDescription?: string;
  personalDataCollected?: PersonalDataCollected;
  processingPurposes?: ProcessingPurpose[];
  internationalTransfers?: InternationalTransfers;
  // Rights attention: populated user objects + phone line
  rightsAttentionUsers?: CompanyUserSummary[];
  rightsAttentionPhoneLine?: string;
  internalRegulations?: InternalRegulations;
  specialObservations?: SpecialObservations;
}