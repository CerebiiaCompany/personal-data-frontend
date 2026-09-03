import { useRouter } from "next/navigation";
import { useWizardContext } from "@/contexts/WizardContext";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useWizardError } from "@/hooks/useWizardError";
import { saveWizardAnswer } from "@/lib/wizardSession.api";
import { getWizardBlockQuestionPath, WIZARD_COMPLETION_PATH } from "@/utils/wizardRoutes";
import { WIZARD_TOTAL_QUESTIONS, WizardAnswers, WizardQuestionDefinition } from "@/types/wizardRisk.types";

function isQuestionVisible(question: WizardQuestionDefinition, answers: WizardAnswers): boolean {
  if (question.showIf) return question.showIf(answers);
  if (question.hideIf) return !question.hideIf(answers);
  return true;
}

interface UseWizardBlockQuestionsParams {
  blockNum: number;
  /** Primera pregunta global (1-30) de este bloque. */
  blockStartQuestion: number;
  questions: WizardQuestionDefinition[];
}

/**
 * Lógica compartida por cada WizardBlockN (usada desde Batch 4, ver
 * WizardBlock1.tsx como el primer caso): mapea `state.currentQuestion`
 * (global) a la pregunta visible correspondiente dentro del bloque —
 * filtrando por `showIf`/`hideIf` — guarda la respuesta al avanzar y
 * navega al bloque siguiente al terminar las visibles de este.
 *
 * El backend no sabe de condicionales ni de límites de bloque: una
 * pregunta oculta nunca se guarda ni "consume" un número de pregunta —
 * por eso navegar siempre indexa sobre `visibleQuestions` (ya filtrada),
 * en vez de intentar "saltar" preguntas ocultas sobre el arreglo crudo.
 *
 * "Anterior" se oculta en la primera pregunta VISIBLE de cada bloque (no
 * solo en la primera de todo el wizard) — cruzar hacia atrás al bloque
 * anterior no está soportado todavía (ningún batch lo pidió y el bloque
 * previo podría tener su propio conteo de visibles que este hook no
 * conoce); cada WizardBlockN decide ocultar su botón "Anterior" con
 * `isFirstQuestion`.
 */
export function useWizardBlockQuestions({
  blockNum,
  blockStartQuestion,
  questions,
}: UseWizardBlockQuestionsParams) {
  const router = useRouter();
  const { state, updateAnswer, setLoading } = useWizardContext();
  const companyId = useActiveCompanyId();
  const { showBlockingError } = useWizardError();

  const visibleQuestions = questions.filter((q) => isQuestionVisible(q, state.answers));
  const localIndex = state.currentQuestion - blockStartQuestion;
  const question = visibleQuestions[localIndex];
  const isFirstQuestion = localIndex <= 0;

  function goToLocalIndex(nextIndex: number) {
    if (nextIndex >= visibleQuestions.length) {
      const nextGlobalQuestion = blockStartQuestion + visibleQuestions.length;
      if (nextGlobalQuestion > WIZARD_TOTAL_QUESTIONS) {
        // No queda una pregunta 31: se respondió la última de las 30 (el
        // backend ya puso status=VALIDATING). Bloques 4-5 no son pantallas
        // de pregunta/respuesta (ver constants/wizardBlocks.ts) — la salida
        // natural de "terminé todas las preguntas" es la finalización.
        router.push(WIZARD_COMPLETION_PATH);
        return;
      }
      router.push(getWizardBlockQuestionPath(blockNum + 1, nextGlobalQuestion));
      return;
    }
    router.push(getWizardBlockQuestionPath(blockNum, blockStartQuestion + Math.max(nextIndex, 0)));
  }

  async function handleNext() {
    if (!question || !companyId || !state.sessionId) return;

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

    goToLocalIndex(localIndex + 1);
  }

  function handlePrevious() {
    goToLocalIndex(localIndex - 1);
  }

  return {
    question,
    isFirstQuestion,
    localIndex,
    visibleCount: visibleQuestions.length,
    isLoading: state.isLoading,
    currentAnswer: question ? state.answers[question.questionKey] : undefined,
    handleAnswer: (value: string[]) => {
      if (question) updateAnswer(question.questionKey, value);
    },
    handleNext,
    handlePrevious,
  };
}
