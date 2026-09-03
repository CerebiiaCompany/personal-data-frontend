"use client";

import { useWizardBlockQuestions } from "@/hooks/useWizardBlockQuestions";
import { BLOCK2_QUESTIONS } from "@/constants/wizard-blocks/block2Questions";
import { isOptionalSingleCheckbox } from "@/utils/wizardQuestionHelpers";
import QuestionCard from "./QuestionCard";

const BLOCK_NUM = 2;
const BLOCK_START_QUESTION = 6; // preguntas globales 6-15 de 30

/**
 * Bloque 2 — Diagnóstico Inicial de Riesgo. Todas sus preguntas son
 * checkboxes booleanos opcionales (ver isOptionalSingleCheckbox): no
 * marcarlas es una respuesta válida ("No"), así que se fuerza
 * `canGoNext=true` en vez de dejar que QuestionCard exija selección.
 */
export default function WizardBlock2() {
  const { question, isFirstQuestion, currentAnswer, isLoading, handleAnswer, handleNext, handlePrevious } =
    useWizardBlockQuestions({
      blockNum: BLOCK_NUM,
      blockStartQuestion: BLOCK_START_QUESTION,
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
      currentAnswer={currentAnswer}
      isLoading={isLoading}
      onAnswer={handleAnswer}
      onPrevious={isFirstQuestion ? undefined : handlePrevious}
      onNext={handleNext}
      showPreviousButton={!isFirstQuestion}
      canGoNext={isOptionalSingleCheckbox(question) ? true : undefined}
    />
  );
}
