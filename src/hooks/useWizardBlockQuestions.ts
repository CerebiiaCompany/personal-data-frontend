import { useRouter } from "next/navigation";
import { useWizardContext } from "@/contexts/WizardContext";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useWizardError } from "@/hooks/useWizardError";
import { saveWizardAnswer } from "@/lib/wizardSession.api";
import { getWizardBlockQuestionPath, WIZARD_COMPLETION_PATH } from "@/utils/wizardRoutes";
import { withMinTransitionDelay } from "@/utils/wizardTransitionDelay";
import { WIZARD_TOTAL_BLOCKS, WizardAnswers } from "@/types/wizardRisk.types";

/** Lo mínimo que este hook necesita de cada "pregunta" — cumplido tanto
 * por WizardQuestionDefinition (Bloques 1-4) como por TreatmentCardDefinition
 * (Bloque 5, ver TreatmentCard.tsx). */
interface WizardBlockStep {
  questionKey: string;
  showIf?: (answers: WizardAnswers) => boolean;
  hideIf?: (answers: WizardAnswers) => boolean;
}

function isQuestionVisible(question: WizardBlockStep, answers: WizardAnswers): boolean {
  if (question.showIf) return question.showIf(answers);
  if (question.hideIf) return !question.hideIf(answers);
  return true;
}

interface UseWizardBlockQuestionsParams<T extends WizardBlockStep> {
  blockNum: number;
  /** Primera pregunta global (1-30) de este bloque. */
  blockStartQuestion: number;
  questions: T[];
  /**
   * Si se define, se llama (con la cantidad de preguntas visibles de este
   * bloque, para que quien la use no tenga que recomputarla) en vez de
   * navegar automáticamente al agotar las preguntas visibles — para
   * bloques con un paso extra que no es una QuestionCard más (ver
   * WizardBlock4.tsx: 5 preguntas + tabla de sistemas antes del Bloque 5).
   */
  onBlockComplete?: (visibleCount: number) => void;
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
 * "Anterior" en la primera pregunta visible del bloque vuelve al último
 * slot del bloque previo. Solo se oculta en la primera pregunta de todo
 * el wizard (`isFirstOfWizard`).
 */
export function useWizardBlockQuestions<T extends WizardBlockStep>({
  blockNum,
  blockStartQuestion,
  questions,
  onBlockComplete,
}: UseWizardBlockQuestionsParams<T>) {
  const router = useRouter();
  const { state, updateAnswer, setLoading } = useWizardContext();
  const companyId = useActiveCompanyId();
  const { showBlockingError } = useWizardError();

  const visibleQuestions = questions.filter((q) => isQuestionVisible(q, state.answers));
  const localIndex = state.currentQuestion - blockStartQuestion;
  const question = visibleQuestions[localIndex];
  const isFirstQuestion = localIndex <= 0;
  const isFirstOfWizard = blockNum <= 1 && localIndex <= 0;

  function goToLocalIndex(nextIndex: number) {
    if (nextIndex >= visibleQuestions.length) {
      if (onBlockComplete) {
        // La URL debe reflejar el número de pregunta global del paso extra
        // (tabla de sistemas / selector de DPO) — si no, el efecto de
        // WizardRouter (que sincroniza el estado DESDE la URL en cada
        // render) ve un `questionNum` desactualizado y revierte el
        // `currentQuestion` que `onBlockComplete` acaba de avanzar,
        // rompiendo el guard anti-bypass en la navegación siguiente.
        router.push(getWizardBlockQuestionPath(blockNum, blockStartQuestion + visibleQuestions.length));
        onBlockComplete(visibleQuestions.length);
        return;
      }
      // OJO: no comparar contra WIZARD_TOTAL_QUESTIONS (es un techo fijo,
      // pero Bloque 3 y Bloque 5 tienen cantidad de preguntas VISIBLES
      // variable por condicionales — para alguien con pocos factores de
      // riesgo, blockStartQuestion + visibleQuestions.length nunca llega a
      // ese techo aunque el bloque sí haya terminado). Lo único confiable
      // es si éste es o no el último bloque con contenido real.
      if (blockNum >= WIZARD_TOTAL_BLOCKS) {
        router.push(WIZARD_COMPLETION_PATH);
        return;
      }
      router.push(getWizardBlockQuestionPath(blockNum + 1, blockStartQuestion + visibleQuestions.length));
      return;
    }
    router.push(getWizardBlockQuestionPath(blockNum, blockStartQuestion + Math.max(nextIndex, 0)));
  }

  async function handleNext() {
    if (!question || !companyId || !state.sessionId) return;
    const sessionId = state.sessionId;

    setLoading(true);
    const res = await withMinTransitionDelay(() =>
      saveWizardAnswer(companyId, sessionId, question.questionKey, state.answers[question.questionKey] ?? [])
    );
    setLoading(false);

    if (res.error) {
      showBlockingError("ERR_05");
      return;
    }

    goToLocalIndex(localIndex + 1);
  }

  function handlePrevious() {
    if (localIndex <= 0) {
      if (blockNum <= 1) return;
      router.push(getWizardBlockQuestionPath(blockNum - 1, Math.max(blockStartQuestion - 1, 1)));
      return;
    }
    goToLocalIndex(localIndex - 1);
  }

  /**
   * Para bloques con pasos extra no basados en QuestionCard (ver
   * `onBlockComplete`): navega más allá de este bloque una vez que esos
   * pasos ya se guardaron y consumieron `extraStepsConsumed` números de
   * pregunta globales adicionales (p. ej. la tabla de sistemas = 1).
   */
  function advanceBeyondBlock(extraStepsConsumed: number) {
    if (blockNum >= WIZARD_TOTAL_BLOCKS) {
      router.push(WIZARD_COMPLETION_PATH);
      return;
    }
    router.push(
      getWizardBlockQuestionPath(blockNum + 1, blockStartQuestion + visibleQuestions.length + extraStepsConsumed)
    );
  }

  return {
    question,
    isFirstQuestion,
    isFirstOfWizard,
    localIndex,
    visibleCount: visibleQuestions.length,
    isLoading: state.isLoading,
    currentAnswer: question ? state.answers[question.questionKey] : undefined,
    handleAnswer: (value: string[]) => {
      if (question) updateAnswer(question.questionKey, value);
    },
    handleNext,
    handlePrevious,
    advanceBeyondBlock,
  };
}
