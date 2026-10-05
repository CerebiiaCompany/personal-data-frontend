"use client";

import { useWizardBlockQuestions } from "@/hooks/useWizardBlockQuestions";
import { useWizardContext } from "@/contexts/WizardContext";
import { getWizardBlockStartQuestion } from "@/constants/wizardBlocks";
import { BLOCK1_QUESTIONS } from "@/constants/wizard-blocks/block1Questions";
import QuestionCard from "./QuestionCard";

const BLOCK_NUM = 1;

/**
 * Bloque 1 — Perfil de la Organización. Ver useWizardBlockQuestions para
 * la lógica compartida de navegación/guardado entre bloques.
 */
export default function WizardBlock1() {
  const { state } = useWizardContext();
  const { question, isFirstOfWizard, currentAnswer, isLoading, handleAnswer, handleNext, handlePrevious } =
    useWizardBlockQuestions({
      blockNum: BLOCK_NUM,
      blockStartQuestion: getWizardBlockStartQuestion(BLOCK_NUM, state.answers),
      questions: BLOCK1_QUESTIONS,
    });

  if (!question) {
    // state.currentQuestion fuera del rango de este bloque (estado
    // inconsistente, p. ej. URL editada a mano) — nada seguro que renderizar.
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
