export const WIZARD_PHASE1_STEP_IDS = [
  "identity",
  "legal_representative",
  "dpo",
  "arco",
] as const;

export const WIZARD_PHASE2_STEP_IDS = [
  "rat_identity",
  "rat_legal",
  "rat_security",
  "rat_systems",
] as const;

export type WizardPhase1StepId = (typeof WIZARD_PHASE1_STEP_IDS)[number];
export type WizardPhase2StepId = (typeof WIZARD_PHASE2_STEP_IDS)[number];
export type WizardStepId = WizardPhase1StepId | WizardPhase2StepId;

export interface WizardIdentityAnswers {
  name?: string;
  nit?: string;
  countryCode?: string;
  publicContactEmail?: string;
  website?: string;
  regionName?: string;
  provinceName?: string;
  communeName?: string;
  address?: string;
}

export interface WizardLegalRepresentativeAnswers {
  managerName?: string;
  managerDocNumber?: string;
  managerPosition?: string;
  managerContactEmail?: string;
}

export interface WizardDpoAnswers {
  dataOfficerUserId?: string | null;
  authorizedPersonnelUserIds?: string[];
}

export interface WizardArcoAnswers {
  publicContactEmail?: string;
  rightsAttentionPhoneLine?: string;
  rightsAttentionUserIds?: string[];
}

export interface WizardRatIdentityAnswers {
  name?: string;
  description?: string;
  purposeId?: string;
  purposeDetail?: string;
}

export interface WizardRatLegalAnswers {
  legalBasis?: string;
  legalBasisJustification?: string;
  consentTemplateId?: string | null;
  dataCategories?: string[];
  dataSubjectCategories?: string[];
  dataSource?: string;
  nonDeliveryConsequences?: string;
}

export interface WizardRatSecurityAnswers {
  internalOwnerId?: string;
  retentionValue?: number;
  retentionUnit?: string;
  retentionStartEvent?: string;
  securityMeasures?: string[];
  internationalTransferOccurs?: boolean;
  internationalTransferCountry?: string;
  internationalTransferMechanism?: string;
  geolocationDuration?: string;
  geolocationSharedWithThirdParties?: boolean | null;
  geolocationThirdPartiesIdentity?: string;
}

export interface WizardRatSystemDraft {
  name: string;
  type: string;
  provider?: string;
  isOutsideChile?: boolean;
}

export interface WizardRatSystemsAnswers {
  systems?: WizardRatSystemDraft[];
}

export type WizardDraftAnswers = {
  identity?: WizardIdentityAnswers;
  legal_representative?: WizardLegalRepresentativeAnswers;
  dpo?: WizardDpoAnswers;
  arco?: WizardArcoAnswers;
  rat_identity?: WizardRatIdentityAnswers;
  rat_legal?: WizardRatLegalAnswers;
  rat_security?: WizardRatSecurityAnswers;
  rat_systems?: WizardRatSystemsAnswers;
};

export interface WizardStepStatus {
  id: WizardStepId;
  label: string;
  completed: boolean;
  phase: 1 | 2;
}

export interface WizardPhase3PolicySummary {
  id: string;
  name: string;
  sourceType?: string;
}

export interface WizardPhase3PolicyOptions {
  linkedPolicy: WizardPhase3PolicySummary | null;
  ratGeneratedPolicies: Array<{ id: string; name: string }>;
  hasLinkedRatGeneratedPolicy: boolean;
}

export interface WizardStatus {
  phase1Completed: boolean;
  phase2Completed: boolean;
  phase3Completed: boolean;
  phase4Completed: boolean;
  phase5Pending?: boolean;
  phase2TreatmentId?: string | null;
  phase3PolicyTemplateId?: string | null;
  phase3PolicyOptions?: WizardPhase3PolicyOptions | null;
  phase4CollectFormId?: string | null;
  lastAppliedAt?: string | null;
  phase2AppliedAt?: string | null;
  phase3AppliedAt?: string | null;
  phase4AppliedAt?: string | null;
  phase5AcknowledgedAt?: string | null;
  policySync?: WizardPolicySyncStatus | null;
  currentStepId: WizardStepId;
  initialSetupCompleted: boolean;
  steps: WizardStepStatus[];
  draft: WizardDraftAnswers;
}

export interface WizardPolicySyncStatus {
  isOutdated: boolean;
  treatmentId: string | null;
  currentRatVersion: number | null;
  baselineRatVersion: number | null;
  policyTemplateId: string | null;
  acknowledged: boolean;
}

export interface WizardPolicySyncBannerStatus extends WizardPolicySyncStatus {
  phase4Completed: boolean;
  pending: boolean;
}

export type FlowStepPhase1 = WizardPhase1StepId | "review";
export type FlowStepPhase2 = WizardPhase2StepId | "review";
export type FlowStep = FlowStepPhase1 | FlowStepPhase2;
