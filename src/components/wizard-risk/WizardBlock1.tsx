"use client";

import { useRouter } from "next/navigation";
import { useWizardContext } from "@/contexts/WizardContext";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useWizardError } from "@/hooks/useWizardError";
import { saveWizardAnswer } from "@/lib/wizardSession.api";
import { BLOCK1_QUESTIONS } from "@/constants/wizard-blocks/block1Questions";
import { getWizardBlockQuestionPath } from "@/utils/wizardRoutes";
import QuestionCard from "./QuestionCard";

const BLOCK1_FIRST_QUESTION = 1;
const BLOCK1_LAST_QUESTION = BLOCK1_QUESTIONS.length; // 5 (preguntas globales 1-5 de 30)
// No hay todavía un Bloque 2 real (llega en Batch 5); se navega directo a su
// primera pregunta al terminar el Bloque 1 en vez de mostrar una transición
// (esa pantalla interstitial es responsabilidad de un batch posterior).
const NEXT_BLOCK_NUM = 2;

/**
 * Bloque 1 — Perfil de la Organización. Mapea `state.currentQuestion`
 * (global, 1-30) a su pregunta dentro de BLOCK1_QUESTIONS y la renderiza
 * con <QuestionCard>, guardando cada respuesta en el backend al avanzar.
 */
export default function WizardBlock1() {
  const router = useRouter();
  const { state, updateAnswer, setLoading } = useWizardContext();
  const companyId = useActiveCompanyId();
  const { showBlockingError } = useWizardError();

  const question = BLOCK1_QUESTIONS[state.currentQuestion - BLOCK1_FIRST_QUESTION];

  if (!question) {
    // state.currentQuestion fuera del rango de este bloque (estado
    // inconsistente, p. ej. URL editada a mano) — nada seguro que renderizar.
    return null;
  }

  function goToQuestion(questionNum: number) {
    const blockNum = questionNum > BLOCK1_LAST_QUESTION ? NEXT_BLOCK_NUM : 1;
    router.push(getWizardBlockQuestionPath(blockNum, questionNum));
  }

  async function handleNext() {
    if (!companyId || !state.sessionId) return;

    setLoading(true);
    const res = await saveWizardAnswer(
      companyId,
      state.sessionId,
      question.questionKey,
      state.answers[question.questionKey] ?? []
    );
    setLoading(false);

    if (res.error) {
      showBlockingError("ERR_05");
      return;
    }

    goToQuestion(state.currentQuestion + 1);
  }

  const isFirstQuestion = state.currentQuestion <= BLOCK1_FIRST_QUESTION;

  return (
    <QuestionCard
      key={question.questionKey}
      questionKey={question.questionKey}
      questionText={question.questionText}
      helpText={question.helpText}
      tooltipWhy={question.tooltipWhy}
      type={question.type}
      options={question.options}
      currentAnswer={state.answers[question.questionKey]}
      isLoading={state.isLoading}
      onAnswer={(value) => updateAnswer(question.questionKey, value)}
      onPrevious={isFirstQuestion ? undefined : () => goToQuestion(state.currentQuestion - 1)}
      onNext={handleNext}
      showPreviousButton={!isFirstQuestion}
    />
  );
}
