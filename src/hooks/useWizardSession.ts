import { useEffect, useRef, useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useWizardContext } from "@/contexts/WizardContext";
import { createOrResumeWizardSession } from "@/lib/wizardSession.api";
import { WizardAnswers } from "@/types/wizardRisk.types";
import { resolveWizardBlockForQuestion } from "@/constants/wizardBlocks";
import { hydrateSystemRecord } from "@/utils/wizardInference";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // 1s, 2s, 4s

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface UseWizardSessionResult {
  sessionId: string | null;
  resume: boolean;
  /** Batch 10 — status crudo del backend (createOrResumeWizardSession), no el `state.status` del contexto (ver WizardContext, nunca actualizado tras confirmar). */
  status: string;
  currentBlock: number;
  currentQuestion: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Crea o retoma la sesión del wizard al montar. Reintenta ante error de red
 * hasta 3 veces con backoff exponencial (1s, 2s, 4s) antes de rendirse.
 */
export function useWizardSession(): UseWizardSessionResult {
  const {
    state,
    initializeSession,
    setCurrentBlock,
    setCurrentQuestion,
    updateAnswer,
    setSystems,
    setError: setContextError,
  } = useWizardContext();
  const userId = useSessionStore((store) => store.user?._id);
  const companyId = useActiveCompanyId();

  const [resume, setResume] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!companyId || !userId) return;
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(null);

      let lastMessage = "No se pudo iniciar la sesión del wizard.";

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const res = await createOrResumeWizardSession(companyId!);

        if (res.data) {
          if (cancelled) return;
          const { sessionId, status: sessionStatus, currentQuestion, resume: didResume, answersSoFar, systemsSoFar } = res.data;

          initializeSession(sessionId, companyId!, userId!);
          // El backend no rastrea límites de bloque (ver wizardBlocks.ts) —
          // el bloque real siempre se deriva de currentQuestion, nunca del
          // currentBlock que devuelve la sesión. Se usa `answersSoFar`
          // (la respuesta recién llegada), no `state.answers`: todavía no
          // se hidrató en el contexto en este punto del efecto, así que
          // leerlo acá daría un objeto vacío/desactualizado.
          setCurrentBlock(resolveWizardBlockForQuestion(currentQuestion, answersSoFar ?? {}));
          setCurrentQuestion(currentQuestion);
          if (answersSoFar) {
            hydrateAnswers(answersSoFar, updateAnswer);
          }
          if (systemsSoFar) {
            setSystems(systemsSoFar.map(hydrateSystemRecord));
          }
          setResume(didResume);
          setStatus(sessionStatus);
          setIsLoading(false);
          return;
        }

        const code = res.error?.code;
        lastMessage = res.error?.message ?? lastMessage;
        const isAuthOrPermission = code === "auth/unauthenticated" || code === "auth/unauthorized";
        if (isAuthOrPermission) break;

        const isRetryable =
          code === "http/network-error" || code === "http/unavailable" || code === "http/timeout";
        if (!isRetryable || attempt === MAX_RETRIES) break;

        await delay(BASE_DELAY_MS * 2 ** attempt);
      }

      if (cancelled) return;
      const err = new Error(lastMessage);
      setError(err);
      setContextError("ERR-05", lastMessage);
      setIsLoading(false);
    }

    void run();

    return () => {
      cancelled = true;
      // Batch 10 — si este efecto se limpia (Strict Mode en desarrollo lo
      // hace sintéticamente en cada montaje, y WizardContainer se
      // desmonta/remonta en cada transición entre /wizard/bloque,
      // /wizard/bienvenida y /wizard/finalizacion), se libera el guard para
      // que el remontaje real dispare su propio fetch sin `cancelled`
      // heredado. Sin esto, el resultado del fetch en vuelo se descarta
      // silenciosamente (por `cancelled`) y el remontaje no lo reintenta
      // (por `startedRef`), dejando sessionStatus/resume atascados en su
      // valor inicial para siempre.
      startedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, userId]);

  return {
    sessionId: state.sessionId,
    resume,
    status,
    currentBlock: state.currentBlock,
    currentQuestion: state.currentQuestion,
    isLoading,
    error,
  };
}

function hydrateAnswers(
  answers: WizardAnswers,
  updateAnswer: (questionKey: string, answerValue: string[]) => void
) {
  for (const [questionKey, value] of Object.entries(answers)) {
    updateAnswer(questionKey, value);
  }
}
