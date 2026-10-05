"use client";

import { useWizardBlockQuestions } from "@/hooks/useWizardBlockQuestions";
import { useWizardContext } from "@/contexts/WizardContext";
import { getWizardBlockStartQuestion } from "@/constants/wizardBlocks";
import { BLOCK2_QUESTIONS } from "@/constants/wizard-blocks/block2Questions";
import QuestionCard from "./QuestionCard";

const BLOCK_NUM = 2;

/**
 * Bloque 2 — Diagnóstico Inicial de Riesgo. Selección múltiple con opción
 * "No" exclusiva; QuestionCard exige al menos una selección.
 */
export default function WizardBlock2() {
  const { state } = useWizardContext();
  const { question, isFirstOfWizard, currentAnswer, isLoading, handleAnswer, handleNext, handlePrevious } =
    useWizardBlockQuestions({
      blockNum: BLOCK_NUM,
      blockStartQuestion: getWizardBlockStartQuestion(BLOCK_NUM, state.answers),
      questions: BLOCK2_QUESTIONS,
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
