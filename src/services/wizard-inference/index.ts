export type {
  InferredTreatment,
  LegalBasisAssignment,
  LegalBasisCode,
  LegalBasisRefinementRule,
  LegalBasisRuleRow,
  FinalidadTemplateRow,
  RetentionRuleRow,
  SecurityMeasureItem,
  TreatmentMappingRule,
  WizardAnswerMap,
  WizardInferenceFlags,
  WizardInferenceInput,
  WizardInferenceResult,
  WizardInferenceRuleSet,
  WizardInferenceRulesResponse,
  WizardInferenceSystemInput,
} from "./types";

export { WizardInferenceService, wizardInferenceService } from "./WizardInferenceService";
export type { WizardInferenceContext } from "./WizardInferenceService";
export { toWizardTreatment, formatLegalBasis, formatSecurityMeasures } from "./toWizardTreatment";
export { buildRuleSet } from "./buildRuleSet";
