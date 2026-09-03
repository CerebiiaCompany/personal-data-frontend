"use client";

import { useState } from "react";
import { useWizardBlockQuestions } from "@/hooks/useWizardBlockQuestions";
import { useWizardContext } from "@/contexts/WizardContext";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useWizardError } from "@/hooks/useWizardError";
import { saveWizardSystems } from "@/lib/wizardSession.api";
import { BLOCK4_QUESTIONS } from "@/constants/wizard-blocks/block4Questions";
import QuestionCard from "./QuestionCard";
import SystemsTable from "./SystemsTable";

const BLOCK_NUM = 4;
const BLOCK_START_QUESTION = 31; // preguntas globales 31-35 de 47

/**
 * Bloque 4 — Inventario de Sistemas. Las 5 preguntas (B4-P31..P35) usan
 * useWizardBlockQuestions como cualquier otro bloque; al terminarlas se
 * muestra la tabla de sistemas (SystemsTable) en vez de navegar
 * automáticamente al Bloque 5 — es un paso más, pero no una QuestionCard,
 * así que se guarda por separado (PATCH .../systems) y consume su propio
 * número de pregunta global (36) antes de pasar al Bloque 5 (37).
 */
export default function WizardBlock4() {
  const [showSystemsTable, setShowSystemsTable] = useState(false);
  const { state, setSystems, setCurrentQuestion, setLoading } = useWizardContext();
  const companyId = useActiveCompanyId();
  const { showBlockingError } = useWizardError();

  const {
    question,
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
    questions: BLOCK4_QUESTIONS,
    onBlockComplete: (visibleCount) => {
      setCurrentQuestion(BLOCK_START_QUESTION + visibleCount);
      setShowSystemsTable(true);
    },
  });

  async function handleSystemsNext() {
    if (!companyId || !state.sessionId) return;

    setLoading(true);
    const res = await saveWizardSystems(companyId, state.sessionId, state.systems);
    setLoading(false);

    if (res.error) {
      showBlockingError("ERR_05");
      return;
    }

    advanceBeyondBlock(1);
  }

  // `!question` cubre la retoma en frío (currentQuestion ya en 36, fuera
  // del rango de las 5 preguntas); `showSystemsTable` cubre la transición
  // en vivo justo después de guardar B4-P35 (currentQuestion recién se
  // actualizó arriba, en el mismo tick).
  if (showSystemsTable || !question) {
    return (
      <SystemsTable
        systems={state.systems}
        onChange={setSystems}
        isLoading={state.isLoading}
        onPrevious={() => setShowSystemsTable(false)}
        onNext={handleSystemsNext}
      />
    );
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
    />
  );
}
