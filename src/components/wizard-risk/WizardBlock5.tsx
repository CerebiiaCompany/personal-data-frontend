"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWizardContext } from "@/contexts/WizardContext";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useOwnCompanyStore } from "@/store/useOwnCompanyStore";
import { getWizardBlockStartQuestion } from "@/constants/wizardBlocks";
import { getWizardBlockQuestionPath, WIZARD_COMPLETION_PATH } from "@/utils/wizardRoutes";
import { inferTreatmentsFromAnswers, mergeInferredTreatments } from "@/utils/wizardInference";
import { fetchWizardInferenceRules } from "@/lib/wizardSession.api";
import { fetchTreatmentPurposes } from "@/lib/treatment.api";
import { buildRuleSet } from "@/services/wizard-inference";
import TreatmentSummary from "./TreatmentSummary";
import WizardBiometricConsentStep from "./WizardBiometricConsentStep";
import DpoForm from "./DpoForm";

const BLOCK_NUM = 5;

interface WizardBlock5Props {
  /** Item N-15 — status real de la sesión (ver useWizardSession), no state.status. */
  sessionStatus?: string;
}

/**
 * Bloque 5 — validación de tratamientos + consentimiento biométrico (C-01) +
 * designación del DPO. Tres slots de currentQuestion: resumen editable,
 * explicación OTP/Art. 16, formulario DPO.
 *
 * Item N-15 — en una sesión EDITING (reabierta desde COMPLETED para
 * corregir Bloques 1 a 4) el paso biométrico y el DPO NO se reabren:
 * "Siguiente" en la validación de tratamientos va directo a
 * /wizard/finalizacion, que en ese status llama a reopen/confirm en vez de
 * confirm (ver ConfirmationSummary.tsx).
 */
export default function WizardBlock5({ sessionStatus }: WizardBlock5Props) {
  const router = useRouter();
  const companyId = useActiveCompanyId();
  const companyName = useOwnCompanyStore((s) => s.company?.name);
  const { state, setTreatments, setCurrentQuestion, setDpoForm, setLoading } = useWizardContext();
  const isEditing = sessionStatus === "EDITING";
  const blockStartQuestion = getWizardBlockStartQuestion(BLOCK_NUM, state.answers);
  const localSlot = state.currentQuestion - blockStartQuestion;
  const showBiometricConsent = !isEditing && localSlot === 1;
  const showDpo = !isEditing && localSlot >= 2;
  const seededRef = useRef(false);

  // Item wizard_treatment_rules (auditoría externa, 2026-09-08) — el motor
  // ya no trae las reglas hardcodeadas importadas: se consultan una sola
  // vez acá, al entrar a este bloque (mismo momento en que antes se
  // ejecutaba la inferencia de forma síncrona). Item Especificación de
  // Finalidad (SMG, 02-sep-2026) — además del rules-endpoint, se consulta
  // el catálogo de finalidades (Nivel 1) para resolver code -> label, que
  // wizard_finalidad_templates no trae (solo el code).
  useEffect(() => {
    if (seededRef.current || !companyId) return;
    seededRef.current = true;
    setLoading(true);
    Promise.all([fetchWizardInferenceRules(companyId), fetchTreatmentPurposes(companyId)])
      .then(([rulesRes, purposesRes]) => {
        if (rulesRes.error || !rulesRes.data) {
          toast.error("No se pudieron cargar las reglas del wizard. Intenta recargar la página.");
          return;
        }
        const rules = buildRuleSet(rulesRes.data);
        const purposeNivel1Labels = new Map((purposesRes.data ?? []).map((p) => [p.code, p.label]));
        setTreatments(
          mergeInferredTreatments(
            state.treatments,
            inferTreatmentsFromAnswers(state.answers, state.systems, rules, {
              companyName: companyName?.trim() || "la empresa",
              purposeNivel1Labels,
            })
          )
        );
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  function goToTreatments() {
    setCurrentQuestion(blockStartQuestion);
    router.push(getWizardBlockQuestionPath(BLOCK_NUM, blockStartQuestion));
  }

  function goToBiometricConsent() {
    if (isEditing) {
      router.push(WIZARD_COMPLETION_PATH);
      return;
    }
    const nextQuestion = blockStartQuestion + 1;
    setCurrentQuestion(nextQuestion);
    router.push(getWizardBlockQuestionPath(BLOCK_NUM, nextQuestion));
  }

  function goToDpo() {
    if (isEditing) {
      router.push(WIZARD_COMPLETION_PATH);
      return;
    }
    const dpoQuestion = blockStartQuestion + 2;
    setCurrentQuestion(dpoQuestion);
    router.push(getWizardBlockQuestionPath(BLOCK_NUM, dpoQuestion));
  }

  function goToPreviousBlock() {
    router.push(getWizardBlockQuestionPath(4, blockStartQuestion - 1));
  }

  if (showDpo) {
    return (
      <DpoForm
        value={state.dpoForm}
        onChange={setDpoForm}
        onPrevious={goToBiometricConsent}
        onNext={() => router.push(WIZARD_COMPLETION_PATH)}
        showPreviousButton
      />
    );
  }

  if (showBiometricConsent) {
    return (
      <WizardBiometricConsentStep
        treatments={state.treatments}
        isLoading={state.isLoading}
        onPrevious={goToTreatments}
        onNext={goToDpo}
      />
    );
  }

  return (
    <TreatmentSummary
      treatments={state.treatments}
      onChange={setTreatments}
      isLoading={state.isLoading}
      onPrevious={goToPreviousBlock}
      onNext={goToBiometricConsent}
    />
  );
}
