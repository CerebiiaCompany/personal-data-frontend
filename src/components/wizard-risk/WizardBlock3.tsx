"use client";

import { useWizardBlockQuestions } from "@/hooks/useWizardBlockQuestions";
import { BLOCK3_QUESTIONS } from "@/constants/wizard-blocks/block3Questions";
import { isOptionalSingleCheckbox } from "@/utils/wizardQuestionHelpers";
import QuestionCard from "./QuestionCard";

const BLOCK_NUM = 3;
const BLOCK_START_QUESTION = 16; // preguntas globales 16-30 de 30

/**
 * Bloque 3 — Inventario de Tratamientos. A diferencia de los Bloques 1-2,
 * su cantidad real de preguntas varía según condicionales (Batch 6) — ver
 * block3Questions.ts. useWizardBlockQuestions ya filtra por esos
 * condicionales antes de indexar, así que "Siguiente"/"Anterior" navegan
 * naturalmente solo entre preguntas visibles, sin lógica extra de salto.
 */
export default function WizardBlock3() {
  const {
    question,
    isFirstQuestion,
    localIndex,
    visibleCount,
    currentAnswer,
    isLoading,
    handleAnswer,
    handleNext,
    handlePrevious,
  } = useWizardBlockQuestions({
    blockNum: BLOCK_NUM,
    blockStartQuestion: BLOCK_START_QUESTION,
    questions: BLOCK3_QUESTIONS,
  });

  if (!question) {
    return null;
  }

  return (
    <div>
      <p className="mx-auto w-full max-w-[700px] px-4 pt-4 text-xs text-stone-400 sm:px-6 md:px-8">
        Pregunta {localIndex + 1} de {visibleCount} en este bloque
      </p>
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
    </div>
  );
}
