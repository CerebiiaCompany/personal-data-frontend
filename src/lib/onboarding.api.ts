import { APIResponse } from "@/types/api.types";
import { customFetch } from "@/utils/customFetch";

export interface OnboardingStep {
  id:
    | "dataProtectionOfficer"
    | "firstTreatment"
    | "firstPolicyTemplate"
    | "firstCollectForm"
    | "inviteTeamMember";
  completed: boolean;
}

export interface OnboardingStatus {
  steps: OnboardingStep[];
  completedCount: number;
  totalCount: number;
  dismissed: boolean;
}

export async function fetchOnboardingStatus(
  companyId: string
): Promise<APIResponse<OnboardingStatus>> {
  return customFetch(`/companies/${companyId}/onboarding/status`);
}

export async function dismissOnboarding(
  companyId: string
): Promise<APIResponse<{ dismissed: boolean }>> {
  return customFetch(`/companies/${companyId}/onboarding/dismiss`, {
    method: "PATCH",
  });
}
