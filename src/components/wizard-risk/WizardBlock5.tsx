"use client";

import { useWizardBlockQuestions } from "@/hooks/useWizardBlockQuestions";
import { useWizardContext } from "@/contexts/WizardContext";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useWizardError } from "@/hooks/useWizardError";
import { saveWizardAnswer } from "@/lib/wizardSession.api";
import { BLOCK5_DPO_QUESTION, BLOCK5_TREATMENT_CARDS } from "@/constants/wizard-blocks/block5Questions";
import TreatmentCard from "./TreatmentCard";
import QuestionCard from "./QuestionCard";

const BLOCK_NUM = 5;
const BLOCK_START_QUESTION = 37; // tarjetas de tratamiento 37-46 (hasta 10, condicionales), DPO al final

/**
 * Bloque 5 — tarjetas de tratamiento (condicionales, Batch 8) + selector
 * de DPO (Batch 9), siguiendo el mismo patrón "lista + 1 paso extra" que
 * WizardBlock4 (systems). Al terminar el DPO, `advanceBeyondBlock` navega
 * a /wizard/finalizacion porque este ya es el último bloque
 * (WIZARD_TOTAL_BLOCKS) — no hay Bloque 6.
 */
export default function WizardBlock5() {
  const { state, updateAnswer, setCurrentQuestion, setLoading } = useWizardContext();
  const companyId = useActiveCompanyId();
  const { showBlockingError } = useWizardError();

  const {
    question: card,
    isFirstQuestion,
    currentAnswer,
    isLoading,
    handleAnswer,
    handleNext,
    handlePrevious,
    advanceBeyondBlock,
  } = useWizardBlockQuestions({
    blockNum: BLOCK_NUM,
    blockStartQuestion: BLOCK_START_QUESTION,
    questions: BLOCK5_TREATMENT_CARDS,
    onBlockComplete: (visibleCount) => setCurrentQuestion(BLOCK_START_QUESTION + visibleCount),
  });

  async function handleDpoNext() {
    if (!companyId || !state.sessionId) return;

    setLoading(true);
    const res = await saveWizardAnswer(
      companyId,
      state.sessionId,
      BLOCK5_DPO_QUESTION.questionKey,
      state.answers[BLOCK5_DPO_QUESTION.questionKey] ?? []
    );
    setLoading(false);

    if (res.error) {
      showBlockingError("ERR_05");
      return;
    }

    advanceBeyondBlock(1);
  }

  // `!card` cubre tanto la retoma en frío en el paso de DPO como la
  // transición en vivo justo después de la última tarjeta visible.
  if (!card) {
    return (
      <QuestionCard
        key={BLOCK5_DPO_QUESTION.questionKey}
        questionKey={BLOCK5_DPO_QUESTION.questionKey}
        questionText={BLOCK5_DPO_QUESTION.questionText}
        helpText={BLOCK5_DPO_QUESTION.helpText}
        type={BLOCK5_DPO_QUESTION.type}
        options={BLOCK5_DPO_QUESTION.options}
        currentAnswer={state.answers[BLOCK5_DPO_QUESTION.questionKey]}
        isLoading={state.isLoading}
        onAnswer={(value) => updateAnswer(BLOCK5_DPO_QUESTION.questionKey, value)}
        onPrevious={handlePrevious}
        onNext={handleDpoNext}
        showPreviousButton
      />
    );
  }

  return (
    <TreatmentCard
      card={card}
      currentAnswer={currentAnswer}
      isLoading={isLoading}
      onAnswer={handleAnswer}
      onPrevious={isFirstQuestion ? undefined : handlePrevious}
      onNext={handleNext}
      showPreviousButton={!isFirstQuestion}
    />
  );
}
