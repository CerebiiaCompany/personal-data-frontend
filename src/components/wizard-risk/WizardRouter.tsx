"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWizardContext } from "@/contexts/WizardContext";
import { isValidWizardBlock, isValidWizardQuestion, getWizardBlockQuestionPath } from "@/utils/wizardRoutes";
import { getWizardBlockStartQuestion, resolveWizardBlockForQuestion } from "@/constants/wizardBlocks";
import WizardContainer from "./WizardContainer";

type WizardRouteSegment = "bienvenida" | "block" | "finalizacion";

interface WizardRouterProps {
  segment: WizardRouteSegment;
  blockNum?: number;
  questionNum?: number;
}

/**
 * Puente entre las rutas de Next.js (app/wizard/**) y el WizardContext.
 * Next.js resuelve el deep-linking vía filesystem; este componente valida
 * los parámetros de la URL y sincroniza bloque/pregunta hacia el contexto.
 */
export default function WizardRouter({ segment, blockNum, questionNum }: WizardRouterProps) {
  const router = useRouter();
  const { state, setCurrentBlock, setCurrentQuestion } = useWizardContext();

  useEffect(() => {
    if (segment !== "block") return;
    if (blockNum === undefined || questionNum === undefined) return;

    if (!isValidWizardBlock(blockNum) || !isValidWizardQuestion(questionNum)) {
      router.replace(getWizardBlockQuestionPath(state.currentBlock, state.currentQuestion));
      return;
    }

    // El bloque de la URL nunca se toma como verdad por sí solo — se deriva
    // de questionNum (ver wizardBlocks.ts) para no quedar en un bloque sin
    // preguntas propias (p. ej. tras cruzar de bloque, ver useWizardSession).
    // Una URL con el bloque "equivocado" para su pregunta se autocorrige.
    const correctBlock = resolveWizardBlockForQuestion(questionNum, state.answers);
    if (blockNum !== correctBlock) {
      router.replace(getWizardBlockQuestionPath(correctBlock, questionNum));
      return;
    }

    // CE-05 (Batch 11) — bypass por URL: no dejar saltar a una pregunta
    // más allá del progreso real ya guardado (p. ej. ir directo a
    // /bloque/5/pregunta/46 sin haber respondido las anteriores).
    // `state.sessionId` sigue null hasta que la sesión termina de
    // hidratarse (ver useWizardSession) — sin ese guard, esta validación
    // se ejecutaría contra el currentQuestion=1 por defecto de
    // initialState en cada carga y mandaría a cualquiera de vuelta a la
    // pregunta 1, incluso reabriendo su propia posición ya avanzada.
    //
    // No se valida clave por clave contra `answers` (como sugería el
    // pseudocódigo original) porque varias preguntas de Bloque 3 y 5 son
    // condicionales (showIf/hideIf) y legítimamente nunca se responden —
    // useWizardBlockQuestions ya colapsa esos huecos indexando sobre
    // `visibleQuestions`, así que el único avance real por click de
    // "Siguiente" es siempre exactamente currentQuestion+1 (ver ese hook).
    // Cualquier salto mayor a ese +1 es, por definición, un bypass.
    //
    // Excepción Bloque 5: tiene 3 slots (validación de tratamientos, consentimiento
    // biométrico C-01, formulario DPO). Una vez que la sesión llegó a Bloque 5,
    // transicionar entre sus slots es el flujo normal y no un bypass.
    const block5Start = getWizardBlockStartQuestion(5, state.answers);
    const isWithinBlock5 =
      correctBlock === 5 &&
      state.currentQuestion >= block5Start &&
      questionNum <= block5Start + 2;

    if (state.sessionId && !isWithinBlock5 && questionNum > state.currentQuestion + 1) {
      router.replace(getWizardBlockQuestionPath(state.currentBlock, state.currentQuestion));
      return;
    }

    if (correctBlock !== state.currentBlock) setCurrentBlock(correctBlock);
    if (questionNum !== state.currentQuestion) setCurrentQuestion(questionNum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment, blockNum, questionNum, state.sessionId, state.currentQuestion, state.answers]);

  return <WizardContainer segment={segment} />;
}
