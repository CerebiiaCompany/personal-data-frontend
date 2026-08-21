import { APIResponse } from "@/types/api.types";
import { customFetch } from "@/utils/customFetch";

export interface InitialSetupManager {
  name?: string;
  docType?: string;
  docNumber?: string;
}

export interface InitialSetupCompany {
  name: string;
  nit: string;
  email: string;
  countryCode: string;
  manager: InitialSetupManager | null;
}

export interface InitialSetupStatus {
  completed: boolean;
  company: InitialSetupCompany;
}

export interface CompleteInitialSetupPayload {
  name: string;
  nit: string;
  email: string;
  countryCode: string;
  managerName: string;
  managerDocNumber: string;
}

export async function fetchInitialSetupStatus(
  companyId: string
): Promise<APIResponse<InitialSetupStatus>> {
  return customFetch(`/companies/${companyId}/initial-setup/status`);
}

export async function completeInitialSetup(
  companyId: string,
  data: CompleteInitialSetupPayload
): Promise<APIResponse<{ completed: boolean }>> {
  return customFetch(`/companies/${companyId}/initial-setup/complete`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
