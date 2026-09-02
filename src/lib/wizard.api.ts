import { APIResponse } from "@/types/api.types";
import { WizardDraftAnswers, WizardPolicySyncBannerStatus, WizardStatus } from "@/types/wizard.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchWizardPolicySync(
  companyId: string
): Promise<APIResponse<WizardPolicySyncBannerStatus>> {
  return customFetch(`/companies/${companyId}/wizard/policy-sync`);
}

export async function fetchWizardStatus(companyId: string): Promise<APIResponse<WizardStatus>> {
  return customFetch(
    `/companies/${companyId}/wizard/status`,
    {},
    undefined,
    { retries: 2, retryDelayMs: 800, retryOnTimeout: true }
  );
}

export async function saveWizardStep(
  companyId: string,
  stepId: string,
  payload: WizardDraftAnswers[keyof WizardDraftAnswers] & { advance?: boolean }
): Promise<APIResponse<{ currentStepId: string; draft: WizardDraftAnswers; steps: WizardStatus["steps"] }>> {
  return customFetch(`/companies/${companyId}/wizard/step/${stepId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function applyWizardPhase1(companyId: string): Promise<APIResponse<WizardStatus>> {
  return customFetch(`/companies/${companyId}/wizard/apply`, {
    method: "POST",
  });
}

export async function applyWizardPhase2(companyId: string): Promise<APIResponse<WizardStatus>> {
  return customFetch(`/companies/${companyId}/wizard/apply-phase2`, {
    method: "POST",
  });
}

export async function applyWizardPhase3(
  companyId: string,
  payload?: { name?: string; forceCreate?: boolean }
): Promise<APIResponse<WizardStatus>> {
  return customFetch(`/companies/${companyId}/wizard/apply-phase3`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function linkWizardPhase3Policy(
  companyId: string,
  policyTemplateId: string
): Promise<APIResponse<WizardStatus>> {
  return customFetch(`/companies/${companyId}/wizard/link-phase3`, {
    method: "POST",
    body: JSON.stringify({ policyTemplateId }),
  });
}

export async function applyWizardPhase4CollectForm(
  companyId: string,
  payload?: { name?: string; description?: string }
): Promise<APIResponse<WizardStatus>> {
  return customFetch(`/companies/${companyId}/wizard/apply-phase4/collect-form`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function finishWizardPhase4(
  companyId: string,
  payload?: {
    skipTeam?: boolean;
    teamMember?: {
      name: string;
      lastName: string;
      username: string;
      companyRoleId?: string;
      position?: string;
      phone?: string;
      personalEmail?: string;
      docType?: string;
      docNumber?: string;
    };
  }
): Promise<APIResponse<WizardStatus & { tempPassword?: string }>> {
  return customFetch(`/companies/${companyId}/wizard/finish-phase4`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function acknowledgeWizardPolicySync(
  companyId: string
): Promise<APIResponse<WizardStatus>> {
  return customFetch(`/companies/${companyId}/wizard/acknowledge-policy-sync`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}
