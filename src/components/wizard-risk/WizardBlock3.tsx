"use client";

import { useWizardBlockQuestions } from "@/hooks/useWizardBlockQuestions";
import { useWizardContext } from "@/contexts/WizardContext";
import { getWizardBlockStartQuestion } from "@/constants/wizardBlocks";
import { BLOCK3_QUESTIONS } from "@/constants/wizard-blocks/block3Questions";
import QuestionCard from "./QuestionCard";

const BLOCK_NUM = 3;

/**
 * Bloque 3 — Inventario de Tratamientos. La cantidad visible depende de
 * B1-P2 (empleados) y B2-P9 (marketing). useWizardBlockQuestions filtra
 * por showIf antes de indexar.
 */
export default function WizardBlock3() {
  const { state } = useWizardContext();
  const {
    question,
    isFirstOfWizard,
    currentAnswer,
    isLoading,
    handleAnswer,
    handleNext,
    handlePrevious,
  } = useWizardBlockQuestions({
    blockNum: BLOCK_NUM,
    blockStartQuestion: getWizardBlockStartQuestion(BLOCK_NUM, state.answers),
    questions: BLOCK3_QUESTIONS,
  });

  if (!question) {
    return null;
  }

  return (
    <QuestionCard
      key={question.questionKey}
      questionKey={question.questionKey}
      questionText={question.questionText}
      helpText={question.helpText}
      tooltipWhy={question.tooltipWhy}
      type={question.type}
      options={question.options}
      conditionalFieldsByOption={question.conditionalFieldsByOption}
      currentAnswer={currentAnswer}
      isLoading={isLoading}
      onAnswer={handleAnswer}
      onPrevious={isFirstOfWizard ? undefined : handlePrevious}
      onNext={handleNext}
      showPreviousButton={!isFirstOfWizard}
    />
  );
}
