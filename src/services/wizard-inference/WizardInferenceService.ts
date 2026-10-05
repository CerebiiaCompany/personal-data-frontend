import { buildWizardInferenceFlags } from "./buildFlags";
import { evaluateTrigger } from "./engine/triggerEvaluator";
import { resolveInternationalTransfer } from "./engine/internationalTransfer";
import { resolveLegalBasis } from "./engine/legalBasisResolver";
import { injectSecurityMeasures } from "./engine/securityInjector";
import { resolveRetention } from "./engine/retentionInjector";
import { isUncertain, resolvePendingReview } from "./engine/pendingReview";
import { resolveFinalidad } from "./engine/finalidadResolver";
import { InferredTreatment, WizardInferenceInput, WizardInferenceResult, WizardInferenceRuleSet } from "./types";

/** Item Especificación de Finalidad — datos que el motor no puede derivar de las reglas ni de las respuestas. */
export interface WizardInferenceContext {
  companyName: string;
  /** code -> label, ver TreatmentPurposeCatalog / fetchTreatmentPurposes. */
  purposeNivel1Labels: Map<string, string>;
}

/**
 * Motor de Inferencia del Wizard (REQ v2.2, §§4-7).
 *
 * Recibe las respuestas de Bloques 1-4 y construye en memoria el RAT
 * completo para el Bloque 5. Las reglas viven en BD (wizard_treatment_rules
 * y tablas relacionadas — ver GET /companies/:id/wizard-risk/rules y
 * buildRuleSet.ts), pasadas explícitas en `rules`; este servicio solo
 * orquesta los cuatro pasos en orden estricto y no conoce Prisma/fetch.
 */
export class WizardInferenceService {
  infer(input: WizardInferenceInput, rules: WizardInferenceRuleSet, context: WizardInferenceContext): WizardInferenceResult {
    const flags = buildWizardInferenceFlags(input);
    const mapped = this.mapTreatments(input, flags, rules);
    const withBasis = mapped.map((row) => this.assignLegalBasis(row, flags, rules));
    const withSecurity = withBasis.map((row) => this.injectSecurity(row, input, flags, rules));
    const withRetention = withSecurity.map((row) => this.assignRetention(row, rules));
    const treatments = withRetention.map((row) => this.assignFinalidad(row, rules, context));

    return { flags, treatments };
  }

  /**
   * Paso 1 — Sección 4: instancia RATs por respuestas "Sí" y prellena
   * datos principales, sensible y transferencia internacional.
   */
  private mapTreatments(
    input: WizardInferenceInput,
    flags: WizardInferenceResult["flags"],
    rules: WizardInferenceRuleSet
  ): InferredTreatment[] {
    const matchedByTrigger = rules.treatmentRules.filter((rule) => evaluateTrigger(rule.trigger, input, flags));

    // Item N-14 — reglas cuyo trigger normal NO dispara porque la pregunta
    // se respondió con incertidumbre, pero que igual deben generarse (ver
    // rule.forceIncludeOnUncertaintyKey). No duplica una regla que ya
    // matcheó por su trigger normal.
    const matchedIds = new Set(matchedByTrigger.map((rule) => rule.id));
    const forcedByUncertainty = rules.treatmentRules.filter((rule) => {
      if (matchedIds.has(rule.id)) return false;
      const questionKey = rule.forceIncludeOnUncertaintyKey;
      return Boolean(questionKey) && isUncertain(input.answers, questionKey!);
    });

    const matched = [...matchedByTrigger, ...forcedByUncertainty];
    const suppressed = new Set(matched.flatMap((rule) => rule.suppresses ?? []));

    return matched
      .filter((rule) => !suppressed.has(rule.id))
      .map((rule) => {
        const transfer = resolveInternationalTransfer(rule.internationalTransfer, flags);
        const pendingReview = resolvePendingReview(rule, input.answers, input.systems);
        return {
          id: rule.id,
          name: rule.name,
          sourceKeys: rule.sourceKeys,
          tags: rule.tags,
          primaryData: rule.primaryData,
          isSensitive: rule.isSensitive,
          sensitiveLegalRef: rule.sensitiveLegalRef,
          internationalTransfer: transfer.value,
          internationalTransferReason: transfer.reason,
          generatesPendingReview: pendingReview.generatesPendingReview,
          pendingReviewQuestionKey: pendingReview.pendingReviewQuestionKey,
          legalBasis: {
            code: "INTERES_LEGITIMO",
            label: "",
            article: "",
            restriction: "",
            locked: false,
          },
          securityMeasures: [],
          retention: {
            durationLabel: "",
            durationYears: null,
            durationDays: null,
            startEvent: "",
            legalFoundation: "",
            canReduce: true,
          },
        };
      });
  }

  /**
   * Paso 2 — Sección 5: prioridad Obligación legal > Contrato >
   * Consentimiento (sensibles/marketing) > Interés legítimo.
   */
  private assignLegalBasis(
    treatment: InferredTreatment,
    flags: WizardInferenceResult["flags"],
    rules: WizardInferenceRuleSet
  ): InferredTreatment {
    return {
      ...treatment,
      legalBasis: resolveLegalBasis(
        { id: treatment.id, tags: treatment.tags, isSensitive: treatment.isSensitive },
        flags,
        rules
      ),
    };
  }

  /**
   * Paso 3 — Sección 6: medidas innegociables según flags globales B1/B2/B4.
   */
  private injectSecurity(
    treatment: InferredTreatment,
    input: WizardInferenceInput,
    flags: WizardInferenceResult["flags"],
    rules: WizardInferenceRuleSet
  ): InferredTreatment {
    return {
      ...treatment,
      securityMeasures: injectSecurityMeasures(
        {
          id: treatment.id,
          tags: treatment.tags,
          isSensitive: treatment.isSensitive,
          internationalTransfer: treatment.internationalTransfer,
        },
        input,
        flags,
        rules.securityRules
      ),
    };
  }

  /**
   * Paso 4 — Sección 7: duración numérica + evento que inicia el conteo.
   */
  private assignRetention(treatment: InferredTreatment, rules: WizardInferenceRuleSet): InferredTreatment {
    return {
      ...treatment,
      retention: resolveRetention(treatment.id, rules.retentionByTreatment, rules.defaultRetention),
    };
  }

  /**
   * Paso 5 — Especificación de Finalidad (SMG, 02-sep-2026): Nivel 1/2/3.
   * Sin fila en wizard_finalidad_templates (hoy: decisiones_automatizadas,
   * menores — ver comentario en el seed), el tratamiento queda sin estos
   * campos, igual que antes de esta migración.
   */
  private assignFinalidad(
    treatment: InferredTreatment,
    rules: WizardInferenceRuleSet,
    context: WizardInferenceContext
  ): InferredTreatment {
    return {
      ...treatment,
      ...resolveFinalidad(
        treatment.id,
        treatment.primaryData,
        context.companyName,
        rules.finalidadByTreatment,
        context.purposeNivel1Labels
      ),
    };
  }
}

export const wizardInferenceService = new WizardInferenceService();
